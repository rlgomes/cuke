import type { CukeWorld, WebElement } from './world'
import {
  defineActionSteps,
  defineVisibilitySteps,
  defineInStateSteps
} from './utils.steps'

async function findSwitch (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findSwitch(name)
}

async function turnOnSwitch (this: CukeWorld, element: WebElement): Promise<void> {
  if (await this.isChecked(element)) {
    throw new Error('switch is already on')
  }
  await element.click()
}

async function turnOffSwitch (this: CukeWorld, element: WebElement): Promise<void> {
  if (await this.isUnchecked(element)) {
    throw new Error('switch is already off')
  }
  await element.click()
}

async function isOn (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isChecked(element)
}

async function isOff (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isUnchecked(element)
}

defineActionSteps('turn on', turnOnSwitch, 'switch', findSwitch)
defineActionSteps('turn off', turnOffSwitch, 'switch', findSwitch)
defineVisibilitySteps('switch', findSwitch)
defineInStateSteps('switch', findSwitch, 'on', isOn)
defineInStateSteps('switch', findSwitch, 'off', isOff)
