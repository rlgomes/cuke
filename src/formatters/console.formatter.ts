import {
  type IFormatterOptions,
  Formatter,
  formatterHelpers,
  Status
} from '@cucumber/cucumber'

import { Duration } from 'luxon'
import * as messages from '@cucumber/messages'
import { dataTableToString } from './table.utils'
import chalk from 'chalk'
import { findVariables, resolveVariables } from '../envs'

const { formatLocation, GherkinDocumentParser, PickleParser } = formatterHelpers
const { getGherkinScenarioMap, getGherkinStepMap } = GherkinDocumentParser

const { getPickleStepMap } = PickleParser

const marks = {
  [Status.AMBIGUOUS]: '✔',
  [Status.FAILED]: '✘',
  [Status.PASSED]: '✔',
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?',
  [Status.UNKNOWN]: '?'
}

export default class ConsoleFormatter extends Formatter {
  private uri?: string
  private longestLineLength: number
  private testRunDuration: messages.Duration | undefined
  private testRunStarted: messages.TestRunStarted | undefined
  private failedScenarios: Record<string, Record<string, string>>
  readonly runStats: Record<string, Record<string, number>>

  constructor (options: IFormatterOptions) {
    super(options)
    this.longestLineLength = -1
    this.parseEnvelope = this.parseEnvelope.bind(this)
    options.eventBroadcaster.on('envelope', this.parseEnvelope)
    this.failedScenarios = {}
    this.runStats = {
      scenarios: {
        passed: 0,
        failed: 0,
        skipped: 0,
        undefined: 0,
        total: 0
      },
      steps: {
        passed: 0,
        failed: 0,
        skipped: 0,
        undefined: 0,
        total: 0
      }
    }
    this.testRunDuration = undefined
  }

  indentString (value: string, indent: string): string {
    return value
      .split('\n')
      .map((line) => `${indent}${line}`)
      .join('\n')
  }

  renderTags (indent: number, tags: ReadonlyArray<{ name: string }>): void {
    const tagStrings = tags.reduce<string[]>(
      (tags, tag) => ((tag.name ?? '') !== '' ? [...tags, tag.name] : tags),
      []
    )

    if (tagStrings.length > 0) {
      const firstTag = tagStrings.shift() as string
      this.log(' '.repeat(indent) + chalk.blue(firstTag))
      tagStrings.forEach((tag) => {
        this.log(' ')
        this.log(chalk.blue(tag))
      })
      this.log('\n')
    }
  }

  renderLocation (line: number): void {
    this.log(chalk.gray(`# ${formatLocation({ uri: this.uri ?? '', line }, process.cwd())}`))
  }

  renderFeatureHead (feature: messages.Feature): void {
    this.renderTags(0, feature.tags)
    this.log(chalk.magenta(`${feature.keyword}: `) + feature.name)
    if (feature.location !== undefined) {
      this.log(' ')
      this.renderLocation(feature.location.line)
      this.log('\n')
    }
    if (feature.description !== undefined) {
      this.log(`  ${feature.description.trim()}`)
      this.log('\n')
    }
  }

  renderScenarioHead (
    gherkinDocument: messages.GherkinDocument,
    pickle: messages.Pickle
  ): void {
    this.renderTags(2, pickle.tags)
    const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument)

    if (pickle.astNodeIds === undefined) {
      throw new Error('Pickle AST nodes missing')
    }

    const scenario: messages.Scenario = gherkinScenarioMap[pickle.astNodeIds[0]]

    this.longestLineLength = `  ${scenario.keyword}: ${pickle.name}`.length
    const pickleStepMap = getPickleStepMap(pickle)
    for (let index = 0; index < pickle.steps.length; index++) {
      const step: any = pickle.steps[index]
      const gherkinStepMap = getGherkinStepMap(gherkinDocument)
      const pickleStep = pickleStepMap[step.id]
      const astNodeId = pickleStep.astNodeIds[0]
      const gherkinStep = gherkinStepMap[astNodeId]
      const line = `    ${gherkinStep.keyword.padStart(6, ' ')}${
        gherkinStep.text
      }`
      if (line.length > this.longestLineLength) {
        this.longestLineLength = line.length
      }
    }

