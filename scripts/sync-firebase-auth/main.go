// sync-firebase-auth — syncs Firestore users → Firebase Auth accounts.
//
// For each user in the Firestore `users` collection that has a `salt` field,
// decrypts the password (AES-256-GCM, key derived from SHA-256 of passphrase)
// and creates or updates the corresponding Firebase Auth account.
//
// Usage:
//
//	go run . [--dry-run] [--sa path/to/service-account.json]
package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const passphrase = "v3lDCa1esgIToEPOxOc="

func deriveKey() []byte {
	h := sha256.Sum256([]byte(passphrase))
	return h[:]
}

func decryptSalt(encryptedB64 string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encryptedB64)
	if err != nil {
		return "", fmt.Errorf("base64: %w", err)
	}
	if len(data) < 12 {
		return "", fmt.Errorf("ciphertext too short (%d bytes)", len(data))
	}
	nonce, ciphertext := data[:12], data[12:]

	block, err := aes.NewCipher(deriveKey())
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("aes-gcm decrypt: %w", err)
	}
	return string(plaintext), nil
}

func toAuthEmail(username string) string {
	return strings.ToLower(strings.TrimSpace(username)) + "@cashflow.app"
}

func syncUser(ctx context.Context, authClient *auth.Client, username, password string, dryRun bool) (string, error) {
	email := toAuthEmail(username)

	existing, err := authClient.GetUserByEmail(ctx, email)
	if err != nil {
		if auth.IsUserNotFound(err) {
			if !dryRun {
				if _, err = authClient.CreateUser(ctx,
					(&auth.UserToCreate{}).Email(email).Password(password).EmailVerified(true),
				); err != nil {
					return "", fmt.Errorf("CreateUser: %w", err)
				}
			}
			return "created", nil
		}
		return "", fmt.Errorf("GetUserByEmail: %w", err)
	}

	if !dryRun {
		if _, err = authClient.UpdateUser(ctx, existing.UID,
			(&auth.UserToUpdate{}).Password(password),
		); err != nil {
			return "", fmt.Errorf("UpdateUser: %w", err)
		}
	}
	return "updated", nil
}

func main() {
	defaultSA := filepath.Join("..", "..", "notifier", "service-account.json")
	saPath := flag.String("sa", defaultSA, "path to Firebase service account JSON")
	dryRun := flag.Bool("dry-run", false, "preview without writing to Firebase Auth")
	flag.Parse()

	ctx := context.Background()

	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile(*saPath))
	if err != nil {
		log.Fatalf("firebase.NewApp: %v", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("app.Auth: %v", err)
	}

	fsClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("app.Firestore: %v", err)
	}
	defer fsClient.Close()

	iter := fsClient.Collection("users").Documents(ctx)
	defer iter.Stop()

	var total, created, updated, skipped, errors int

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("iter.Next: %v", err)
		}

		total++
		username := doc.Ref.ID
		data := doc.Data()

		raw, ok := data["salt"]
		salt, _ := raw.(string)
		if !ok || salt == "" {
			fmt.Printf("  SKIP  %-20s — no salt field\n", username)
			skipped++
			continue
		}

		password, err := decryptSalt(salt)
		if err != nil {
			fmt.Fprintf(os.Stderr, "  ERROR %-20s — %v\n", username, err)
			errors++
			continue
		}

		action, err := syncUser(ctx, authClient, username, password, *dryRun)
		if err != nil {
			fmt.Fprintf(os.Stderr, "  ERROR %-20s — %v\n", username, err)
			errors++
			continue
		}

		tag := "     "
		if *dryRun {
			tag = "[DRY]"
		}
		fmt.Printf("%s %-8s %s\n", tag, strings.ToUpper(action), username)
		if action == "created" {
			created++
		} else {
			updated++
		}
	}

	prefix := ""
	if *dryRun {
		prefix = "[DRY RUN] "
	}
	fmt.Printf("\n%sDone — total=%d created=%d updated=%d skipped=%d errors=%d\n",
		prefix, total, created, updated, skipped, errors)
}
