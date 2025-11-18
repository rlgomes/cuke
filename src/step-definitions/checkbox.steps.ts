import type { CukeWorld, WebElement } from './world'

import {
  defineActionSteps,
  defineInStateSteps,
  defineVisibilitySteps
} from './utils.steps'

async function findCheckbox (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findCheckbox(name)
}

async function checkCheckbox (this: CukeWorld, element: WebElement): Promise<void> {
  await this.checkCheckbox(element)
}

async function unCheckCheckbox (this: CukeWorld, element: WebElement): Promise<void> {
  await this.unCheckCheckbox(element)
}

async function isChecked (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isChecked(element)
}

async function isUnchecked (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isUnchecked(element)
}

defineActionSteps('check', checkCheckbox, 'checkbox', findCheckbox)
defineActionSteps('uncheck', unCheckCheckbox, 'checkbox', findCheckbox)
defineInStateSteps('checkbox', findCheckbox, 'checked', isChecked)
defineInStateSteps('checkbox', findCheckbox, 'unchecked', isUnchecked)
defineVisibilitySteps('checkbox', findCheckbox)
