// list-binance-loans — read-only exploration of Binance Crypto Loans (loans with
// crypto collateral). Not supported by github.com/adshao/go-binance/v2 (it only
// covers Margin Loans), so this signs requests to the REST API directly:
//
//	GET /sapi/v1/loan/flexible/ongoing/orders  — Flexible Rate loans
//	GET /sapi/v1/loan/vip/ongoing/orders       — VIP loans
//
// (Binance deprecated the old Stable/Fixed Rate endpoints — /sapi/v1/loan/ongoing/orders
// now returns -10112 "This endpoint has been deprecated".)
//
// Also prints which Binance account this API key belongs to (accountType +
// sub-account list), since an empty loan result can just mean the key points
// at a different account/sub-account than the one holding the loans.
//
// Usage:
//
//	export BINANCE_API_KEY=...
//	export BINANCE_SECRET_KEY=...
//	go run .
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

const baseURL = "https://api.binance.com"

func sign(secretKey, query string) string {
	mac := hmac.New(sha256.New, []byte(secretKey))
	mac.Write([]byte(query))
	return hex.EncodeToString(mac.Sum(nil))
}

func signedGet(apiKey, secretKey, path string, params url.Values) ([]byte, error) {
	params.Set("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10))
	params.Set("recvWindow", "5000")
	query := params.Encode()
	signature := sign(secretKey, query)
	fullURL := fmt.Sprintf("%s%s?%s&signature=%s", baseURL, path, query, signature)

	req, err := http.NewRequest(http.MethodGet, fullURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-MBX-APIKEY", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	return body, nil
}

type loanOrder struct {
	LoanCoin         string `json:"loanCoin"`
	TotalDebt        string `json:"totalDebt"`
	ResidualInterest string `json:"residualInterest"`
	CollateralCoin   string `json:"collateralCoin"`
	CollateralAmount string `json:"collateralAmount"`
	CurrentLTV       string `json:"currentLTV"`
}

type loanResponse struct {
	Rows  []loanOrder `json:"rows"`
	Total int         `json:"total"`
}

func printLoans(label, apiKey, secretKey, path string) {
	fmt.Printf("── %s ──\n", label)
	body, err := signedGet(apiKey, secretKey, path, url.Values{})
	if err != nil {
		log.Printf("GET %s: %v", path, err)
		return
	}
	var res loanResponse
	if err := json.Unmarshal(body, &res); err != nil {
		log.Printf("parseando respuesta: %v\nraw: %s", err, body)
		return
	}
	if len(res.Rows) == 0 {
		fmt.Println("Sin préstamos activos.")
		return
	}
	fmt.Printf("%-10s %-16s %-10s %-16s %-8s\n", "MONEDA", "DEUDA TOTAL", "COLATERAL", "CANT. COLAT.", "LTV")
	for _, o := range res.Rows {
		fmt.Printf("%-10s %-16s %-10s %-16s %-8s\n", o.LoanCoin, o.TotalDebt, o.CollateralCoin, o.CollateralAmount, o.CurrentLTV)
	}
}

func printAccountIdentity(apiKey, secretKey string) {
	fmt.Println("── Cuenta de esta API key ──")

	acctBody, err := signedGet(apiKey, secretKey, "/api/v3/account", url.Values{})
	if err != nil {
		log.Printf("GET /api/v3/account: %v", err)
		return
	}
	var acct struct {
		AccountType string `json:"accountType"`
		Balances    []struct {
			Asset string `json:"asset"`
			Free  string `json:"free"`
		} `json:"balances"`
	}
	if err := json.Unmarshal(acctBody, &acct); err != nil {
		log.Printf("parseando /api/v3/account: %v", err)
		return
	}
	nonZero := 0
	for _, b := range acct.Balances {
		if b.Free != "0.00000000" && b.Free != "0" {
			nonZero++
		}
	}
	fmt.Printf("accountType=%s, activos con saldo > 0: %d\n", acct.AccountType, nonZero)

	subBody, err := signedGet(apiKey, secretKey, "/sapi/v1/sub-account/list", url.Values{})
	if err != nil {
		return // not a master key, or no permission — not fatal
	}
	var subs struct {
		SubAccounts []struct {
			Email string `json:"email"`
		} `json:"subAccounts"`
	}
	if err := json.Unmarshal(subBody, &subs); err == nil && len(subs.SubAccounts) > 0 {
		fmt.Printf("Cuenta master con %d sub-cuenta(s):\n", len(subs.SubAccounts))
		for _, s := range subs.SubAccounts {
			fmt.Printf("  - %s\n", s.Email)
		}
	}
}

func main() {
	apiKey := os.Getenv("BINANCE_API_KEY")
	secretKey := os.Getenv("BINANCE_SECRET_KEY")
	if apiKey == "" || secretKey == "" {
		log.Fatal("Configura las variables de entorno BINANCE_API_KEY y BINANCE_SECRET_KEY")
	}

	fmt.Println("\n🔎  list-binance-loans (Crypto Loans)\n")

	printLoans("Flexible Rate", apiKey, secretKey, "/sapi/v1/loan/flexible/ongoing/orders")
	fmt.Println()
	printLoans("VIP Loan", apiKey, secretKey, "/sapi/v1/loan/vip/ongoing/orders")
	fmt.Println()
	printAccountIdentity(apiKey, secretKey)
}
