import type { CukeWorld, WebElement } from './world'
import {
  defineActionSteps,
  defineVisibilitySteps,
  defineInStateSteps
} from './utils.steps'

async function findButton (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findButton(name)
}

async function clickButton (this: CukeWorld, element: WebElement): Promise<void> {
  await this.clickElement(element)
}

async function isEnabled (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isEnabled(element)
}

async function isDisabled (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isDisabled(element)
}

defineActionSteps('click', clickButton, 'button', findButton)
defineVisibilitySteps('button', findButton)
defineInStateSteps('button', findButton, 'enabled', isEnabled)
defineInStateSteps('button', findButton, 'disabled', isDisabled)
