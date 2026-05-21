import { Command } from 'commander'
import chalk from 'chalk'
import Table from 'cli-table3'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../shims/settings.js'
import { getAllUsers } from '../../../src/services/firebase/security/users'

async function signIn(username, pass) {
  const email = `${username.toLowerCase().trim()}@cashflow.app`
  await signInWithEmailAndPassword(auth, email, pass)
}

export const usersCommand = new Command('users')
  .description('List all users')
  .option('--user <username>', 'CashFlow username for auth')
  .option('--pass <password>', 'CashFlow password for auth')
  .option('--tenant <id>', 'Filter by tenant ID')
  .option('--inactive', 'Include inactive users')
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

    process.stdout.write(chalk.cyan('Fetching users...\n'))
    try {
      let rows = await getAllUsers()
      if (!opts.inactive) rows = rows.filter((u) => u.active !== false)
      if (opts.tenant) rows = rows.filter((u) => u.tenantId === opts.tenant)

      if (opts.format === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        process.exit(0)
      }

      if (rows.length === 0) {
        console.log(chalk.yellow('No users found.'))
        process.exit(0)
      }

      const table = new Table({
        head: ['Username', 'Name', 'Role', 'Email', 'Tenant', 'Active'].map((h) =>
          chalk.bold.white(h),
        ),
        style: { compact: true, 'padding-left': 1 },
      })
      rows.forEach((u) => {
        table.push([
          chalk.white(u.username),
          u.name ?? '-',
          u.role ?? '-',
          chalk.dim(u.email ?? '-'),
          chalk.dim(u.tenantId ?? '-'),
          u.active !== false ? chalk.green('yes') : chalk.red('no'),
        ])
      })

      console.log(chalk.bold.blue(`\nUsers — ${rows.length} found`))
      console.log(table.toString())
      console.log()
    } catch (err) {
      console.error(chalk.red(`\nError: ${err.message}`))
      process.exit(1)
    }

    process.exit(0)
  })
