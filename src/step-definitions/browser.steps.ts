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

defineElementValueSteps('browser URL', getCurrentURL)
