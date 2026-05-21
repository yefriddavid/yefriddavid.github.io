import { Command } from 'commander'
import chalk from 'chalk'
import Table from 'cli-table3'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../shims/settings.js'
import { doc, getDoc } from 'firebase/firestore'
import store from '../../store/store.js'
import * as transactionActions from '../../../src/actions/cashflow/transactionActions'
import * as accountsMasterActions from '../../../src/actions/cashflow/accountsMasterActions'
import { setTenantId } from '../../../src/services/tenantContext'
import { waitForSaga } from '../../utils/dispatch.js'
import { getTenants } from '../../../src/services/firebase/admin/tenants'
import { getUserForAuth, hashPassword } from '../../../src/services/firebase/security/users'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0)

function isApplicableToMonth(account, month) {
  if (!account.active) return false
  if (account.period === 'Mensuales') return true
  if (account.period === 'Anuales') return MONTH_NAMES.indexOf(account.monthStartAt) + 1 === month
  if (
    account.period === 'Trimestrales' ||
    account.period === 'Cuatrimestrales' ||
    account.period === 'Semestrales'
  ) {
    const startMonth = MONTH_NAMES.indexOf(account.monthStartAt) + 1
    if (startMonth === 0) return false
    const interval =
      account.period === 'Trimestrales' ? 3 : account.period === 'Cuatrimestrales' ? 4 : 6
    return (month - startMonth + 12) % interval === 0
  }
  return true
}

function getStatus(account, payments, monthStr) {
  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
  const target = account.targetAmount > 0 ? account.targetAmount : null

  if (target !== null) {
    if (paid >= target) return { label: 'Pagado', paid }
    if (paid > 0) return { label: 'Parcial', paid, remaining: target - paid }
    const [y, m] = monthStr.split('-').map(Number)
    const due = new Date(y, m - 1, account.maxDatePay || 31)
    return today > due
      ? { label: 'Vencido', paid: 0, remaining: target }
      : { label: 'Pendiente', paid: 0, remaining: target }
  }

  if (paid > 0 && account.defaultValue > 0 && paid < account.defaultValue)
    return { label: 'Parcial', paid }
  if (paid > 0) return { label: 'Pagado', paid }
  const [y, m] = monthStr.split('-').map(Number)
  const due = new Date(y, m - 1, account.maxDatePay || 31)
  return today > due ? { label: 'Vencido', paid: 0 } : { label: 'Pendiente', paid: 0 }
}

const today = new Date()

const STATUS_COLOR = {
  Pagado: chalk.green,
  Parcial: chalk.cyan,
  Vencido: chalk.red,
  Pendiente: chalk.yellow,
}

async function signIn(username, pass) {
  const email = `${username.toLowerCase().trim()}@cashflow.app`
  try {
    await signInWithEmailAndPassword(auth, email, pass)
  } catch (err) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-email'
    ) {
      // Legacy Firestore hash fallback (same as webapp hybrid login)
      const firestoreUser = await getUserForAuth(username.trim())
      if (!firestoreUser) throw new Error('Credenciales incorrectas')
      if (firestoreUser.active === false) throw new Error('Usuario inactivo')
      const inputHash = await hashPassword(pass)
      if (inputHash !== firestoreUser.passwordHash) throw new Error('Credenciales incorrectas')
      // Lazy migration: create Firebase Auth account so next login uses Firebase Auth
      try {
        await createUserWithEmailAndPassword(auth, email, pass)
      } catch {
        // already exists or creation failed — authenticated via legacy for this session
      }
    } else {
      throw new Error(err.message)
    }
  }
}

async function listTenants() {
  const tenants = await getTenants()
  if (tenants.length === 0) {
    console.log(chalk.yellow('No tenants found.'))
    return
  }
  const table = new Table({
    head: ['ID', 'Name', 'Slug', 'Plan', 'Active'].map((h) => chalk.bold.white(h)),
    style: { compact: true, 'padding-left': 1 },
  })
  tenants.forEach((t) => {
    table.push([
      chalk.dim(t.id),
      chalk.white(t.name ?? '-'),
      t.slug ?? '-',
      t.plan ?? '-',
      t.active !== false ? chalk.green('yes') : chalk.red('no'),
    ])
  })
  console.log(chalk.bold.blue(`\nTenants — ${tenants.length} found`))
  console.log(table.toString())
  console.log(chalk.dim('\n  Re-run with --tenant <ID> to see account status\n'))
}

