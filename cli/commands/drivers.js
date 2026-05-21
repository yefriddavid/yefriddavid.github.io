import { Command } from 'commander'
import chalk from 'chalk'
import Table from 'cli-table3'
import store from '../store/store.js'
import * as actions from '../../src/actions/taxi/taxiDriverActions'
import { setTenantId } from '../../src/services/tenantContext'
import { waitForSaga } from '../utils/dispatch.js'

export const driversCommand = new Command('drivers')
  .description('List taxi drivers from tapsi')
  .requiredOption('--tenant <id>', 'Tenant ID (required)')
  .option('--inactive', 'Include inactive drivers', false)
  .option('--format <fmt>', 'Output format: table | json', 'table')
  .action(async (opts) => {
    setTenantId(opts.tenant)

    process.stdout.write(chalk.cyan('Fetching drivers...\n'))

    try {
      const data = await waitForSaga(store, actions.fetchRequest(), {
        isFetching: (s) => s.taxiDriver.fetching,
        getResult: (s) => s.taxiDriver.data ?? [],
      })

      const rows = opts.inactive ? data : data.filter((d) => d.active !== false)

      if (opts.format === 'json') {
        console.log(JSON.stringify(rows, null, 2))
        process.exit(0)
      }

      if (rows.length === 0) {
        console.log(chalk.yellow('No drivers found.'))
        process.exit(0)
      }

      const table = new Table({
        head: ['#', 'Name', 'ID', 'Phone', 'Default $', 'Sunday $', 'Vehicle', 'Active'].map(
          (h) => chalk.bold.white(h),
        ),
        style: { compact: true, 'padding-left': 1 },
      })

      rows.forEach((d, i) => {
        const active = d.active !== false
        table.push([
          chalk.gray(i + 1),
          active ? chalk.white(d.name ?? '-') : chalk.dim(d.name ?? '-'),
          chalk.dim(d.idNumber ?? '-'),
          d.phone ?? '-',
          d.defaultAmount != null ? chalk.green(`$${d.defaultAmount.toLocaleString()}`) : '-',
          d.defaultAmountSunday != null
            ? chalk.yellow(`$${d.defaultAmountSunday.toLocaleString()}`)
            : '-',
          chalk.cyan(d.defaultVehicle ?? '-'),
          active ? chalk.green('yes') : chalk.red('no'),
        ])
      })

      const total = data.length
      const active = data.filter((d) => d.active !== false).length
      console.log(
        chalk.bold.blue(`\nDrivers — ${rows.length} shown`) +
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
