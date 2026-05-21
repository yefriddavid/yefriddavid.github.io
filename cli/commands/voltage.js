import { Command } from 'commander'
import chalk from 'chalk'
import Table from 'cli-table3'
import store from '../store/store.js'
import * as actions from '../../src/actions/domotica/domoticaTransactionActions'
import { waitForSaga } from '../utils/dispatch.js'

const voltageColor = (val) => {
  if (val == null) return chalk.gray('-')
  const n = parseFloat(val)
  if (n >= 12.5) return chalk.green(String(val))
  if (n >= 11.8) return chalk.yellow(String(val))
  return chalk.red(String(val))
}

export const voltageCommand = new Command('voltage')
  .description('Voltage history from Domotica_transactions')
  .option('--from <date>', 'Start date ISO, e.g. 2026-05-01')
  .option('--to <date>', 'End date ISO, e.g. 2026-05-20')
  .option('--limit <n>', 'Max rows to display', '100')
  .option('--format <fmt>', 'Output format: table | json', 'table')
  .action(async (opts) => {
    const payload = {}
    if (opts.from) payload.startDate = opts.from
    if (opts.to) payload.endDate = opts.to

    process.stdout.write(chalk.cyan('Fetching voltage history...\n'))

    try {
      const data = await waitForSaga(
        store,
        actions.fetchVoltageRequest(Object.keys(payload).length ? payload : undefined),
        {
          isFetching: (s) => s.domoticaTransaction.voltageFetching,
          getResult: (s) => s.domoticaTransaction.voltageData ?? [],
        },
      )

      const rows = data.slice(0, parseInt(opts.limit, 10))

      if (opts.format === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        process.exit(0)
      }

      if (rows.length === 0) {
        console.log(chalk.yellow('No records found for the specified range.'))
        process.exit(0)
      }

      const table = new Table({
        head: ['#', 'Date', 'Value', 'Unit', 'Device', 'Description'].map((h) =>
          chalk.bold.white(h),
        ),
        style: { compact: true, 'padding-left': 1 },
      })

      rows.forEach((r, i) => {
        table.push([
          chalk.gray(i + 1),
          chalk.dim(r.createdAt?.slice(0, 19).replace('T', ' ') ?? '-'),
          voltageColor(r.value ?? r.amount),
          r.unit ?? '-',
          chalk.cyan(r.device ?? '-'),
          r.description ?? '-',
        ])
      })

      const range = opts.from || opts.to
        ? chalk.dim(`  ${opts.from ?? 'last 24h'} → ${opts.to ?? 'now'}`)
        : chalk.dim('  Last 24 hours')

      console.log(chalk.bold.blue(`\nVoltage History — ${rows.length} records`) + '  ' + range)
      console.log(table.toString())
      console.log()
    } catch (err) {
      console.error(chalk.red(`\nError: ${err.message}`))
      process.exit(1)
    }

    process.exit(0)
  })
