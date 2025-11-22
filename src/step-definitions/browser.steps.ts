import { type CukeWorld, Step } from '../index'

import { defineElementValueSteps } from './utils.steps'

Step('I open a browser at "{arg}"',
  async function (this: CukeWorld, url: string) {
    await this.openBrowser(url)
  })

Step('I refresh the current page',
  async function (this: CukeWorld) {
    await this.refreshBrowser()
  })

Step('I navigate to "{arg}"',
  async function (this: CukeWorld, url: string) {
    if (this.driver === undefined) {
      throw new Error('no current browser open')
    }
    await this.driver.get(url)
    await this.waitForPageToLoad()
  })

Step('I close the current browser',
  async function (this: CukeWorld) {
    if (this.driver !== undefined) {
      await this.driver.close()
      this.driver = undefined
    } else {
      throw new Error('no current browser open')
    }
  })

async function getCurrentURL (this: CukeWorld): Promise<string> {
  return await this.getCurrentURL()
}

Step('I save the current browser URL to "{variable}"',
  async function (this: CukeWorld, variable: string) {
    const url = await this.getCurrentURL()
    process.env[variable] = url
  }
)

Step('I open a new tab',
  async function (this: CukeWorld) {
    await this.openNewTab()
  })

Step('I open a new tab at "{arg}"',
  async function (this: CukeWorld, url: string) {
    await this.openNewTab(url)
  })

Step('I switch to the next tab',
  async function (this: CukeWorld) {
    await this.switchToNextTab()
  })

Step('I switch to the previous tab',
  async function (this: CukeWorld) {
    await this.switchToPreviousTab()
  })

Step('I close the current tab',
  async function (this: CukeWorld) {
    await this.closeCurrentTab()
  })

defineElementValueSteps('browser URL', getCurrentURL)
