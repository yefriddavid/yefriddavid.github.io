import { Command } from 'commander'
import chalk from 'chalk'
import Table from 'cli-table3'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../shims/settings.js'
import { getTenants } from '../../../src/services/firebase/admin/tenants'

async function signIn(username, pass) {
  const email = `${username.toLowerCase().trim()}@cashflow.app`
  await signInWithEmailAndPassword(auth, email, pass)
}

export const tenantsCommand = new Command('tenants')
  .description('List all tenants')
  .option('--user <username>', 'CashFlow username for auth')
  .option('--pass <password>', 'CashFlow password for auth')
  .option('--inactive', 'Include inactive tenants')
  .option('--format <fmt>', 'table | json', 'table')
  .action(async (opts) => {
    if (opts.user && opts.pass) {
      try {
        process.stdout.write(chalk.cyan('Authenticating...\n'))
        await signIn(opts.user, opts.pass)
        process.stdout.write(chalk.dim(`  Signed in as ${auth.currentUser?.email}\n`))
      } catch (err) {
        console.error(chalk.red(`Auth failed: ${err.message}`))
        process.exit(1)
      }
    }

    process.stdout.write(chalk.cyan('Fetching tenants...\n'))
    try {
      const all = await getTenants()
      const rows = opts.inactive ? all : all.filter((t) => t.active !== false)

      if (opts.format === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        process.exit(0)
      }

      if (rows.length === 0) {
        console.log(chalk.yellow('No tenants found.'))
        process.exit(0)
      }

      const table = new Table({
        head: ['ID', 'Name', 'Slug', 'Plan', 'Contact', 'Active'].map((h) => chalk.bold.white(h)),
        style: { compact: true, 'padding-left': 1 },
      })
      rows.forEach((t) => {
        table.push([
          chalk.dim(t.id),
          chalk.white(t.name ?? '-'),
          t.slug ?? '-',
          t.plan ?? '-',
          t.contactEmail ?? t.contactName ?? '-',
          t.active !== false ? chalk.green('yes') : chalk.red('no'),
        ])
      })

      console.log(chalk.bold.blue(`\nTenants — ${rows.length} found`))
      console.log(table.toString())
      console.log()
    } catch (err) {
      console.error(chalk.red(`\nError: ${err.message}`))
      process.exit(1)
    }

    process.exit(0)
  })
