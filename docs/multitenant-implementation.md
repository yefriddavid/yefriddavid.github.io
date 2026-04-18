# Implementación Multi-tenant — Filtro por tenantId

## Arquitectura del filtro

```
Firebase Auth → fetchProfile saga
                    ↓
              setTenantId(profile.tenantId)   ← src/services/tenantContext.js
                    ↓
  Todos los servicios llaman getTenantId()
  y filtran: where('tenantId', '==', getTenantId())
```

## Archivos modificados — 22 servicios + 1 saga

- `src/services/tenantContext.js` — nuevo módulo singleton
- `src/sagas/profileSagas.js` — llama `setTenantId` al cargar el perfil

**CashFlow (7):**
- cashflow/transactions.js
- cashflow/eggs.js
- cashflow/myProjects.js
- cashflow/accountStatusNotes.js
- cashflow/accountsMaster.js
- cashflow/assets.js
- cashflow/salaryDistribution.js

**Taxi (8):**
- taxi/taxiDrivers.js
- taxi/taxiSettlements.js
- taxi/taxiVehicles.js
- taxi/taxiExpenses.js
- taxi/taxiPartners.js
- taxi/taxiDistributions.js
- taxi/taxiPeriodNotes.js
- taxi/taxiAuditNotes.js

**Contratos (6):**
- contratos/contracts.js
- contratos/properties.js
- contratos/owners.js
- contratos/bankAccounts.js
- contratos/contractNotes.js
- contratos/contractAttachments.js

**Payments (1):**
- cashflow/paymentVaucher.js

## Acción requerida en Firestore Console

Varias queries combinan `where('tenantId', ...)` con `orderBy` o con otro `where`,
lo que requiere índices compuestos. Firestore los pedirá con un link directo en la
consola del navegador la primera vez que se ejecute cada query — solo hay que hacer
clic en ese link para crearlos.

Queries que requieren índice compuesto:
- `transactions`: tenantId + date (range) + orderBy date
- `eggs`: tenantId + orderBy date
- `accountsMaster`: tenantId + orderBy name
- `accountStatusNotes`: tenantId + period
- `taxiDrivers`: tenantId + orderBy name
- `taxiSettlements`: tenantId + orderBy date
- `taxiVehicles`: tenantId + orderBy plate
- `taxiExpenses`: tenantId + orderBy date
- `taxiPartners`: tenantId + orderBy name
- `taxiDistributions`: tenantId + orderBy period
- `taxiPeriodNotes`: tenantId + period
- `contracts`: tenantId + orderBy name
- `properties`: tenantId + orderBy alias
- `owners`: tenantId + orderBy full_name
- `bankAccounts`: tenantId + orderBy bank_name
- `contractNotes`: tenantId + contractId
- `contractAttachments`: tenantId + contractId
