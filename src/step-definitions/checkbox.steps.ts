import type { CukeWorld, BrowserElement } from '../index'

import {
  defineActionSteps,
  defineInStateSteps,
  defineVisibilitySteps
} from './utils.steps'

async function findCheckbox (this: CukeWorld, name: string): Promise<BrowserElement> {
  return await this.findCheckbox(name)
}

async function checkCheckbox (this: CukeWorld, checkbox: BrowserElement): Promise<void> {
  await this.checkCheckbox(checkbox)
}

async function unCheckCheckbox (this: CukeWorld, checkbox: BrowserElement): Promise<void> {
  await this.unCheckCheckbox(checkbox)
}

async function isChecked (this: CukeWorld, checkbox: BrowserElement): Promise<boolean> {
  return await this.isChecked(checkbox)
}

async function isUnchecked (this: CukeWorld, checkbox: BrowserElement): Promise<boolean> {
  return await this.isUnchecked(checkbox)
}

defineActionSteps('check', checkCheckbox, 'checkbox', findCheckbox)
defineActionSteps('uncheck', unCheckCheckbox, 'checkbox', findCheckbox)
defineInStateSteps('checkbox', findCheckbox, 'checked', isChecked)
defineInStateSteps('checkbox', findCheckbox, 'unchecked', isUnchecked)
defineVisibilitySteps('checkbox', findCheckbox)
