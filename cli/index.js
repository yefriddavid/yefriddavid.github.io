#!/usr/bin/env node
import { Command } from 'commander'
import { voltageCommand } from './commands/voltage.js'
import { driversCommand } from './commands/drivers.js'
import { vehiclesCommand } from './commands/vehicles.js'
import { accountStatusCommand } from './commands/finance/accountStatus.js'
import { tenantsCommand } from './commands/sys/tenants.js'
import { usersCommand } from './commands/sys/users.js'

// Stubs for browser globals used by firebaseClient.handleAuthFailure (runs at command time, not module init)
if (typeof localStorage === 'undefined')
  global.localStorage = { removeItem() {}, getItem() { return null }, setItem() {} }
if (typeof window === 'undefined') global.window = { location: { hash: '' } }

const program = new Command()
  .name('my-admin')
  .description('My Admin CLI — same Redux/Saga stack, terminal output')
  .version('1.0.0')

program.addCommand(voltageCommand)
program.addCommand(driversCommand)
program.addCommand(vehiclesCommand)

const financeCommand = new Command('finance').description('CashFlow finance commands')
financeCommand.addCommand(accountStatusCommand)
program.addCommand(financeCommand)

const sysCommand = new Command('sys').description('System admin commands')
sysCommand.addCommand(tenantsCommand)
sysCommand.addCommand(usersCommand)
program.addCommand(sysCommand)

program.parse(process.argv)
