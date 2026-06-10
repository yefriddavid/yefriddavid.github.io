import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../settings'
import { firestoreCall } from '../firebaseClient'

// Collections grouped by module
const COLLECTIONS = [
  // Taxi
  { name: 'CashFlow_taxi_liquidaciones', label: 'Liquidaciones', module: 'Taxi' },
  { name: 'CashFlow_taxi_conductores', label: 'Conductores', module: 'Taxi' },
  { name: 'CashFlow_taxi_vehiculos', label: 'Vehículos', module: 'Taxi' },
  { name: 'CashFlow_taxi_gastos', label: 'Gastos', module: 'Taxi' },
  { name: 'CashFlow_taxi_partners', label: 'Partners', module: 'Taxi' },
  { name: 'CashFlow_taxi_distributions', label: 'Distribuciones', module: 'Taxi' },
  { name: 'CashFlow_taxi_period_notes', label: 'Notas de período', module: 'Taxi' },
  { name: 'CashFlow_taxi_audit_notas', label: 'Notas auditoría', module: 'Taxi' },
  // CashFlow
  { name: 'CashFlow_AccountsMaster', label: 'Maestro de cuentas', module: 'CashFlow' },
  { name: 'CashFlow_Transactions', label: 'Transacciones', module: 'CashFlow' },
  { name: 'CashFlow_assets', label: 'Activos', module: 'CashFlow' },
  { name: 'CashFlow_eggs', label: 'Eggs', module: 'CashFlow' },
  { name: 'CashFlow_my_projects', label: 'Proyectos', module: 'CashFlow' },
  { name: 'CashFlow_salary_distribution', label: 'Distribución salarial', module: 'CashFlow' },
  {
    name: 'CashFlow_account_status_period_notes',
    label: 'Notas estado de cuentas',
    module: 'CashFlow',
  },
  // Security
  { name: 'users', label: 'Usuarios', module: 'Seguridad' },
  { name: 'sessions', label: 'Sesiones', module: 'Seguridad' },
  { name: 'fcm_tokens', label: 'Tokens FCM', module: 'Seguridad' },
  // Otros
  { name: 'page_visits', label: 'Visitas', module: 'Otros' },
]

export async function fetchCollectionCounts() {
  const results = await Promise.allSettled(
    COLLECTIONS.map(async (col) => {
      const snap = await firestoreCall(() => getCountFromServer(collection(db, col.name)))
      return { ...col, count: snap.data().count }
    }),
  )

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...COLLECTIONS[i], count: null, error: true },
  )
}
