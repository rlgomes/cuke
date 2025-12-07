import type { CukeWorld, BrowserElement } from '../index'
import { Step } from '../index'
import {
  defineVisibilitySteps
} from './utils.steps'

async function findText (this: CukeWorld, name: string): Promise<BrowserElement> {
  return await this.findText(name)
}

defineVisibilitySteps('text', findText)

Step('I hover over the text "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.hoverOverText(name)
  })
