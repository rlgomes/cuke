import { type BrowserPlatform } from '../BrowserPlatform'
import { type BrowserElement } from '../BrowserElement'
import { SeleniumElement } from './SeleniumElement'
import { Builder, By, logging, type WebDriver, type WebElement } from 'selenium-webdriver'
import * as chrome from 'selenium-webdriver/chrome'
import 'chromedriver'

export class SeleniumBrowserPlatform implements BrowserPlatform {
  driver: WebDriver | undefined

  async open (url: string): Promise<void> {
    if (this.driver === undefined) {
      const options = new chrome.Options()
      const prefs = new logging.Preferences()
      prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL)
      options.setLoggingPrefs(prefs)

      const width: string = process.env.CUKE_BROWSER_WIDTH ?? '1920'
      const height: string = process.env.CUKE_BROWSER_HEIGHT ?? '1200'

      options.addArguments(`--window-size=${width},${height}`)

      const userDataDir: string | undefined = process.env.CHROME_USER_DATA_DIR
      if (userDataDir != null) {
        options.addArguments(`--user-data-dir=${userDataDir}`)
      }

      if (process.env.CUKE_HEADLESS === 'true') {
        options.addArguments('--headless')
      }

      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build()
    }

    await this.driver.get(url)
    await this.waitForPageToLoad()
  }

  async refresh (): Promise<void> {
    await this.driver?.navigate().refresh()
  }

  async executeScript (script: string, ...args: any[]): Promise<any> {
    // Unwrap SeleniumElements to WebElements for the driver
    const unwrappedArgs = args.map(arg => {
      if (arg instanceof SeleniumElement) {
        return arg.getRawElement()
      }
      return arg
    })

    const result = await this.driver?.executeScript(script, ...unwrappedArgs)

    // Wrap WebElements back to SeleniumElements
    if (Array.isArray(result)) {
      return result.map(item => {
        if (this.isWebElement(item)) {
          return new SeleniumElement(item)
        }
        return item
      })
    } else if (this.isWebElement(result)) {
      return new SeleniumElement(result as WebElement)
    }

    return result
  }

  private isWebElement (obj: any): boolean {
    return obj != null && typeof obj.click === 'function' && typeof obj.sendKeys === 'function'
  }

  async findElements (selector: string): Promise<BrowserElement[]> {
    const elements = await this.driver?.findElements(By.css(selector)) ?? []
    return elements.map(e => new SeleniumElement(e))
  }

  async findElement (selector: string): Promise<BrowserElement> {
    const element = await this.driver?.findElement(By.css(selector))
    if (element == null) {
      throw new Error(`Element not found: ${selector}`)
    }
    return new SeleniumElement(element)
  }

  async switchToFrame (element: BrowserElement): Promise<void> {
    if (element instanceof SeleniumElement) {
      await this.driver?.switchTo().frame(element.getRawElement())
    } else {
      throw new Error('Invalid element type for Selenium platform')
    }
  }

  async switchToDefaultContent (): Promise<void> {
    await this.driver?.switchTo().defaultContent()
  }

  async getCurrentUrl (): Promise<string> {
    return await this.driver?.getCurrentUrl() ?? ''
  }

  async getWindowHandle (): Promise<string> {
    return await this.driver?.getWindowHandle() ?? ''
  }

  async getAllWindowHandles (): Promise<string[]> {
    return await this.driver?.getAllWindowHandles() ?? []
  }

  async switchToWindow (handle: string): Promise<void> {
    await this.driver?.switchTo().window(handle)
  }

  async closeCurrentWindow (): Promise<void> {
    await this.driver?.close()
  }

  async hover (element: BrowserElement): Promise<void> {
    if (element instanceof SeleniumElement) {
      await this.driver?.actions().move({ origin: element.getRawElement() }).perform()
    }
  }

  async takeScreenshot (): Promise<string> {
    return await this.driver?.takeScreenshot() ?? ''
  }

  async getConsoleLogs (): Promise<string[]> {
    const entries = await this.driver?.manage().logs().get(logging.Type.BROWSER) ?? []
    return entries.map((entry: logging.Entry) => {
      const date = new Date(entry.timestamp).toLocaleString()
      const level: string = entry.level.toString().padEnd(7, ' ')
      return `${date}: ${level} - ${entry.message}`
    })
  }

  async quit (): Promise<void> {
    await this.driver?.quit()
    this.driver = undefined
  }

  async waitForPageToLoad (): Promise<void> {
    if (this.driver == null) return
    await this.driver.wait(async () => {
      if (this.driver == null) return
      const readyState = await this.driver.executeScript('return document.readyState')
      return readyState === 'complete'
    }, 20000)
  }
}
