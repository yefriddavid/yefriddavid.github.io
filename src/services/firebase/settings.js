import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getMessaging } from 'firebase/messaging'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const taxiConfig = {
  apiKey: import.meta.env.VITE_TAXI_API_KEY,
  authDomain: import.meta.env.VITE_TAXI_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_TAXI_DATABASE_URL,
  projectId: import.meta.env.VITE_TAXI_PROJECT_ID,
  storageBucket: import.meta.env.VITE_TAXI_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_TAXI_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_TAXI_APP_ID,
}

const domoticaConfig = {
  apiKey: import.meta.env.VITE_DOMOTICA_API_KEY,
  authDomain: import.meta.env.VITE_DOMOTICA_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DOMOTICA_DATABASE_URL,
  projectId: import.meta.env.VITE_DOMOTICA_PROJECT_ID,
  storageBucket: import.meta.env.VITE_DOMOTICA_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_DOMOTICA_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_DOMOTICA_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const messaging = getMessaging(app)
export const rtdb = getDatabase(app)

const taxiApp = initializeApp(taxiConfig, 'taxi')
export const dbTaxi = getFirestore(taxiApp)

const domoticaApp = initializeApp(domoticaConfig, 'domotica')
export const dbDomotica = getFirestore(domoticaApp)
export const rtdbDomotica = getDatabase(domoticaApp)

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
export const COL_TAXI_SETTLEMENTS = 'Taxi_liquidaciones'
export const COL_TAXI_DRIVERS = 'Taxi_conductores'
export const COL_TAXI_VEHICLES = 'Taxi_vehiculos'
export const COL_TAXI_EXPENSES = 'Taxi_gastos'
export const COL_TAXI_PARTNERS = 'Taxi_partners'
export const COL_TAXI_DISTRIBUTIONS = 'Taxi_distributions'
export const COL_TAXI_PERIOD_NOTES = 'Taxi_period_notes'
export const COL_TAXI_AUDIT_NOTES = 'Taxi_audit_notas'
export const COL_TAXI_PERIOD_ATTACHMENTS = 'Taxi_period_attachments'
export const COL_TAXI_VEHICLE_LOCATION_HISTORY = 'Taxi_vehicle_location_history'

// Finance
export const COL_FINANCE_GRID_TRADES = 'Finance_grid_trades'
export const COL_FINANCE_CUSTOM_GRID_TRADES = 'Finance_Custom_Grid_Trades'

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
export const COL_DOMOTICA_TRANSACTIONS = 'Domotica_transactions'
export const COL_DOMOTICA_CURRENT = 'Domotica_current'
export const COL_DOMOTICA_DEVICES = 'Domotica_devices'
export const COL_DOMOTICA_COMMAND = 'Domotica_command'
export const COL_DOMOTICA_COMMAND_DICTIONARY = 'Domotica_command_dictionary'
export const COL_DOMOTICA_COMMAND_PROFILES = 'Domotica_command_profiles'
export const COL_DOMOTICA_COMMAND_PROFILE_ITEMS = 'Domotica_command_profile_items'

// Others
export const COL_PAGE_VISITS = 'page_visits'
export const COL_PAYMENT_VAUCHERS = (year) => `paymentVauchers-${year}`
export const COL_SYSTEM_ERROR_LOGS = 'System_error_logs'
export const COL_SYSTEM_AUDIT_LOGS = 'System_audit_logs'
export const COL_SYSTEM_PERF_LOGS = 'System_perf_logs'
