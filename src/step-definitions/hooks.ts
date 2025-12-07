import {
  After,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep
} from '@cucumber/cucumber'
import * as captureConsole from 'capture-console'
import { dirname } from 'path'
import { initCucumber } from '../cucumber'
import { v4 as uuidv4 } from 'uuid'
import { loadEnvs } from '../envs'

initCucumber()

Before({ tags: '@disabled' }, function () {
  return 'skipped'
})

BeforeAll(function (this: any) {
  process.env.RUN_ID = uuidv4().split('-')[0]
})

Before(function (this: any, testCase: any) {
  process.env.SCENARIO_RUN_ID = uuidv4().split('-')[0]
  process.env.FEATURE_DIR = dirname(testCase.gherkinDocument.uri)
  loadEnvs(testCase.gherkinDocument.uri)
})

After(async function () {
  if (this.browser !== undefined) {
    // collect browser logs and attach to the cucumber-js results
    const logs: string[] = await this.browser.getConsoleLogs()

    if (logs.length !== 0) {
      this.attach(
        `browser console log:\n${logs.join('\n')}`,
        'text/html'
      )
    }

    if (process.env.CUKE_KEEP_BROWSER_ALIVE !== 'true') {
      await this.browser.quit()
      // this.browser = undefined // BrowserPlatform handles its own state, or we can set it to undefined if we want to enforce it
    }
  }
})

BeforeStep(async function () {
  captureConsole.stopCapture(process.stdout)
  captureConsole.stopCapture(process.stderr)

  // capture the stdout/stderr so we can attach it to the end of each steps
  // output in the report as console output that would make the reports a little
  // easier to read
  const capturedOutput: string[] = []
  this.capturedOutput = capturedOutput
  captureConsole.startCapture(process.stdout, (data: string) => {
    capturedOutput.push(data)
  })
  captureConsole.startCapture(process.stderr, (data: string) => {
    capturedOutput.push(data)
  })
})

AfterStep(async function () {
  if (this.browser !== undefined) {
    const image = await this.browser.takeScreenshot()
    this.attach(image, 'base64:image/png')
  }

  // all stdout/stderr captured is attached as HTML after each step in the
  // report
  for (let index = 0; index < this.capturedOutput.length; index++) {
    const data: string = this.capturedOutput[index]
    this.attach(data, 'text/html')
  }
  this.capturedOutput = []
})
