#!/usr/bin/env node

import { Command } from 'commander'
import { cucumber, steps } from './cucumber'
import * as dotenv from 'dotenv'
import Debug from 'debug'

// load .env from current working directory
dotenv.config()

console.debug = process.env.DEBUG !== undefined ? console.debug : () => {}

const program = new Command()

function envCollect (value: string, array: string[][]): string[][] {
  array.push(value.split('='))
  return array
}

function setupDebug (value: string): string {
  Debug.enable(value)
  return value
}

program
  .name('cuke')
  .version('0.1')
  .description('cuke e2e testing framework')
  .option('-v, --verbose', 'log more verbose details')
  .option('-d, --debug <level>', 'turn on debug logging or a specific logger', setupDebug)

program
  .command('run')
  .argument('<path...>')
  .option('-e, --env [key=value]', 'define runtime variables', envCollect, [])
  .option('-o, --output <output path>', 'path to store the results at', 'output')
  .option('--headless', 'run with the browser in headless mode', true)
  .option('--no-headless', 'run with the browser not in headless mode', false)
  .option(
    '--keep-browser-alive',
    'keep the browser running after scenario completes',
    false
  )
  .option('--fail-fast', 'stop running tests after the first failure', false)
  .description('run a feature file or directory of features')
  .action(async (paths: string[], options: any) => {
    await cucumber(paths, options).catch((error) => {
      program.error(error)
    })
  })

program
  .command('steps')
  .argument('[path]',
    'path containing step definitions and/or feature files',
    'feature')
  .description('list all available steps in a human readable format')
  .action(async (path: string, options: any) => {
    await steps(path, options)
  })

program.parse(process.argv)
