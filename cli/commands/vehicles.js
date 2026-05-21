import { Command } from 'commander'
import chalk from 'chalk'
import Table from 'cli-table3'
import store from '../store/store.js'
import * as actions from '../../src/actions/taxi/taxiVehicleActions'
import { setTenantId } from '../../src/services/tenantContext'
import { waitForSaga } from '../utils/dispatch.js'

export const vehiclesCommand = new Command('vehicles')
  .description('List taxi vehicles from tapsi')
  .requiredOption('--tenant <id>', 'Tenant ID (required)')
  .option('--inactive', 'Include inactive vehicles', false)
  .option('--format <fmt>', 'Output format: table | json', 'table')
  .action(async (opts) => {
    setTenantId(opts.tenant)

    process.stdout.write(chalk.cyan('Fetching vehicles...\n'))

    try {
      const data = await waitForSaga(store, actions.fetchRequest(), {
        isFetching: (s) => s.taxiVehicle.fetching,
        getResult: (s) => s.taxiVehicle.data ?? [],
      })

      const rows = opts.inactive ? data : data.filter((v) => v.active !== false)

      if (opts.format === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        process.exit(0)
      }

      if (rows.length === 0) {
        console.log(chalk.yellow('No vehicles found.'))
        process.exit(0)
      }

      const table = new Table({
        head: ['#', 'Plate', 'Brand', 'Model', 'Year', 'Active'].map((h) =>
          chalk.bold.white(h),
        ),
        style: { compact: true, 'padding-left': 1 },
      })

      rows.forEach((v, i) => {
        const active = v.active !== false
        table.push([
          chalk.gray(i + 1),
          chalk.bold.cyan(v.plate ?? '-'),
          v.brand ?? '-',
          v.model ?? '-',
          v.year ?? '-',
          active ? chalk.green('yes') : chalk.red('no'),
        ])
      })

      const total = data.length
      const active = data.filter((v) => v.active !== false).length
      console.log(
        chalk.bold.blue(`\nVehicles — ${rows.length} shown`) +
          chalk.dim(`  (${active} active / ${total} total)`),
      )
      console.log(table.toString())
      console.log()
    } catch (err) {
      console.error(chalk.red(`\nError: ${err.message}`))
      process.exit(1)
    }

    process.exit(0)
  })
