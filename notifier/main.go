package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/robfig/cron/v3"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const (
	projectID   = "cashflow-9cbbc"
	bogotaTZ    = "America/Bogota"
	colVehicles = "taxi_vehiculos"
	colTokens   = "fcm_tokens"
)

type app struct {
	fs  *firestore.Client
	fcm *messaging.Client
	log *log.Logger
}

// ─── Firestore document shapes ───────────────────────────────────────────────

type vehicleDoc struct {
	Plate        string                 `firestore:"plate"`
	Restrictions map[string]interface{} `firestore:"restrictions"`
}

type tokenDoc struct {
	Token string `firestore:"token"`
}

// ─── Main ────────────────────────────────────────────────────────────────────

func main() {
	credFile := flag.String("creds", envOr("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json"), "path to Firebase service account JSON")
	runNow := flag.Bool("run-now", false, "send notifications immediately and exit")
	flag.Parse()

	logger := log.New(os.Stdout, "[notifier] ", log.LstdFlags)

	ctx := context.Background()
	a, err := newApp(ctx, *credFile, logger)
	if err != nil {
		logger.Fatalf("init: %v", err)
	}
	defer a.fs.Close()

	if *runNow {
		if err := a.sendNotifications(ctx); err != nil {
			logger.Fatalf("send: %v", err)
		}
		return
	}

	bogota, err := time.LoadLocation(bogotaTZ)
	if err != nil {
		logger.Fatalf("timezone: %v", err)
	}

	c := cron.New(cron.WithLocation(bogota))

	// 7am, 12pm, 6pm Colombia time
	for _, spec := range []string{"0 7 * * *", "0 12 * * *", "0 18 * * *"} {
		spec := spec
		c.AddFunc(spec, func() {
			logger.Printf("cron triggered (%s)", spec)
			if err := a.sendNotifications(ctx); err != nil {
				logger.Printf("ERROR: %v", err)
			}
		})
	}

	c.Start()
	logger.Println("running — schedules: 7am, 12pm, 6pm (Colombia). Ctrl+C to stop.")
	select {}
}

// ─── App init ────────────────────────────────────────────────────────────────

func newApp(ctx context.Context, credFile string, logger *log.Logger) (*app, error) {
	opt := option.WithCredentialsFile(credFile)
	fbApp, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: projectID}, opt)
	if err != nil {
		return nil, fmt.Errorf("firebase init: %w", err)
	}

	fsClient, err := fbApp.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("firestore init: %w", err)
	}

	fcmClient, err := fbApp.Messaging(ctx)
	if err != nil {
		fsClient.Close()
		return nil, fmt.Errorf("fcm init: %w", err)
	}

	return &app{fs: fsClient, fcm: fcmClient, log: logger}, nil
}

// ─── Notification send ───────────────────────────────────────────────────────

func (a *app) sendNotifications(ctx context.Context) error {
	bogota, _ := time.LoadLocation(bogotaTZ)
	now := time.Now().In(bogota)

	plates, err := a.restrictedPlatesForDay(ctx, now.Month(), now.Day())
	if err != nil {
		return fmt.Errorf("load vehicles: %w", err)
	}
	if len(plates) == 0 {
		a.log.Printf("no pico y placa today (%s)", now.Format("2006-01-02"))
		return nil
	}

	tokens, err := a.loadTokens(ctx)
	if err != nil {
		return fmt.Errorf("load tokens: %w", err)
	}
	if len(tokens) == 0 {
		a.log.Println("no registered devices")
		return nil
	}

	title := "Pico y Placa hoy"
	body := fmt.Sprintf("Placas restringidas: %s", joinPlates(plates))

	sent, failed := 0, 0
	for _, token := range tokens {
		ok := a.sendOne(ctx, token, title, body)
		if ok {
			sent++
		} else {
			failed++
			a.deleteToken(ctx, token)
		}
	}

	a.log.Printf("sent=%d failed=%d plates=%s", sent, failed, joinPlates(plates))
	return nil
}

func (a *app) sendOne(ctx context.Context, token, title, body string) bool {
	_, err := a.fcm.Send(ctx, &messaging.Message{
		Token: token,
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
	})
	if err != nil {
		a.log.Printf("fcm error for token ...%s: %v", token[max(0, len(token)-8):], err)
		return false
	}
	return true
}

// ─── Firestore helpers ───────────────────────────────────────────────────────

func (a *app) restrictedPlatesForDay(ctx context.Context, month time.Month, day int) ([]string, error) {
	iter := a.fs.Collection(colVehicles).Documents(ctx)
	defer iter.Stop()

	var restricted []string
	for {
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var v vehicleDoc
		if err := snap.DataTo(&v); err != nil || v.Plate == "" {
			continue
		}

		if isRestricted(v.Restrictions, int(month), day) {
			restricted = append(restricted, v.Plate)
		}
	}
	return restricted, nil
}

func (a *app) loadTokens(ctx context.Context) ([]string, error) {
	iter := a.fs.Collection(colTokens).Documents(ctx)
	defer iter.Stop()

	var tokens []string
	for {
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var t tokenDoc
		if err := snap.DataTo(&t); err != nil || t.Token == "" {
			continue
		}
		tokens = append(tokens, t.Token)
	}
	return tokens, nil
}

func (a *app) deleteToken(ctx context.Context, token string) {
	_, err := a.fs.Collection(colTokens).Doc(token).Delete(ctx)
	if err != nil {
		a.log.Printf("failed to delete expired token: %v", err)
	}
}

// ─── Pico y placa logic ──────────────────────────────────────────────────────

// isRestricted checks if a vehicle is restricted on the given month/day.
// restrictions is a Firestore map: { "3": { "d1": 12, "d2": 25 }, ... }
func isRestricted(restrictions map[string]interface{}, month, day int) bool {
	if len(restrictions) == 0 {
		return false
	}

	monthKey := strconv.Itoa(month)
	raw, ok := restrictions[monthKey]
	if !ok {
		return false
	}

	monthMap, ok := raw.(map[string]interface{})
	if !ok {
		return false
	}

	d1 := toInt(monthMap["d1"])
	d2 := toInt(monthMap["d2"])

	return (d1 != 0 && d1 == day) || (d2 != 0 && d2 == day)
}

// ─── Utilities ───────────────────────────────────────────────────────────────

func toInt(v interface{}) int {
	if v == nil {
		return 0
	}
	switch val := v.(type) {
	case int64:
		return int(val)
	case float64:
		return int(val)
	case string:
		n, _ := strconv.Atoi(val)
		return n
	}
	return 0
}

func joinPlates(plates []string) string {
	result := ""
	for i, p := range plates {
		if i > 0 {
			result += ", "
		}
		result += p
	}
	return result
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
