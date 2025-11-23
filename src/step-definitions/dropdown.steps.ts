import type { CukeWorld, WebElement } from '../index'
import { Step } from '../index'
import {
  defineVisibilitySteps
} from './utils.steps'

async function findDropdown (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findDropdown(name)
}

defineVisibilitySteps('dropdown', findDropdown)

Step('I select the option "{arg}" from the dropdown "{arg}"',
  async function (this: CukeWorld, optionName: string, dropdownName: string) {
    await this.waitFor(async () => {
      await this.selectOptionInDropdown(optionName, dropdownName)
    })
  }
)

Step('I should see the option "{arg}" in the dropdown "{arg}" is selected',
  async function (this: CukeWorld, optionName: string, dropdownName: string) {
    await this.waitFor(async () => {
      /// XXX needs work to actually associate the option to the dropdown name
      const option = await this.findDropdownOption(optionName)
      if (option === undefined) {
        throw new Error(
          `unable to find dropdown "${dropdownName}" option "${optionName}"`
        )
      }

      const selected = await option.getAttribute('selected')
      if (selected === undefined) {
        throw new Error(`dropdown option "${optionName}" is not selected`)
      }
    })
  }
)
