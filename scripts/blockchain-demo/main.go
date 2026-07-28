package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func main() {
	bc := NewBlockchain(3) // dificultad: 3 ceros iniciales en el hash
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("=== Blockchain transaccional (demo) ===")
	printHelp()

	for {
		fmt.Print("\n> ")
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		args := strings.Fields(line)
		cmd := args[0]

		switch cmd {
		case "tx":
			if len(args) != 4 {
				fmt.Println("uso: tx <de> <para> <monto>")
				continue
			}
			amount, err := strconv.ParseFloat(args[3], 64)
			if err != nil {
				fmt.Println("monto inválido:", args[3])
				continue
			}
			bc.AddTransaction(args[1], args[2], amount)
			fmt.Printf("transacción agregada al pool: %s -> %s (%.2f)\n", args[1], args[2], amount)

		case "mine":
			block := bc.MinePendingTransactions()
			if block == nil {
				fmt.Println("no hay transacciones pendientes para minar")
				continue
			}
			fmt.Printf("bloque #%d minado. hash=%s nonce=%d\n", block.Index, block.Hash, block.Nonce)

		case "print":
			fmt.Println(bc.String())

		case "validate":
			ok, msg := bc.IsValid()
			if ok {
				fmt.Println("[OK]", msg)
			} else {
				fmt.Println("[INVALIDA]", msg)
			}

		case "tamper":
			if len(args) != 2 {
				fmt.Println("uso: tamper <indice_bloque>")
				continue
			}
			idx, err := strconv.Atoi(args[1])
			if err != nil || idx < 0 || idx >= len(bc.Blocks) {
				fmt.Println("índice de bloque inválido")
				continue
			}
			if len(bc.Blocks[idx].Transactions) == 0 {
				fmt.Println("ese bloque no tiene transacciones para alterar")
				continue
			}
			bc.Blocks[idx].Transactions[0].Amount += 1000
			fmt.Printf("bloque #%d alterado (monto de la primera tx +1000, hash NO recalculado)\n", idx)

		case "help":
			printHelp()

		case "exit", "quit":
			fmt.Println("saliendo...")
			return

		default:
			fmt.Println("comando desconocido. escribí 'help' para ver los comandos.")
		}
	}
}

func printHelp() {
	fmt.Println(`Comandos disponibles:
  tx <de> <para> <monto>   agrega una transacción al pool de pendientes
  mine                     mina un nuevo bloque con las transacciones pendientes (PoW)
  print                    imprime toda la cadena en formato JSON
  validate                 valida la integridad de la cadena
  tamper <indice_bloque>   (prueba) corrompe un bloque para simular un ataque
  help                     muestra esta ayuda
  exit                     sale del programa`)
}
