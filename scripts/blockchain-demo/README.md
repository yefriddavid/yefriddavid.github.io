# Blockchain transaccional (demo)

Prueba de concepto en Go de una blockchain simulada: bloques encadenados por
hash, transacciones simples, minado por prueba de trabajo (PoW) y validación
de integridad de la cadena. Todo corre en memoria (sin persistencia ni red
P2P) — es para entender la mecánica, no para producción.

## Cómo probarlo

**Sin compilar (rápido para iterar):**
```bash
cd /mnt/Zeus/Workspace/me/sources/My-Admin/scripts/blockchain-demo
go run .
```

**Usando el binario ya compilado:**
```bash
cd /mnt/Zeus/Workspace/me/sources/My-Admin/scripts/blockchain-demo
./blockchain-demo
```

Una vez adentro es una consola interactiva:

| Comando | Qué hace |
|---|---|
| `tx <de> <para> <monto>` | agrega una transacción al pool de pendientes |
| `mine` | mina un bloque nuevo con las transacciones pendientes (PoW) |
| `print` | muestra toda la cadena en JSON |
| `validate` | verifica que la cadena esté íntegra |
| `tamper <indice_bloque>` | corrompe un bloque a propósito, para probar la detección |
| `help` | lista de comandos |
| `exit` | salir |

### Ejemplo de sesión

```
> tx alice bob 50
> tx bob carol 20
> mine
> validate          → [OK] cadena válida
> print             → ver el JSON completo con hashes
> tamper 1          → altera el monto del bloque 1 sin re-minar
> validate          → [INVALIDA] detecta la manipulación
```

## ¿Por qué es "inmutable" si son solo structs en memoria (o un JSON en disco)?

"Inmutable" no significa que el dato no se pueda editar — un archivo o una
variable siempre se pueden modificar. Lo que hace inmutable a una blockchain
es que **cualquier alteración es matemáticamente detectable**, gracias a dos
mecanismos:

1. **Hash encadenado (tamper-evidence):** cada bloque guarda el hash del
   bloque anterior. Si se edita una transacción vieja, el hash de ese bloque
   cambia, y como el bloque siguiente apunta al hash *original*, la cadena
   queda rota. Es justo lo que hace el comando `tamper`: corrompe el dato sin
   recalcular el hash, y `validate` lo detecta al instante.

2. **Consenso distribuido** (no está implementado en esta demo): en una
   blockchain real, miles de nodos independientes tienen su propia copia de
   la cadena. Editar tu copia local no sirve de nada porque la red rechaza
   cualquier versión que no coincida con la de la mayoría.

Para que una alteración pase desapercibida (que `validate` no la note), no
alcanza con cambiar un dato — hay que:

1. Re-minar el bloque alterado (cumplir la dificultad de PoW de nuevo)
2. Como su hash cambió, el `prev_hash` del siguiente bloque ya no coincide →
   hay que re-minarlo también
3. Eso cambia su hash → hay que re-minar el siguiente, y así hasta el final
   de la cadena

Es un efecto cascada: cuanto más vieja la transacción que se quiere alterar,
más bloques hay que re-minar. Con la dificultad baja de este demo (3 ceros)
es rápido; en una red real con miles de bloques y dificultad altísima,
recalcular todo eso tomaría años de poder de cómputo — y aun así, la versión
alterada tendría que superar en velocidad a toda la red honesta para ser
aceptada (el llamado "ataque del 51%").

## Estado actual / próximos pasos posibles

- [ ] Persistencia en archivo `chain.json` (guardar al minar, cargar al iniciar)
- [ ] Firmas criptográficas (wallets con clave pública/privada)
- [ ] Comando de ataque: alterar un bloque viejo y re-minar en cascada,
      para visualizar el costo computacional según cuántos bloques hay después
- [ ] Simulación de múltiples nodos para mostrar consenso distribuido
