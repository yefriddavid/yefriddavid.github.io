/**
 * Node-compatible shim for src/services/firebase/settings.js
 * Replaces import.meta.env with process.env (populated by dotenv in cli/index.js)
 * Omits getMessaging (browser-only). All collection names are re-exported as-is.
 */
import dotenv from 'dotenv'
import { resolve } from 'path'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { initializeAuth, inMemoryPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

dotenv.config({ path: resolve(process.cwd(), '.env.production') })

const domoticaConfig = {
  apiKey: process.env.VITE_DOMOTICA_API_KEY,
  authDomain: process.env.VITE_DOMOTICA_AUTH_DOMAIN,
  databaseURL: process.env.VITE_DOMOTICA_DATABASE_URL,
  projectId: process.env.VITE_DOMOTICA_PROJECT_ID,
  storageBucket: process.env.VITE_DOMOTICA_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_DOMOTICA_MESSAGING_SENDER_ID,
  appId: process.env.VITE_DOMOTICA_APP_ID,
}

const taxiConfig = {
  apiKey: process.env.VITE_TAXI_API_KEY,
  authDomain: process.env.VITE_TAXI_AUTH_DOMAIN,
  databaseURL: process.env.VITE_TAXI_DATABASE_URL,
  projectId: process.env.VITE_TAXI_PROJECT_ID,
  storageBucket: process.env.VITE_TAXI_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_TAXI_MESSAGING_SENDER_ID,
  appId: process.env.VITE_TAXI_APP_ID,
}

const domoticaApp = initializeApp(domoticaConfig, 'domotica')
export const dbDomotica = getFirestore(domoticaApp)
export const rtdbDomotica = getDatabase(domoticaApp)

const taxiApp = initializeApp(taxiConfig, 'taxi')
export const dbTaxi = getFirestore(taxiApp)

const cashflowConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}
const cashflowApp = initializeApp(cashflowConfig, 'cashflow')
export const db = getFirestore(cashflowApp)
export const auth = initializeAuth(cashflowApp, { persistence: inMemoryPersistence })
export const messaging = null
export const rtdb = null
export const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY

// ── Collection names (mirrors src/services/firebase/settings.js) ──────────────
export const COL_APP_SETTINGS = 'App_Settings'

export const COL_CASHFLOW_ACCOUNTS_MASTER = 'CashFlow_AccountsMaster'
export const COL_CASHFLOW_TRANSACTIONS = 'CashFlow_Transactions'
export const COL_CASHFLOW_ASSETS = 'CashFlow_assets'
export const COL_CASHFLOW_EGGS = 'CashFlow_eggs'
export const COL_CASHFLOW_MY_PROJECTS = 'CashFlow_my_projects'
export const COL_CASHFLOW_SALARY_DISTRIBUTION = 'CashFlow_salary_distribution'
export const COL_CASHFLOW_ACCOUNT_STATUS_NOTES = 'CashFlow_account_status_period_notes'

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

export const COL_FINANCE_GRID_TRADES = 'Finance_grid_trades'
export const COL_FINANCE_CUSTOM_GRID_TRADES = 'Finance_Custom_Grid_Trades'

export const COL_CONTRATOS = 'Contratos_Contratos'
export const COL_CONTRATOS_PROPERTIES = 'Contratos_Inmuebles'
export const COL_CONTRATOS_OWNERS = 'Contratos_Propietarios'
export const COL_CONTRATOS_BANK_ACCOUNTS = 'Contratos_CuentasBancarias'
export const COL_CONTRATOS_NOTES = 'Contratos_contract_notes'
export const COL_CONTRATOS_ATTACHMENTS = 'Contratos_contract_attachments'

export const COL_TENANTS = 'Admin_Tenants'
export const COL_USERS = 'users'
export const COL_SESSIONS = 'sessions'
export const COL_FCM_TOKENS = 'fcm_tokens'

export const COL_DOMOTICA_SOLAR = 'Domotica_Solar'
export const COL_DOMOTICA_TRANSACTIONS = 'Domotica_transactions'
export const COL_DOMOTICA_CURRENT = 'Domotica_current'
export const COL_DOMOTICA_DEVICES = 'Domotica_devices'
export const COL_DOMOTICA_COMMAND = 'Domotica_command'
export const COL_DOMOTICA_COMMAND_DICTIONARY = 'Domotica_command_dictionary'
export const COL_DOMOTICA_COMMAND_PROFILES = 'Domotica_command_profiles'
export const COL_DOMOTICA_COMMAND_PROFILE_ITEMS = 'Domotica_command_profile_items'

export const COL_PAGE_VISITS = 'page_visits'
export const COL_PAYMENT_VAUCHERS = (year) => `paymentVauchers-${year}`
export const COL_SYSTEM_ERROR_LOGS = 'System_error_logs'
export const COL_SYSTEM_AUDIT_LOGS = 'System_audit_logs'
export const COL_SYSTEM_PERF_LOGS = 'System_perf_logs'
