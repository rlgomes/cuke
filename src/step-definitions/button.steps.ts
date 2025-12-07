import type { CukeWorld, BrowserElement } from '../index'
import {
  defineActionSteps,
  defineVisibilitySteps,
  defineInStateSteps
} from './utils.steps'

async function findButton (this: CukeWorld, name: string): Promise<BrowserElement> {
  return await this.findButton(name)
}

async function clickElement (this: CukeWorld, element: BrowserElement): Promise<void> {
  await this.clickElement(element)
}

async function isEnabled (this: CukeWorld, element: BrowserElement): Promise<boolean> {
  return await this.isEnabled(element)
}

async function isDisabled (this: CukeWorld, element: BrowserElement): Promise<boolean> {
  return await this.isDisabled(element)
}

defineActionSteps('click', clickElement, 'button', findButton)
defineVisibilitySteps('button', findButton)
defineInStateSteps('button', findButton, 'enabled', isEnabled)
defineInStateSteps('button', findButton, 'disabled', isDisabled)
