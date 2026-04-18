# Análisis: Implementación Multi-tenant

## Lo que facilita la migración

- Las colecciones están centralizadas en `settings.js` — un solo lugar para cambiar los paths
- Los servicios de Firebase están bien encapsulados en `src/services/firebase/`
- `firestoreClient.js` ya actúa como middleware central

## El problema principal

Toda la data está en colecciones **planas sin ningún campo de tenant**:
```
CashFlow_Transactions/  ← todos los datos mezclados
Contratos_Contratos/    ← ídem
```

## Las dos opciones reales

**Opción A — Subcollecciones** (`tenants/{id}/CashFlow_Transactions/`):
- Aislamiento perfecto, Firestore rules limpias
- Requiere cambiar **cada path** en ~15 archivos de servicio
- Migración de datos existente es destructiva

**Opción B — Campo `tenantId` en cada documento**:
- Cambio más quirúrgico: agregar `where('tenantId', '==', tid)` a cada query
- Más fácil de migrar data existente
- Requiere Firestore rules cuidadosas para que un tenant no lea al otro

## Los obstáculos reales

1. **Auth**: el email sintético `${username}@cashflow.app` colisiona entre tenants — dos tenants no pueden tener el mismo `username`
2. **Google Apps Script**: también necesita conciencia del tenant
3. **~15 archivos de servicio** a actualizar (algunos tienen `COL` hardcodeada como `transactions.js`)
4. **Data existente** necesita migración

## Veredicto

Dificultad **media-alta**. La Opción B (campo `tenantId`) es el camino más pragmático si el objetivo es migrar la data existente sin destruirla.
