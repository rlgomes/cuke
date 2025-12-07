import type { CukeWorld, BrowserElement } from '../index'

import {
  defineActionSteps,
  defineInStateSteps,
  defineVisibilitySteps
} from './utils.steps'

async function findRadio (this: CukeWorld, name: string): Promise<BrowserElement> {
  return await this.findRadio(name)
}

async function selectRadio (this: CukeWorld, radio: BrowserElement): Promise<void> {
  await this.selectRadio(radio)
}

async function isSelected (this: CukeWorld, radio: BrowserElement): Promise<boolean> {
  return await this.isChecked(radio)
}

async function isNotSelected (this: CukeWorld, radio: BrowserElement): Promise<boolean> {
  return await this.isUnchecked(radio)
}

defineActionSteps('select', selectRadio, 'radio button', findRadio)
defineInStateSteps('radio button', findRadio, 'selected', isSelected)
defineInStateSteps('radio button', findRadio, 'not selected', isNotSelected)
defineVisibilitySteps('radio button', findRadio)
