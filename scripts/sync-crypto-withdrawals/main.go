// sync-crypto-withdrawals — pulls withdraw history from Binance
// (GET /sapi/v1/capital/withdraw/history via ListWithdrawsService) and writes
// it into the Finance_Crypto_Withdrawals Firestore collection, read by the
// read-only "Crypto Withdrawals" screen (src/views/tools/crypto-withdrawals).
//
// Uses the Admin SDK (service account) so it bypasses Firestore security rules.
//
// The endpoint only allows a 90-day window per call and defaults to the last
// 90 days, so this walks back from now in 90-day chunks until --since.
//
// Re-runs are safe: each withdrawal's Binance id is stored as
// binanceWithdrawId and already-synced withdrawals are skipped.
//
// Usage:
//
//	export BINANCE_API_KEY=...
//	export BINANCE_SECRET_KEY=...
//	go run . [--apply] [--since 2023-01-01] [--coin BTC] [--sa path/to/service-account.json]
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
	collectionName = "Finance_Crypto_Withdrawals"
	tenantID       = "Atlfc1jvEUbLsintnpAq"
)

func allWithdrawals(ctx context.Context, client *binance.Client, since time.Time, coin string) ([]*binance.Withdraw, error) {
	var all []*binance.Withdraw
	end := time.Now()

	for end.After(since) {
		start := end.AddDate(0, 0, -90)
		if start.Before(since) {
			start = since
		}

		svc := client.NewListWithdrawsService().
			StartTime(start.UnixMilli()).
			EndTime(end.UnixMilli()).
			Limit(1000)
		if coin != "" {
			svc = svc.Coin(coin)
		}

		page, err := svc.Do(ctx)
		if err != nil {
			return nil, fmt.Errorf("[%s → %s]: %w", start.Format("2006-01-02"), end.Format("2006-01-02"), err)
		}
		all = append(all, page...)
		end = start
	}
	return all, nil
}

func main() {
	defaultSA := filepath.Join("..", "..", "notifier", "service-account.json")
	saPath := flag.String("sa", defaultSA, "path to Firebase service account JSON")
	apply := flag.Bool("apply", false, "write changes to Firestore (default is dry run)")
	since := flag.String("since", "2023-01-01", "walk back this far (YYYY-MM-DD)")
	coin := flag.String("coin", "", "filter to a single coin (e.g. BTC); omit for all")
	flag.Parse()

	apiKey := os.Getenv("BINANCE_API_KEY")
	secretKey := os.Getenv("BINANCE_SECRET_KEY")
	if apiKey == "" || secretKey == "" {
		log.Fatal("Configura las variables de entorno BINANCE_API_KEY y BINANCE_SECRET_KEY")
	}

	sinceTime, err := time.Parse("2006-01-02", *since)
	if err != nil {
		log.Fatalf("--since inválido (usa YYYY-MM-DD): %v", err)
	}

	fmt.Printf("\n🔧  sync-crypto-withdrawals\n")
	fmt.Printf("    Desde    : %s\n", *since)
	if *coin != "" {
		fmt.Printf("    Coin     : %s\n", strings.ToUpper(*coin))
	}
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

	// Existing binanceWithdrawId values already stored, so re-runs don't duplicate.
	existing := map[string]bool{}
	iter := fsClient.Collection(collectionName).Where("tenantId", "==", tenantID).Documents(ctx)
	for {
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("leyendo retiros existentes: %v", err)
		}
		if id, ok := snap.Data()["binanceWithdrawId"].(string); ok && id != "" {
			existing[id] = true
		}
	}
	fmt.Printf("Registros existentes: %d\n\n", len(existing))

	binanceClient := binance.NewClient(apiKey, secretKey)
	withdrawals, err := allWithdrawals(ctx, binanceClient, sinceTime, strings.ToUpper(*coin))
	if err != nil {
		log.Fatalf("ListWithdraws: %v", err)
	}

	var toInsert []map[string]interface{}
	for _, w := range withdrawals {
		if existing[w.ID] {
			continue
		}
		amount, err := strconv.ParseFloat(w.Amount, 64)
		if err != nil {
			amount = 0
		}
		toInsert = append(toInsert, map[string]interface{}{
			"binanceWithdrawId": w.ID,
			"coin":              w.Coin,
			"amount":            amount,
			"network":           w.Network,
			"status":            w.Status,
			"applyTime":         w.ApplyTime,
			"txId":              w.TxID,
			"tenantId":          tenantID,
			"createdAt":         firestore.ServerTimestamp,
		})
	}

	fmt.Printf("Retiros encontrados en Binance : %d\n", len(withdrawals))
	fmt.Printf("Nuevos a insertar              : %d\n\n", len(toInsert))
	for _, d := range toInsert {
		fmt.Printf("  %-6s %-18v %-10s %s\n", d["coin"], d["amount"], d["network"], d["applyTime"])
	}

	if !*apply {
		fmt.Println("\nDry run — no se escribió nada. Vuelve a correr con --apply para aplicar los cambios.")
		return
	}

	for _, d := range toInsert {
		if _, _, err := fsClient.Collection(collectionName).Add(ctx, d); err != nil {
			log.Fatalf("escribiendo retiro %v: %v", d["binanceWithdrawId"], err)
		}
	}

	fmt.Printf("\n✅  Listo. %d retiros insertados.\n", len(toInsert))
}
