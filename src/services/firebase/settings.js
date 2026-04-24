import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const messaging = getMessaging(app)

// Exported for REST API calls
export const FIREBASE_API_KEY = firebaseConfig.apiKey

// ── Collection names ──────────────────────────────────────────────────────────
export const COL_APP_SETTINGS = 'App_Settings'

// CashFlow
export const COL_CASHFLOW_ACCOUNTS_MASTER = 'CashFlow_AccountsMaster'
export const COL_CASHFLOW_TRANSACTIONS = 'CashFlow_Transactions'
export const COL_CASHFLOW_ASSETS = 'CashFlow_assets'
export const COL_CASHFLOW_EGGS = 'CashFlow_eggs'
export const COL_CASHFLOW_MY_PROJECTS = 'CashFlow_my_projects'
export const COL_CASHFLOW_SALARY_DISTRIBUTION = 'CashFlow_salary_distribution'
export const COL_CASHFLOW_ACCOUNT_STATUS_NOTES = 'CashFlow_account_status_period_notes'

// Taxi
export const COL_TAXI_SETTLEMENTS = 'CashFlow_taxi_liquidaciones'
export const COL_TAXI_DRIVERS = 'CashFlow_taxi_conductores'
export const COL_TAXI_VEHICLES = 'CashFlow_taxi_vehiculos'
export const COL_TAXI_EXPENSES = 'CashFlow_taxi_gastos'
export const COL_TAXI_PARTNERS = 'CashFlow_taxi_partners'
export const COL_TAXI_DISTRIBUTIONS = 'CashFlow_taxi_distributions'
export const COL_TAXI_PERIOD_NOTES = 'CashFlow_taxi_period_notes'
export const COL_TAXI_AUDIT_NOTES = 'CashFlow_taxi_audit_notas'

// Contratos
export const COL_CONTRATOS = 'Contratos_Contratos'
export const COL_CONTRATOS_PROPERTIES = 'Contratos_Inmuebles'
export const COL_CONTRATOS_OWNERS = 'Contratos_Propietarios'
export const COL_CONTRATOS_BANK_ACCOUNTS = 'Contratos_CuentasBancarias'
export const COL_CONTRATOS_NOTES = 'Contratos_contract_notes'
export const COL_CONTRATOS_ATTACHMENTS = 'Contratos_contract_attachments'

// Admin
export const COL_TENANTS = 'Admin_Tenants'

// Security
export const COL_USERS = 'users'
export const COL_SESSIONS = 'sessions'
export const COL_FCM_TOKENS = 'fcm_tokens'

// Domótica
export const COL_DOMOTICA_SOLAR = 'Domotica_Solar'

// Others
export const COL_PAGE_VISITS = 'page_visits'
export const COL_PAYMENT_VAUCHERS = (year) => `paymentVauchers-${year}`
