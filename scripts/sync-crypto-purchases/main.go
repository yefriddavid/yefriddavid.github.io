// sync-crypto-purchases — pulls buy/sell trades from Binance and writes them into
// the Finance_Crypto_Purchases Firestore collection used by the Crypto Purchases v2
// module (src/views/tools/crypto-purchases).
//
// Based on list_buys_and_sells.go (go-binance NewListTradesService, t.IsBuyer to
// classify buy vs sell). Each trade becomes one document matching the app's schema:
// { type, symbol, quantity, purchasePrice, purchaseDate, platform, usdCopRate,
//   binanceTradeId, notes, tenantId }.
//
// Coins are commonly traded against more than one quote currency (USDT, USDC,
// FDUSD, …). For each configured base asset the script tries every known quote
// and pulls whatever pairs actually have trades. The `symbol` field stored in
// Firestore is always normalized to the canonical "<BASE>USDT" form — the app's
// filters and live-price lookup only know that form — and the real quote is
// recorded in `notes` when it wasn't USDT, so nothing is lost.
//
// Pagination uses Binance's fromId cursor (ascending trade id), not startTime —
// the myTrades endpoint caps each response at 1000 rows, and relying on
// startTime alone can silently truncate a busy pair's history. fromId paging
// always walks the complete history for a pair; --since then only filters
// client-side which of those trades get written.
//
// Re-runs are safe: each trade's id is stored as binanceTradeId
// ("BASEQUOTE-tradeId") and already-synced trades are skipped.
//
// usdCopRate is auto-filled from the official Colombia TRM (Banco de la
// República, via datos.gov.co) for the trade's date — same source used by
// scripts/backfill-crypto-purchase-usd-cop-rate.mjs.
//
// Usage:
//
//	export BINANCE_API_KEY=...
//	export BINANCE_SECRET_KEY=...
//	go run . [--apply] [--symbol BTC] [--since 2025-08-01] [--sa path/to/service-account.json]
//
// Without --apply it only prints the plan (dry run).
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
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
	collectionName = "Finance_Crypto_Purchases"
	tenantID       = "Atlfc1jvEUbLsintnpAq"
	platformValue  = "binance_col"
	trmEndpoint    = "https://www.datos.gov.co/resource/mcec-87by.json"
	pageLimit      = 1000
)

var defaultBases = []string{"BTC", "ETH", "SOL", "LINK", "BNB"}
var quotes = []string{"USDT", "USDC", "FDUSD"}

type trmRow struct {
	Valor string `json:"valor"`
}

// fetchTrm looks up the official TRM valid on `date` (YYYY-MM-DD), caching per date.
func fetchTrm(date string, cache map[string]*float64) *float64 {
	if v, ok := cache[date]; ok {
		return v
	}
	iso := date + "T00:00:00.000"
	where := url.QueryEscape(fmt.Sprintf("vigenciadesde<='%s' AND vigenciahasta>='%s'", iso, iso))
	resp, err := http.Get(trmEndpoint + "?$where=" + where)
	if err != nil {
		cache[date] = nil
		return nil
	}
	defer resp.Body.Close()
	var rows []trmRow
	if err := json.NewDecoder(resp.Body).Decode(&rows); err != nil || len(rows) == 0 {
		cache[date] = nil
		return nil
	}
	val, err := strconv.ParseFloat(rows[0].Valor, 64)
	if err != nil {
		cache[date] = nil
		return nil
	}
	cache[date] = &val
	return &val
}

// allTrades pages through the full trade history of `symbol` via the fromId
// cursor, so nothing is lost to the endpoint's per-call row cap.
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

type syncedTrade struct {
	tradeKey string
	doc      map[string]interface{}
}

