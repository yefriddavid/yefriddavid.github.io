// backfill-crypto-purchase-field — one-time backfill: sets a Binance-trade-derived
// field on existing Finance_Crypto_Purchases docs synced before that field
// existed (see scripts/sync-crypto-purchases/main.go).
//
// Supported --field values:
//
//	purchaseTime    the trade's HH:mm:ss (only the date half was ever written)
//	binanceOrderId  Binance's order id — fills that came from the same order
//	                (e.g. "buy 5" executing as 1 + 2 + 1.5 + 0.5) share it, so
//	                records with matching (platform, symbol, binanceOrderId)
//	                are the same order.
//
// Both values live only in Binance's trade history, not in Firestore, so
// they have to be re-fetched: each synced doc keeps its trade id in
// binanceTradeId ("PAIR-tradeId"), and this script re-queries the account's
// trade history for that pair and matches by id.
//
// Docs with no binanceTradeId (manual entries: Muun, Phoenix, WOS, …) aren't
// from Binance and have nothing to recover — they're skipped.
//
// Credentials are account-specific, so run once per platform:
//
//	go run . --field purchaseTime   --platform binance_arg --api-key ... --secret-key ... [--apply]
//	go run . --field binanceOrderId --platform binance_col --api-key ... --secret-key ... [--apply]
//
// Without --apply it only prints the plan (dry run).
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"github.com/adshao/go-binance/v2"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const (
	collectionName  = "Finance_Crypto_Purchases"
	defaultTenantID = "Atlfc1jvEUbLsintnpAq"
	defaultPlatform = "binance_arg"
	pageLimit       = 1000
)

var supportedFields = map[string]bool{"purchaseTime": true, "binanceOrderId": true}

// hasField reports whether doc data already carries a real value for `field`.
func hasField(data map[string]interface{}, field string) bool {
	switch field {
	case "purchaseTime":
		v, ok := data[field].(string)
		return ok && v != ""
	case "binanceOrderId":
		v, ok := data[field].(int64)
		return ok && v != 0
	}
	return false
}

// fieldValue extracts `field` from a re-fetched Binance trade.
func fieldValue(t *binance.TradeV3, field string) interface{} {
	switch field {
	case "purchaseTime":
		return time.UnixMilli(t.Time).Format("15:04:05")
	case "binanceOrderId":
		return t.OrderID
	}
	return nil
}

// allTrades pages through the full trade history of `symbol` via the fromId
// cursor — same helper as scripts/sync-crypto-purchases/main.go.
func allTrades(ctx context.Context, client *binance.Client, symbol string) ([]*binance.TradeV3, error) {
	var all []*binance.TradeV3
	fromID := int64(0)
	for {
		page, err := client.NewListTradesService().
			Symbol(symbol).FromID(fromID).Limit(pageLimit).Do(ctx)
		if err != nil {
			return nil, err
		}
		if len(page) == 0 {
			break
		}
		all = append(all, page...)
		if len(page) < pageLimit {
			break
		}
		fromID = page[len(page)-1].ID + 1
	}
	return all, nil
}

type pendingDoc struct {
	id      string
	key     string
	pair    string
	tradeID int64
	date    string
}