export const accountStatusCommand = new Command('account-status')
  .description('Monthly account status from CashFlow')
  .option('--tenant <id>', 'Tenant ID (omit to list tenants)')
  .option('--month <n>', 'Month 1-12', String(CURRENT_MONTH))
  .option('--year <n>', 'Year', String(CURRENT_YEAR))
  .option('--type <t>', 'Incoming | Outcoming | all', 'all')
  .option('--user <username>', 'CashFlow username for auth')
  .option('--pass <password>', 'CashFlow password for auth')
  .option('--format <fmt>', 'table | json', 'table')
  .action(async (opts) => {
    if (opts.user && opts.pass) {
      try {
        process.stdout.write(chalk.cyan('Authenticating...\n'))
        await signIn(opts.user, opts.pass)
        if (auth.currentUser) {
          process.stdout.write(chalk.dim(`  Signed in as ${auth.currentUser.email}\n`))
        } else {
          process.stdout.write(chalk.yellow('  Warning: authenticated via legacy hash — Firebase token unavailable. Firestore calls may fail.\n'))
        }
      } catch (err) {
        console.error(chalk.red(`Auth failed: ${err.message}`))
        process.exit(1)
      }
    }

    if (!opts.tenant) {
      if (opts.user) {
        // Read tenantId directly from user doc (bypasses firestoreCall to avoid accidental signOut)
        try {
          const snap = await getDoc(doc(db, 'users', opts.user.trim()))
          if (snap.exists()) opts.tenant = snap.data().tenantId ?? null
        } catch {
          // no access to user doc — fall through
        }
      }
      if (!opts.tenant) {
        // Admin path: list all tenants
        process.stdout.write(chalk.cyan('Fetching tenants...\n'))
        try {
          await listTenants()
        } catch (err) {
          console.error(chalk.red(`\nError: ${err.message}`))
          console.error(chalk.dim('  Pass --tenant <id> to skip tenant discovery.'))
          process.exit(1)
        }
        process.exit(0)
      }
      process.stdout.write(chalk.dim(`  Tenant: ${opts.tenant}\n`))
    }

    setTenantId(opts.tenant)
    const month = parseInt(opts.month, 10)
    const year = parseInt(opts.year, 10)
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    process.stdout.write(chalk.cyan('Fetching data...\n'))

    try {
      const [masters, transactions] = await Promise.all([
        waitForSaga(store, accountsMasterActions.fetchRequest(), {
          isFetching: (s) => s.accountsMaster.fetching,
          getResult: (s) => {
            if (s.accountsMaster.isError) throw new Error(s.accountsMaster.error ?? 'Failed to fetch accounts')
            return s.accountsMaster.data ?? []
          },
        }),
        waitForSaga(store, transactionActions.fetchRequest({ year }), {
          isFetching: (s) => s.transaction.fetching,
          getResult: (s) => {
            if (s.transaction.isError) throw new Error(s.transaction.error ?? 'Failed to fetch transactions')
            return s.transaction.data ?? []
          },
        }),
      ])

      const masterPaymentsMap = {}
      transactions.forEach((t) => {
        const period = t.accountMonth ?? t.date?.slice(0, 7)
        if (t.accountMasterId && period === monthStr) {
          if (!masterPaymentsMap[t.accountMasterId]) masterPaymentsMap[t.accountMasterId] = []
          masterPaymentsMap[t.accountMasterId].push(t)
        }
      })

      const applicable = masters
        .filter((a) => {
          if (!a.active) return false
          if (opts.type !== 'all' && a.type !== opts.type) return false
          return isApplicableToMonth(a, month)
        })
        .sort((a, b) => (a.maxDatePay || 31) - (b.maxDatePay || 31))

      const rows = applicable.map((a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        const status = getStatus(a, payments, monthStr)
        return { ...a, status }
      })

      if (opts.format === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        process.exit(0)
      }

      if (rows.length === 0) {
        console.log(chalk.yellow('No accounts applicable for this period.'))
        process.exit(0)
      }

      const table = new Table({
        head: ['#', 'Name', 'Type', 'Status', 'Paid', 'Expected', 'Due'].map((h) =>
          chalk.bold.white(h),
        ),
        style: { compact: true, 'padding-left': 1 },
      })

      rows.forEach((r, i) => {
        const colorFn = STATUS_COLOR[r.status.label] ?? chalk.white
        table.push([
          chalk.gray(i + 1),
          chalk.white(r.name ?? '-'),
          r.type === 'Incoming' ? chalk.green(r.type) : chalk.magenta(r.type),
          colorFn(r.status.label),
          r.status.paid > 0 ? chalk.green(fmt(r.status.paid)) : chalk.dim('-'),
          r.defaultValue ? chalk.dim(fmt(r.defaultValue)) : chalk.dim('-'),
          r.maxDatePay ? chalk.dim(`day ${r.maxDatePay}`) : chalk.dim('-'),
        ])
      })

      const paidCount = rows.filter((r) => r.status.label === 'Pagado').length
      const pendingCount = rows.filter((r) =>
        ['Pendiente', 'Parcial'].includes(r.status.label),
      ).length
      const overdueCount = rows.filter((r) => r.status.label === 'Vencido').length
      const totalPaid = rows.reduce((s, r) => s + (r.status.paid || 0), 0)
      const totalExpected = rows.reduce((s, r) => s + (r.defaultValue || 0), 0)

      console.log(
        chalk.bold.blue(`\nAccount Status — ${monthStr}`) + chalk.dim(`  ${rows.length} accounts`),
      )
      console.log(table.toString())
      console.log(
        chalk.green(`  Paid: ${paidCount}`) +
          chalk.yellow(`  Pending: ${pendingCount}`) +
          chalk.red(`  Overdue: ${overdueCount}`) +
          chalk.dim(`  Total: ${fmt(totalPaid)} / ${fmt(totalExpected)}`),
      )
      console.log()
    } catch (err) {
      console.error(chalk.red(`\nError: ${err.message}`))
      process.exit(1)
    }

    process.exit(0)
  })
