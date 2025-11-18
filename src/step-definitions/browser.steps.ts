import { type CukeWorld, Step } from '../index'

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

async function assertBrowserUrlEquals (driver: any, url: string): Promise<void> {
  if (driver !== undefined) {
    const currentUrl: string = await driver.getCurrentUrl()
    if (url !== currentUrl) {
      throw new Error(`URL is "${currentUrl}" and not expected "${url}"`)
    }
  } else {
    throw new Error('no browser open')
  }
}

Step('I should see the browser URL is equal to "{}"',
  async function (this: CukeWorld, url: string) {
    await assertBrowserUrlEquals(this.driver, url)
  }
)

Step('I wait to see the browser URL is equal to "{}"',
  async function (this: CukeWorld, url: string) {
    await this.waitFor(async () => {
      await assertBrowserUrlEquals(this.driver, url)
    })
  }
)

async function assertBrowserUrlEndsWith (driver: any, fragment: string): Promise<void> {
  if (driver !== undefined) {
    const currentUrl: string = await driver.getCurrentUrl()
    if (!currentUrl.endsWith(fragment)) {
      throw new Error(`URL is "${currentUrl}" does not end with "${fragment}"`)
    }
  } else {
    throw new Error('no browser open')
  }
}

Step('I should see the browser URL ends with "{}"',
  async function (this: CukeWorld, fragment: string) {
    await assertBrowserUrlEndsWith(this.driver, fragment)
  }
)

Step('I wait to see the browser URL ends with "{}"',
  async function (this: CukeWorld, fragment: string) {
    await this.waitFor(async () => {
      await assertBrowserUrlEndsWith(this.driver, fragment)
    })
  }
)
