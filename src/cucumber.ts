import { loadConfiguration, runCucumber } from '@cucumber/cucumber/api'
import {
  defineParameterType,
  setDefaultTimeout,
  setWorldConstructor,

  AfterAll,
  BeforeAll,
  DataTable
} from '@cucumber/cucumber'

import { resolveVariables } from './envs'
import { CukeWorld } from './step-definitions/world'
import { existsSync, mkdirSync } from 'fs'
import MemoryStream = require('memorystream')
import { join } from 'path'
import { cwd } from 'process'
import Debug from 'debug'

const debug = Debug('cuke')

interface Options {
  output: string
  env: string[][]
  failFast?: boolean

  // handles the typing of the indexable elements
  [index: string]: any
}

function initCucumber (): void {
  defineParameterType({
    name: 'arg',
    // match any character but only double quotes if escaped by backslash
    regexp: /([^"\\]*(\\.[^"\\]*)*)/,
    transformer: (value) => value,
    useForSnippets: false
  })

  defineParameterType({
    name: 'variable',
    // match any character but only double quotes if escaped by backslash
    regexp: /([^"\\]*(\\.[^"\\]*)*)/,
    transformer: (value) => value,
    useForSnippets: false
  })

  setWorldConstructor(CukeWorld)
  setDefaultTimeout(30 * 1000)
}

// @ts-expect-error: 'resolveVariablesInArgs' is declared but its value is never read. [Error]
// eslint-disable-next-line
function resolveVariablesInArgs (args: any[]): any[] {
  /// XXX need to handle the table argument types here as well
  return args.map((value) => {
    if (value.rows !== undefined) {
      const data = value.raw()
      const rows = []

      for (const row of data) {
        const newRow = []
        for (let cell of row) {
          cell = resolveVariables(cell)
          newRow.push(cell)
        }
        rows.push(newRow)
      }

      return new DataTable(rows)
    } else if (typeof value === 'string') {
      return resolveVariables(value)
    } else {
      return value
    }
  })
}

// @ts-expect-error; 'pattern' is declared but its value is never read. [Error]
function Step (pattern: string | RegExp, options: any, code?: any): void {
  if (code == null && (typeof options === 'function')) {
    code = options
    options = {}
  }

  const argsString = [...Array(code.length)].map((_, i) => `arg${i}`)
  const evalString = `
    const { When } = require('@cucumber/cucumber')

    async function wrapper(${argsString.join(',')}) {
      const resolvedVariables = resolveVariablesInArgs(Array.from(arguments))
      await code.call(this, ...resolvedVariables)
    }

    When(pattern, options, wrapper)
  `

  // eslint-disable-next-line no-eval
  eval(evalString)
}

async function cucumber (paths: string[] = [], options: Options): Promise<void> {
  debug('cucumber', paths, options)
  process.env.OUTPUT_DIR = options.output

  if (!existsSync(options.output)) {
    mkdirSync(options.output)
  }

  for (const key in options) {
    // commander converts --foo-bar to fooBar so we only know there was a
    // break between the word foo and bar because of the capitalized letter
    const cukeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase()
    process.env[`CUKE_${cukeKey}`] = options[key]
  }

  // add any --env values passed to the command line to the environment
  options.env.forEach((pairs) => {
    process.env[pairs[0]] = pairs[1]
  })

  // details on configuration options documented here:
  // https://github.com/cucumber/cucumber-js/blob/main/docs/api/cucumber.loadconfiguration.md
  const configuration = {
    provided: {
      format: [
        `json:${options.output}/results.json`,
        `junit:${options.output}/results.xml`,
        `html:${options.output}/report.html`,
        join(__dirname, 'formatters', 'console.formatter.js')
      ],
      backtrace: true,
      paths,
      publish: false,
      failFast: options.failFast ?? false,
      requireModule: ['ts-node/register'],
      require: [
        // load framework steps from here
        join(__dirname, 'step-definitions/**/*.js'),
        join(__dirname, 'step-definitions/*.js'),

        // load custom local steps from a step-definitions directory
        // and handle .js or .ts files
        join(cwd(), 'features/step-definitions/**/*.ts'),
        join(cwd(), 'features/step-definitions/*.ts'),
        join(cwd(), 'features/step-definitions/**/*.js'),
        join(cwd(), 'features/step-definitions/*.js')
      ],
      formatOptions: {
        colorsEnabled: true,
        theme: {
          'feature keyword': ['magentaBright', 'bold'],
          'scenario keyword': ['magentaBright', 'bold'],
          'step keyword': ['cyan'],
          'docstring content': ['green'],
          'docstring delimiter': ['green']
        }
      }
    }
  }
  try {
    const { runConfiguration } = await loadConfiguration(configuration)
    const { success } = await runCucumber(runConfiguration)
    if (!success) {
      throw new Error('errors running tests, see above for details')
    }
  } finally {
    console.log('\nHTML report at output/report.html')
  }
}

async function steps (path: string, options: Options): Promise<void> {
  console.debug('steps', path, options)

  // details on configuration options documented here:
  // https://github.com/cucumber/cucumber-js/blob/main/docs/api/cucumber.loadconfiguration.md
  const configuration = {
    provided: {
      format: ['usage-json'],
      backtrace: true,
      path,
      publish: false,
      dryRun: true,
      requireModule: ['ts-node/register'],
      require: [
        // load framework steps from here
        join(__dirname, 'step-definitions/**/*.js'),
        // load custom local steps from a step-definitions directory
        // and handle .js or .ts files
        join(cwd(), 'step-definitions/**/*.ts'),
        join(cwd(), 'step-definitions/**/*.js')
      ]
    }
  }

  const { runConfiguration } = await loadConfiguration(configuration)
  const data: string[] = []
  const stream = new MemoryStream()
  stream.on('data', (chunk) => { data.push(chunk.toString()) })
  const { success } = await runCucumber(runConfiguration, { stdout: stream })
  if (!success) {
    throw new Error('errors running tests, see above for details')
  }

  interface Match {
    line: number
    text: string
    uri: string
  }

  interface Step {
    matches: Match[]
    code: string
    line: number
    pattern: string
    uri: string
  }

  const steps = (JSON.parse(data.join('')) as Step[])
  const maxStepPatternLength = Math.max(...steps.map((step: Step) => {
    return step.pattern.length
  }))
  for (const step of steps) {
    console.log(`${step.pattern.padEnd(maxStepPatternLength)} # from ${step.uri}:${step.line}`)
  }
}

export {
  cucumber,
  initCucumber,
  steps,

  AfterAll,
  BeforeAll,

  Step
}
