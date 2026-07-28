package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type Transaction struct {
	From   string  `json:"from"`
	To     string  `json:"to"`
	Amount float64 `json:"amount"`
}

type Block struct {
	Index        int           `json:"index"`
	Timestamp    string        `json:"timestamp"`
	Transactions []Transaction `json:"transactions"`
	PrevHash     string        `json:"prev_hash"`
	Hash         string        `json:"hash"`
	Nonce        int           `json:"nonce"`
}

func (b *Block) calculateHash() string {
	record := fmt.Sprintf("%d%s%v%s%d", b.Index, b.Timestamp, b.Transactions, b.PrevHash, b.Nonce)
	h := sha256.Sum256([]byte(record))
	return hex.EncodeToString(h[:])
}

func (b *Block) mine(difficulty int) {
	prefix := strings.Repeat("0", difficulty)
	for {
		b.Hash = b.calculateHash()
		if strings.HasPrefix(b.Hash, prefix) {
			return
		}
		b.Nonce++
	}
}

type Blockchain struct {
	Blocks     []*Block
	PendingTxs []Transaction
	Difficulty int
}

func NewBlockchain(difficulty int) *Blockchain {
	genesis := &Block{
		Index:        0,
		Timestamp:    time.Now().Format(time.RFC3339),
		Transactions: []Transaction{},
		PrevHash:     "0",
	}
	genesis.mine(difficulty)
	return &Blockchain{
		Blocks:     []*Block{genesis},
		Difficulty: difficulty,
	}
}

func (bc *Blockchain) LatestBlock() *Block {
	return bc.Blocks[len(bc.Blocks)-1]
}

func (bc *Blockchain) AddTransaction(from, to string, amount float64) {
	bc.PendingTxs = append(bc.PendingTxs, Transaction{From: from, To: to, Amount: amount})
}

func (bc *Blockchain) MinePendingTransactions() *Block {
	if len(bc.PendingTxs) == 0 {
		return nil
	}
	prev := bc.LatestBlock()
	block := &Block{
		Index:        prev.Index + 1,
		Timestamp:    time.Now().Format(time.RFC3339),
		Transactions: bc.PendingTxs,
		PrevHash:     prev.Hash,
	}
	block.mine(bc.Difficulty)
	bc.Blocks = append(bc.Blocks, block)
	bc.PendingTxs = []Transaction{}
	return block
}

func (bc *Blockchain) IsValid() (bool, string) {
	prefix := strings.Repeat("0", bc.Difficulty)
	for i := 1; i < len(bc.Blocks); i++ {
		curr := bc.Blocks[i]
		prev := bc.Blocks[i-1]

		if curr.PrevHash != prev.Hash {
			return false, fmt.Sprintf("bloque %d: prev_hash no coincide con el hash del bloque %d", curr.Index, prev.Index)
		}
		if curr.calculateHash() != curr.Hash {
			return false, fmt.Sprintf("bloque %d: el hash almacenado no coincide con el recalculado (posible manipulación)", curr.Index)
		}
		if !strings.HasPrefix(curr.Hash, prefix) {
			return false, fmt.Sprintf("bloque %d: no cumple la dificultad de minado exigida", curr.Index)
		}
	}
	return true, "cadena válida"
}

func (bc *Blockchain) String() string {
	b, _ := json.MarshalIndent(bc.Blocks, "", "  ")
	return string(b)
}
