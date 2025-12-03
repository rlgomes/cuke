import { type CukeWorld, type WebElement, Step } from '../index'
import {
  defineVisibilitySteps,
  defineInStateSteps
} from './utils.steps'

import { By } from 'selenium-webdriver'

Step('I write "{arg}" into the input "{arg}"',
  async function (this: CukeWorld, value: string, name: string) {
    await this.waitFor(async () => {
      await this.writeIntoInput(name, value)
    })
  }
)

Step('I send the key "{arg}" to the input "{arg}"',
  async function (this: CukeWorld, key: string, name: string) {
    await this.waitFor(async () => {
      await this.sendKeyToInput(name, key)
    })
  }
)

Step('I send the key "{arg}" to the focused element',
  async function (this: CukeWorld, key: string) {
    await this.waitFor(async () => {
      const focused = await this.getFocusedElement()
      await this.sendKeyToElement(focused, key)
    })
  }
)

Step('I send the key "{arg}" to the page',
  async function (this: CukeWorld, key: string) {
    await this.waitFor(async () => {
      const body = this.driver.findElement(By.tagName('body'))
      await this.sendKeyToElement(body, key)
    })
  }
)

Step('I write "{arg}" into the input "{arg}" waiting up to "{seconds}" seconds',
  async function (this: CukeWorld, value: string, name: string, seconds: string) {
    await this.waitFor(async () => {
      await this.writeIntoInput(name, value)
    },
    {
      timeout: parseInt(seconds) * 1000
    })
  }
)

Step('I clear the input "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.clearInput(name)
  })

Step('I should see the input "{arg}" is equal to "{arg}"',
  async function (this: CukeWorld, name: string, value: string) {
    await this.waitFor(async () => {
      const input = await this.findInput(name)
      const inputValue: string = await input.getAttribute('value')
      if (inputValue !== value) {
        throw new Error(
          `input ${name} has value ${inputValue} instead of expected ${value}`
        )
      }
    })
  }
)

Step('I should see the input "{arg}" is equal to "{arg}" waiting up to "{seconds}" seconds',
  async function (this: CukeWorld, name: string, value: string, seconds: string) {
    await this.waitFor(async () => {
      const input = await this.findInput(name)
      const inputValue: string = await input.getAttribute('value')
      if (inputValue !== value) {
        throw new Error(
          `input ${name} has value ${inputValue} instead of expected ${value}`
        )
      }
    },
    {
      timeout: parseInt(seconds) * 1000
    })
  }
)

async function findInput (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findInput(name)
}

async function isEnabled (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isEnabled(element)
}

async function isDisabled (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isDisabled(element)
}

defineVisibilitySteps('input', findInput)
defineInStateSteps('input', findInput, 'enabled', isEnabled)
defineInStateSteps('input', findInput, 'disabled', isDisabled)
