import { type BrowserPlatform } from '../BrowserPlatform'
import { type BrowserElement } from '../BrowserElement'
import { PlaywrightElement } from './PlaywrightElement'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'

import { evalWrapper } from './PlaywrightEvalWrapper'

export class PlaywrightBrowserPlatform implements BrowserPlatform {
  browser: Browser | undefined
  context: BrowserContext | undefined
  page: Page | undefined
  currentContext: any

  async open (url: string): Promise<void> {
    if (this.browser === undefined) {
      const headless = process.env.CUKE_HEADLESS === 'true'
      this.browser = await chromium.launch({ headless })
      this.context = await this.browser.newContext({
        viewport: {
          width: parseInt(process.env.BROWSER_WIDTH ?? '1920'),
          height: parseInt(process.env.BROWSER_HEIGHT ?? '1200')
        }
      })
      this.page = await this.context.newPage()
      this.currentContext = this.page
    }

    if (this.page != null) {
      await this.page.goto(url)
    }
  }

  async refresh (): Promise<void> {
    await this.page?.reload()
  }

  async executeScript (script: string, ...args: any[]): Promise<any> {
    // Unwrap PlaywrightElements to ElementHandles/Locators
    const unwrappedArgs = args.map(arg => {
      if (arg instanceof PlaywrightElement) {
        return arg.getLocator()
      }
      return arg
    })

    // emulate selenium's executeScript behavior:
    const handle: any = await evalWrapper(this.currentContext, script, unwrappedArgs)
    if (handle == null) return null

    /* istanbul ignore next */
    const isArray: boolean = await handle.evaluate((obj: any) => { return Array.isArray(obj) })
    if (isArray) {
      /* istanbul ignore next */
      const length = await handle.evaluate((arr: any[]) => arr.length)
      const result = []
      for (let i = 0; i < length; i++) {
        const itemHandle = await handle.getProperty(String(i))
        const itemElement = itemHandle.asElement()
        if (itemElement != null) {
          result.push(new PlaywrightElement(itemElement))
        } else {
          result.push(await itemHandle.jsonValue())
        }
      }
      return result
    }

    const element = handle.asElement()
    if (element != null) {
      return new PlaywrightElement(element)
    }

    return handle.jsonValue()
  }

  async findElements (selector: string): Promise<BrowserElement[]> {
    if (this.currentContext == null) return []
    const locators = await this.currentContext.locator(selector).all()
    return locators.map((locator: any) => new PlaywrightElement(locator))
  }

  async findElement (selector: string): Promise<BrowserElement> {
    if (this.currentContext == null) throw new Error('Page not initialized')

    if (selector === ':focus') {
      /* istanbul ignore next */
      const handle = await this.currentContext.evaluateHandle(() => document.activeElement)
      const element = handle.asElement()
      if (element != null) {
        return new PlaywrightElement(element)
      }
      throw new Error('No active element found')
    }

    const locator = this.currentContext.locator(selector).first()
    // Playwright locator is lazy, so we might want to check if it exists?
    // But findElement usually implies waiting/existence.
    // For now, just return the locator wrapper.
    // To strictly match Selenium behavior of throwing if not found immediately:
    if (await locator.count() === 0) {
      throw new Error(`Element not found: ${selector}`)
    }
    return new PlaywrightElement(locator)
  }

  async switchToFrame (element: BrowserElement): Promise<void> {
    const locator = (element as PlaywrightElement).getLocator()
    let handle = locator
    if ((locator as any)?.elementHandle != null) {
      handle = await (locator as any)?.elementHandle()
    }
    if (handle != null) {
      const frame = await handle.contentFrame()
      if (frame != null) {
        this.currentContext = frame
        return
      }
    }
    throw new Error('Element is not a frame or frame not found')
  }

  async switchToDefaultContent (): Promise<void> {
    if (this.page != null) {
      this.currentContext = this.page
    }
  }

  async getCurrentUrl (): Promise<string> {
    return this.page?.url() ?? ''
  }

  async getWindowHandle (): Promise<string> {
    if (this.context != null && this.page != null) {
      const pages = this.context.pages()
      const currentPageIndex: number = pages.indexOf(this.page)
      return `page-${currentPageIndex}`
    }
    throw new Error('unable to determine current window handle')
  }

  async getAllWindowHandles (): Promise<string[]> {
    return this.context?.pages().map((_, i) => `page-${i}`) ?? []
  }

  async switchToWindow (handle: string): Promise<void> {
    // This is tricky mapping. We'd need to map handles to pages.
    // For now, assuming simple tab switching by index if handle is "page-N"
    if (handle.startsWith('page-')) {
      const index = parseInt(handle.split('-')[1])
      const pages = this.context?.pages() ?? []
      if (index >= 0 && index < pages.length) {
        this.page = pages[index]
        this.currentContext = this.page
        await this.page.bringToFront()
      }
    }
  }

  async closeCurrentWindow (): Promise<void> {
    await this.page?.close()
    // Update this.page to another open page if available?
    const pages = this.context?.pages() ?? []
    if (pages.length > 0) {
      this.page = pages[pages.length - 1]
      this.currentContext = this.page
    } else {
      this.page = undefined
      this.currentContext = undefined
    }
  }

  async hover (element: BrowserElement): Promise<void> {
    if (element instanceof PlaywrightElement) {
      await element.getLocator().hover()
    }
  }

  async takeScreenshot (): Promise<string> {
    if (this.page == null) return ''
    const buffer = await this.page.screenshot()
    return buffer.toString('base64')
  }

  async getConsoleLogs (): Promise<string[]> {
    // XXX: not implemented yet
    return []
  }

  async quit (): Promise<void> {
    await this.browser?.close()
    this.browser = undefined
    this.context = undefined
    this.page = undefined
  }

  async waitForPageToLoad (): Promise<void> {
    await this.page?.waitForLoadState('load')
  }
}