func main() {
	defaultSA := filepath.Join("..", "..", "notifier", "service-account.json")
	saPath := flag.String("sa", defaultSA, "path to Firebase service account JSON")
	apply := flag.Bool("apply", false, "write changes to Firestore (default is dry run)")
	since := flag.String("since", "2020-01-01", "only write trades from this date onward (YYYY-MM-DD)")
	onlyBase := flag.String("symbol", "", "sync only this base asset (e.g. BTC); omit for all configured bases")
	flag.Parse()

	apiKey := os.Getenv("BINANCE_API_KEY")
	secretKey := os.Getenv("BINANCE_SECRET_KEY")
	if apiKey == "" || secretKey == "" {
		log.Fatal("Configura las variables de entorno BINANCE_API_KEY y BINANCE_SECRET_KEY")
	}

	if _, err := time.Parse("2006-01-02", *since); err != nil {
		log.Fatalf("--since inválido (usa YYYY-MM-DD): %v", err)
	}

	bases := defaultBases
	if *onlyBase != "" {
		bases = []string{strings.ToUpper(*onlyBase)}
	}

	fmt.Printf("\n🔧  sync-crypto-purchases\n")
	fmt.Printf("    Bases    : %s (contra %s)\n", strings.Join(bases, ", "), strings.Join(quotes, "/"))
	fmt.Printf("    Desde    : %s\n", *since)
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

	// Existing binanceTradeId values already stored, so re-runs don't duplicate.
	existing := map[string]bool{}
	iter := fsClient.Collection(collectionName).Where("tenantId", "==", tenantID).Documents(ctx)
	for {
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("leyendo compras existentes: %v", err)
		}
		if id, ok := snap.Data()["binanceTradeId"].(string); ok && id != "" {
			existing[id] = true
		}
	}
	fmt.Printf("Registros existentes con binanceTradeId: %d\n\n", len(existing))

	binanceClient := binance.NewClient(apiKey, secretKey)
	trmCache := map[string]*float64{}
	var toInsert []syncedTrade

	for _, base := range bases {
		for _, quote := range quotes {
			pair := base + quote
			trades, err := allTrades(ctx, binanceClient, pair)
			if err != nil {
				// Pair doesn't exist for this base (e.g. LINKFDUSD) — skip quietly.
				continue
			}

			for _, t := range trades {
				tradeKey := fmt.Sprintf("%s-%d", pair, t.ID)
				if existing[tradeKey] {
					continue
				}

				date := time.UnixMilli(t.Time).Format("2006-01-02")
				if date < *since {
					continue
				}

				price, _ := strconv.ParseFloat(t.Price, 64)
				qty, _ := strconv.ParseFloat(t.Quantity, 64)

				txType := "sell"
				if t.IsBuyer {
					txType = "buy"
				}

				rate := fetchTrm(date, trmCache)
				var usdCopRate interface{}
				if rate != nil {
					usdCopRate = *rate
				}

				notes := ""
				if quote != "USDT" {
					notes = "vía " + quote
				}

				toInsert = append(toInsert, syncedTrade{
					tradeKey: tradeKey,
					doc: map[string]interface{}{
						"binanceTradeId": tradeKey,
						"type":           txType,
						"symbol":         base + "USDT",
						"quantity":       qty,
						"purchasePrice":  price,
						"purchaseDate":   date,
						"platform":       platformValue,
						"usdCopRate":     usdCopRate,
						"notes":          notes,
						"tenantId":       tenantID,
						"createdAt":      firestore.ServerTimestamp,
					},
				})
			}
		}
	}

	fmt.Printf("Trades nuevos encontrados: %d\n\n", len(toInsert))
	for _, s := range toInsert {
		d := s.doc
		fmt.Printf("  %-10s %-8s %-4s qty=%-14v price=%-12v TRM=%-10v %s\n",
			d["purchaseDate"], d["symbol"], strings.ToUpper(d["type"].(string)), d["quantity"], d["purchasePrice"], d["usdCopRate"], d["notes"])
	}

	if !*apply {
		fmt.Println("\nDry run — no se escribió nada. Vuelve a correr con --apply para guardar en Firestore.")
		return
	}

	var written, errs int
	for _, s := range toInsert {
		if _, _, err := fsClient.Collection(collectionName).Add(ctx, s.doc); err != nil {
			fmt.Fprintf(os.Stderr, "  ERROR %s: %v\n", s.tradeKey, err)
			errs++
			continue
		}
		written++
	}

	fmt.Printf("\n✅  Listo. %d trades sincronizados, %d errores.\n", written, errs)
}
