#!/usr/bin/env node
import { Command } from 'commander'
import { voltageCommand } from './commands/voltage.js'
import { driversCommand } from './commands/drivers.js'
import { vehiclesCommand } from './commands/vehicles.js'

const program = new Command()
  .name('my-admin')
  .description('My Admin CLI — same Redux/Saga stack, terminal output')
  .version('1.0.0')

program.addCommand(voltageCommand)
program.addCommand(driversCommand)
program.addCommand(vehiclesCommand)

program.parse(process.argv)
