import type { CukeWorld, WebElement } from './world'

import {
  defineActionSteps,
  defineInStateSteps,
  defineVisibilitySteps
} from './utils.steps'

async function findRadio (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findRadio(name)
}

async function selectRadio (this: CukeWorld, element: WebElement): Promise<void> {
  await this.selectRadio(element)
}

async function isSelected (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isChecked(element)
}

async function isNotSelected (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isUnchecked(element)
}

defineActionSteps('select', selectRadio, 'radio button', findRadio)
defineInStateSteps('radio button', findRadio, 'selected', isSelected)
defineInStateSteps('radio button', findRadio, 'not selected', isNotSelected)
defineVisibilitySteps('radio button', findRadio)