func main() {
	defaultSA := filepath.Join("..", "..", "notifier", "service-account.json")
	saPath := flag.String("sa", defaultSA, "path to Firebase service account JSON")
	field := flag.String("field", "", "field to backfill: purchaseTime | binanceOrderId")
	apply := flag.Bool("apply", false, "write changes to Firestore (default is dry run)")
	tenant := flag.String("tenant", defaultTenantID, "tenant id to backfill")
	platform := flag.String("platform", defaultPlatform, "only backfill docs with this platform value (credentials must match this account)")
	apiKeyFlag := flag.String("api-key", "", "Binance API key for this platform's account (defaults to BINANCE_API_KEY env var)")
	secretKeyFlag := flag.String("secret-key", "", "Binance secret key for this platform's account (defaults to BINANCE_SECRET_KEY env var)")
	flag.Parse()

	if !supportedFields[*field] {
		log.Fatalf("--field inválido (%q) — usa purchaseTime o binanceOrderId", *field)
	}

	apiKey := *apiKeyFlag
	if apiKey == "" {
		apiKey = os.Getenv("BINANCE_API_KEY")
	}
	secretKey := *secretKeyFlag
	if secretKey == "" {
		secretKey = os.Getenv("BINANCE_SECRET_KEY")
	}
	if apiKey == "" || secretKey == "" {
		log.Fatal("Configura --api-key/--secret-key o las variables de entorno BINANCE_API_KEY y BINANCE_SECRET_KEY")
	}

	fmt.Printf("\n🔧  backfill-crypto-purchase-field\n")
	fmt.Printf("    Campo    : %s\n", *field)
	fmt.Printf("    Plataforma: %s\n", *platform)
	fmt.Printf("    Modo     : %s\n\n", map[bool]string{true: "APLICAR CAMBIOS", false: "dry run (solo muestra el plan)"}[*apply])

	if *apply {
		fmt.Println("⚠️  Vas a escribir en Firestore (producción). Tienes 5 segundos para cancelar (Ctrl+C)...")
		time.Sleep(5 * time.Second)
	}

	ctx := context.Background()
	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile(*saPath))
	if err != nil {
		log.Fatalf("firebase.NewApp: %v", err)
	}
	fsClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("app.Firestore: %v", err)
	}
	defer fsClient.Close()

	var pending []pendingDoc
	var skippedNoTradeId int
	byPair := map[string][]pendingDoc{}

	iter := fsClient.Collection(collectionName).
		Where("tenantId", "==", *tenant).
		Where("platform", "==", *platform).
		Documents(ctx)
	for {
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("leyendo compras existentes: %v", err)
		}
		data := snap.Data()
		if hasField(data, *field) {
			continue
		}
		tradeKey, _ := data["binanceTradeId"].(string)
		sep := strings.LastIndex(tradeKey, "-")
		if tradeKey == "" || sep < 0 {
			skippedNoTradeId++
			continue
		}
		pair := tradeKey[:sep]
		id, err := strconv.ParseInt(tradeKey[sep+1:], 10, 64)
		if err != nil {
			skippedNoTradeId++
			continue
		}
		date, _ := data["purchaseDate"].(string)
		d := pendingDoc{id: snap.Ref.ID, key: tradeKey, pair: pair, tradeID: id, date: date}
		pending = append(pending, d)
		byPair[pair] = append(byPair[pair], d)
	}

	fmt.Printf("Sin %s, con binanceTradeId : %d\n", *field, len(pending))
	fmt.Printf("Sin binanceTradeId (omitidos)         : %d\n\n", skippedNoTradeId)

	binanceClient := binance.NewClient(apiKey, secretKey)
	type update struct {
		docID string
		key   string
		date  string
		value interface{}
	}
	var toUpdate []update
	var notFound []string

	for pair, docs := range byPair {
		trades, err := allTrades(ctx, binanceClient, pair)
		if err != nil {
			fmt.Printf("  ⚠️  Error consultando %s: %v — %d docs quedan sin backfill\n", pair, err, len(docs))
			for _, d := range docs {
				notFound = append(notFound, d.key)
			}
			continue
		}
		byID := map[int64]*binance.TradeV3{}
		for _, t := range trades {
			byID[t.ID] = t
		}
		for _, d := range docs {
			t, ok := byID[d.tradeID]
			if !ok {
				notFound = append(notFound, d.key)
				continue
			}
			toUpdate = append(toUpdate, update{docID: d.id, key: d.key, date: d.date, value: fieldValue(t, *field)})
		}
	}

	fmt.Printf("Encontrados en Binance (a completar) : %d\n", len(toUpdate))
	fmt.Printf("No encontrados en Binance             : %d\n\n", len(notFound))
	for _, u := range toUpdate {
		fmt.Printf("  %s  %s  %s=%v  (%s)\n", u.docID, u.date, *field, u.value, u.key)
	}
	if len(notFound) > 0 {
		fmt.Println("\nSin match en Binance (quedan sin completar):")
		for _, k := range notFound {
			fmt.Printf("  %s\n", k)
		}
	}

	if !*apply {
		fmt.Println("\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.")
		return
	}

	var written, errs int
	for _, u := range toUpdate {
		_, err := fsClient.Collection(collectionName).Doc(u.docID).Update(ctx, []firestore.Update{
			{Path: *field, Value: u.value},
		})
		if err != nil {
			fmt.Fprintf(os.Stderr, "  ERROR %s: %v\n", u.docID, err)
			errs++
			continue
		}
		written++
	}

	fmt.Printf("\n✅  Listo. %d compras actualizadas con %s, %d errores.\n", written, *field, errs)
}