    this.log(chalk.magenta(`  ${scenario.keyword}: `) + pickle.name)
    if (gherkinScenarioMap[pickle.astNodeIds[0]] !== undefined) {
      this.log(' ')
      this.renderLocation(scenario.location?.line)
    }
    this.log('\n')
  }

  onTestCaseStarted (testCaseStarted: messages.TestCaseStarted): void {
    const { gherkinDocument, pickle } =
      this.eventDataCollector.getTestCaseAttempt(testCaseStarted.id ?? '')
    const { feature } = gherkinDocument

    if (this.uri !== gherkinDocument.uri && feature != null) {
      // start of a new feature file
      this.uri = gherkinDocument.uri ?? ''
      this.renderFeatureHead(feature)
      this.log('\n')
    }

    this.renderScenarioHead(gherkinDocument, pickle)
    this.runStats.scenarios.total += 1
  }

  onTestStepStarted (_: messages.TestStepStarted): void {
    this.runStats.steps.total += 1
  }

  onTestStepFinished (testStepFinished: messages.TestStepFinished): void {
    const { gherkinDocument, pickle, testCase } =
      this.eventDataCollector.getTestCaseAttempt(
        testStepFinished.testCaseStartedId ?? ''
      )

    const pickleStepMap = getPickleStepMap(pickle)
    const gherkinStepMap = getGherkinStepMap(gherkinDocument)
    const testStep = (testCase.testSteps ?? []).find(
      (item) => item.id === testStepFinished.testStepId
    )

    const { message, status } = testStepFinished.testStepResult ?? {}
    if (testStep?.pickleStepId !== undefined) {
      const pickleStep = pickleStepMap[testStep.pickleStepId]
      const astNodeId = pickleStep.astNodeIds[0]
      const gherkinStep = gherkinStepMap[astNodeId]

      const durationObj = testStepFinished.testStepResult.duration
      const durationSeconds = (durationObj.seconds + (durationObj.nanos / 1e9)).toFixed(3)

      this.runStats.steps[status.toLowerCase()] += 1

      let stepText = pickleStep.text

      if (status !== Status.SKIPPED) {
        if (status === Status.PASSED) {
          const stepArgs = Array.from(stepText.matchAll(/("[^"]*")/g))
          for (let index = 0; index < stepArgs.length; index++) {
            const stepArg = stepArgs[index][0]
            stepText = stepText.replace(stepArg, chalk.green(stepArg))
          }

          const line = `    ${gherkinStep.keyword.padStart(6, ' ')}${pickleStep.text}`
          const keyword = gherkinStep.keyword
          let coloredKeyword = ''

          if (keyword.trim() === 'Given') {
            coloredKeyword = chalk.magenta(keyword.padStart(6, ' '))
          } else {
            coloredKeyword = chalk.yellow(keyword.padStart(6, ' '))
          }

          this.log(`    ${coloredKeyword}` + stepText)
          this.log(chalk.gray(`${' '.repeat(this.longestLineLength - line.length)} # took ${durationSeconds}s`))
          this.log('\n')
        } else if (status === Status.UNDEFINED) {
          this.log(chalk.yellow(`    ${gherkinStep.keyword.padStart(6, ' ')}${stepText}`))
          this.log('\n')
        } else if (status === Status.FAILED) {
          const line = `    ${gherkinStep.keyword.padStart(6, ' ')}${stepText}`
          this.log(chalk.red(line))
          this.log(chalk.gray(`${' '.repeat(this.longestLineLength - line.length)} # took ${durationSeconds}s`))
          this.log('\n')
        }

        const variableNames: string[] = findVariables(pickleStep.text)
        const variables: string[] = []
        if (variableNames.length > 0) {
          variableNames.forEach((variableName) => {
            let variableValue = resolveVariables(['${', variableName, '}'].join(''))
            variableValue = (variableValue.length > 32) ? variableValue.substring(0, 32) + '...' : variableValue
            variables.push(`${variableName}=${variableValue}`)
          })
          this.log(chalk.gray(`      # ${variables.join(' ')}\n`))
        }

        if (gherkinStep.docString != null) {
          this.log(chalk.green(`      ${gherkinStep.docString.delimiter}`))
          this.log('\n')
          this.log(chalk.green(this.indentString(gherkinStep.docString.content, '      '))
          )
          this.log('\n')
          this.log(chalk.green(`      ${gherkinStep.docString.delimiter}`))
          this.log('\n')
        }

        if (gherkinStep.dataTable != null) {
          this.log(chalk.green(this.indentString(dataTableToString(gherkinStep.dataTable), '      ')))
          this.log('\n')
        }
      }
    }

    if (status !== Status.PASSED) {
      if (status === Status.FAILED) {
        this.log(chalk.red(`${marks[status]} ${Status[status].toLowerCase()}`))
        this.log('\n')
        if (message !== undefined) {
          this.log(chalk.red(message))
        }
        this.log('\n')
      }

      if (status === Status.UNDEFINED) {
        this.log(
          chalk.yellow(`${marks[status]} ${Status[status].toLowerCase()}`)
        )
        this.log('\n')

        if (message !== undefined) {
          this.log(chalk.yellow(message))
        }
        this.log('\n')
      }
    }
  }

  onTestCaseFinished (testCaseFinished: messages.TestCaseFinished): void {
    const { worstTestStepResult } = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
    const { gherkinDocument, pickle } = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId ?? '')

    const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument)

    if (pickle.astNodeIds === undefined) {
      throw new Error('Pickle AST nodes missing')
    }

    const scenario: messages.Scenario = gherkinScenarioMap[pickle.astNodeIds[0]]
    const status = worstTestStepResult.status

    if (status === Status.FAILED) {
      this.failedScenarios[scenario?.name ?? 'XXX'] = {
        uri: pickle.uri,
        line: scenario.location.line.toString()
      }
    }
    this.runStats.scenarios[status.toLowerCase()] += 1
    this.log('\n')
  }

  logIssues (): void {
  }

  onTestRunFinished (_testRunFinished: messages.TestRunFinished): void {
    if (Object.keys(this.failedScenarios).length !== 0) {
      this.log('Failures: \n')
    }
    // log the summary for the whole run
    let index = 1
    Object.keys(this.failedScenarios).forEach((scenarioName: string) => {
      this.log(`${index}) ${scenarioName}`)
      this.log(chalk.gray(` # cuke run ${this.failedScenarios[scenarioName].uri}:${this.failedScenarios[scenarioName].line}`))
      this.log('\n')
      index += 1
    })

    /*
     * now print the test run summary like so:
     *
     * 4 scenarios (1 failed, 1 undefined, 1 skipped, 1 passed)
     * 4 steps (1 failed, 1 undefined, 1 skipped, 1 passed)
     * 0m00.011s (executing steps: 0m00.002s)
     */
    this.log('\n')
    const stats = this.runStats
    const states = ['failed', 'undefined', 'skipped', 'passed']
    const scenarioDetails = states.map((state: string): string => {
      return `${stats.scenarios[state]} ${state}`
    }).join(', ')
    const stepsDetails = states.map((state: string): string => {
      return `${stats.steps[state]} ${state}`
    }).join(', ')
    this.log(`${stats.scenarios.total} scenarios (${scenarioDetails})\n`)
    this.log(`${stats.steps.total} steps (${stepsDetails})\n`)
    if (this.testRunDuration !== undefined) {
      const durationString = Duration.fromObject({
        seconds: this.testRunDuration.seconds + this.testRunDuration.nanos * 10E-9
      }).toFormat("m'm'ss.SSS")
      this.log(`${durationString}s\n`)
    }
  }

  parseEnvelope (envelope: messages.Envelope): void {
    if (envelope.testCaseStarted != null) {
      this.onTestCaseStarted(envelope.testCaseStarted)
    }
    if (envelope.testStepStarted != null) {
      this.onTestStepStarted(envelope.testStepStarted)
    }
    if (envelope.testStepFinished != null) {
      this.onTestStepFinished(envelope.testStepFinished)
    }
    if (envelope.testCaseFinished != null) {
      this.onTestCaseFinished(envelope.testCaseFinished)
    }
    if (envelope.testRunStarted != null) {
      this.testRunStarted = envelope.testRunStarted
    }
    if (envelope.testRunFinished != null) {
      if (this.testRunStarted !== undefined) {
        const start = messages.TimeConversion.timestampToMillisecondsSinceEpoch(this.testRunStarted.timestamp)
        const end = messages.TimeConversion.timestampToMillisecondsSinceEpoch(envelope.testRunFinished.timestamp)
        this.testRunDuration = messages.TimeConversion.millisecondsToDuration(end - start)
      }
      this.onTestRunFinished(envelope.testRunFinished)
    }
  }
}
