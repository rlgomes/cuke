import { World } from '@cucumber/cucumber'
import { Builder, logging } from 'selenium-webdriver'
import * as chrome from 'selenium-webdriver/chrome'
import Debug from 'debug'
import { readFileSync } from 'fs'
import { join } from 'path'
import { By, Key, type WebElement } from 'selenium-webdriver'
import { retry } from 'ts-retry-promise'

import 'chromedriver'

const JQUERY_JS = readFileSync(join(__dirname, '..', 'external', 'js', 'jquery.slim.min.js'), 'utf-8')
const FUZZY_JS = readFileSync(join(__dirname, '..', 'fuzzy.js'), 'utf-8')

export class CukeWorld extends World {
  driver: any = undefined
  debug = Debug('cuke')

  afterPageLoadChecks: Record<string, () => Promise<void>>

  constructor (options: any) {
    super(options)
    this.afterPageLoadChecks = {}
  }

  async handleSTDERR (text: string): Promise<void> {
    this.attach(`STDERR: ${text}`)
  }

  // XXX: here is where we can decide if selenium-webriver is enough or should
  // we use some other more generic browser automation framework that would allow
  // us to flip between webdriver/cypress/nightwatch/etc ?
  async openBrowser (url: string): Promise<void> {
    const options = new chrome.Options()

    const prefs = new logging.Preferences()
    prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL)
    options.setLoggingPrefs(prefs)

    const width: string = process.env.BROWSER_WIDTH ?? '1920'
    const height: string = process.env.BROWSER_HEIGHT ?? '1200'

    options.addArguments(`--window-size=${width},${height}`)

    const userDataDir = process.env.CHROME_USER_DATA_DIR ?? undefined
    if (userDataDir !== undefined) {
      options.addArguments(`--user-data-dir=${userDataDir}`)
    }

    if (process.env.CUKE_HEADLESS === 'true') {
      options.addArguments('--headless')
    }

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()

    await this.driver.get(url)
    await this.waitForPageToLoad()
  }

  async refreshBrowser (): Promise<void> {
    await this.driver.navigate().refresh()
  }

  async fuzzyFind (name: string, tags: string[], attributes: string[] = [], index: number = 0, direction: string = 'l2r', filterInvisible: boolean = true): Promise<WebElement> {
    const filterBy = filterInvisible ? ':visible' : ''
    this.debug(`fuzzy('${name}', ${JSON.stringify(tags)}, ${JSON.stringify(attributes)}, '${direction}', '${filterBy}')`)

    await this.driver.switchTo().defaultContent()
    let result = await this.driver.executeScript(
        `${JQUERY_JS};
        ${FUZZY_JS};
        return window.fuzzy.apply(this, arguments);`,
        name, tags, attributes, direction, filterBy
    )

    let element: WebElement = (result as WebElement[])[index]

    if (element === undefined) {
      const frames: WebElement[] = await this.driver.findElements(By.tagName('iframe'))

      for (const frame of frames) {
        this.debug('switch to default content')
        await this.driver.switchTo().defaultContent()
        this.debug(`switch to frame ${await frame.getAttribute('outerHTML')}`)
        await this.driver.switchTo().frame(frame)

        result = await this.driver.executeScript(
            `${JQUERY_JS};
            ${FUZZY_JS};
            return window.fuzzy.apply(this, arguments);`,
            name, tags, attributes, direction, filterBy
        )

        element = (result as WebElement[])[index]
        if (element !== undefined) {
          this.debug('fuzzy returning', await element.getAttribute('outerHTML'))
          return element
        }
      }
    }

    if (element !== undefined) {
      this.debug('fuzzy returning', await element.getAttribute('outerHTML'))
    }
    return element
  }

  buttonExpressions: string[] = [
    'a',
    'button',
    'input[type=submit]',
    '*[role=button]',
    'input[type=radio]',
    '*[role=menuitem]',
    '*[role=tab]'
  ]

  registerButtonCSSExpression (expression: string): void {
    this.buttonExpressions.push(expression)
  }

  async getCurrentURL (): Promise<string> {
    return this.driver.getCurrentUrl()
  }

  async getTabCount (): Promise<number> {
    const handles = await this.driver.getAllWindowHandles()
    return handles.length
  }

  async openNewTab (url?: string): Promise<void> {
    if (this.driver === undefined) {
      throw new Error('no current browser open')
    }

    // Store the current window handle
    const originalHandle = await this.driver.getWindowHandle()

    // Open a new tab using JavaScript
    await this.driver.executeScript('window.open(arguments[0] || "", "_blank")', url || '')

    // Get all window handles
    const handles = await this.driver.getAllWindowHandles()

    // Find the new handle (it should be different from the original)
    const newHandle = handles.find((handle: string) => handle !== originalHandle)

    if (newHandle === undefined) {
      throw new Error('failed to open new tab')
    }

    // Switch to the new tab
    await this.driver.switchTo().window(newHandle)

    // If a URL was provided, navigate to it
    if (url !== undefined && url !== '') {
      await this.driver.get(url)
      await this.waitForPageToLoad()
    }
  }

  async switchToTab (index: number): Promise<void> {
    if (this.driver === undefined) {
      throw new Error('no current browser open')
    }

    const handles = await this.driver.getAllWindowHandles()

    if (index < 0 || index >= handles.length) {
      throw new Error(`tab index ${index} is out of range. There are ${handles.length} tabs available.`)
    }

    await this.driver.switchTo().window(handles[index])
    await this.waitForPageToLoad()
  }

  async switchToNextTab (): Promise<void> {
    if (this.driver === undefined) {
      throw new Error('no current browser open')
    }

    const handles = await this.driver.getAllWindowHandles()

    if (handles.length < 2) {
      throw new Error('cannot switch tabs: only one tab is open')
    }

    const currentHandle = await this.driver.getWindowHandle()
    const currentIndex: number = handles.indexOf(currentHandle)

    if (currentIndex === -1) {
      throw new Error('current tab handle not found')
    }

    // Switch to next tab, wrapping around if at the end
    const nextIndex = (currentIndex + 1) % handles.length
    await this.driver.switchTo().window(handles[nextIndex])
    await this.waitForPageToLoad()
  }

  async switchToPreviousTab (): Promise<void> {
    if (this.driver === undefined) {
      throw new Error('no current browser open')
    }

    const handles = await this.driver.getAllWindowHandles()

    if (handles.length < 2) {
      throw new Error('cannot switch tabs: only one tab is open')
    }

    const currentHandle = await this.driver.getWindowHandle()
    const currentIndex = handles.indexOf(currentHandle)

    if (currentIndex === -1) {
      throw new Error('current tab handle not found')
    }

    // Switch to previous tab, wrapping around if at the beginning
    const previousIndex = (currentIndex - 1 + handles.length) % handles.length
    await this.driver.switchTo().window(handles[previousIndex])
    await this.waitForPageToLoad()
  }

  async closeCurrentTab (): Promise<void> {
    if (this.driver === undefined) {
      throw new Error('no current browser open')
    }

    const handles = await this.driver.getAllWindowHandles()

    if (handles.length === 1) {
      throw new Error('cannot close the last remaining tab')
    }

    // Close the current tab
    await this.driver.close()

    // Switch to the first remaining tab
    const remainingHandles = await this.driver.getAllWindowHandles()
    if (remainingHandles.length > 0) {
      await this.driver.switchTo().window(remainingHandles[0])
      await this.waitForPageToLoad()
    } else {
      // If no tabs remain, set driver to undefined
      this.driver = undefined
    }
  }

  async findButton (name: string): Promise<WebElement> {
    return await this.fuzzyFind(name, this.buttonExpressions, [
      'aria-label',
      'title',
      'placeholder'
    ])
  }

  async clickElement (element: WebElement): Promise<void> {
    await this.driver.executeScript('arguments[0].scrollIntoView(true)', element)
    await element.click()
    await this.waitForPageToLoad()
  }

  async clickButton (name: string): Promise<void> {
    const button = await this.findButton(name)

    if (button === undefined) {
      throw new Error(`unable to find button '${name}'`)
    }

    await this.clickElement(button)
  }

  async hoverOverButton (name: string): Promise<void> {
    const button = await this.findButton(name)
    return this.driver.actions().move({ origin: button }).perform()
  }

  async findCheckbox (name: string): Promise<WebElement> {
    // priority for checkboxes labelled right to left (r2l)
    const result = await this.fuzzyFind(
      name,
      ['input[type=checkbox]', '*[role=checkbox]', '*[role=switch]'],
      ['aria-label', 'title'],
      0,
      'r2l'
    )

    if (result !== undefined) {
      return result
    }

    return await this.fuzzyFind(
      name,
      ['input[type=checkbox]', '*[role=checkbox]', '*[role=switch]'],
      ['aria-label', 'title'],
      0,
      'l2r'
    )
  }

  async isChecked (element: WebElement): Promise<boolean> {
    if (await element.getAttribute('checked') != null) {
      return true
    }
    return await element.getAttribute('checked') === 'true'
  }

  async isUnchecked (element: WebElement): Promise<boolean> {
    return !(await this.isChecked(element))
  }

  async checkCheckbox (checkbox: WebElement): Promise<void> {
    if (await this.isChecked(checkbox)) {
      throw new Error('checkbox is already checked')
    }

    await checkbox.click()
  }

  async unCheckCheckbox (checkbox: WebElement): Promise<void> {
    if (await this.isUnchecked(checkbox)) {
      throw new Error('checkbox is already unchecked')
    }

    await checkbox.click()
  }

  async findSwitch (name: string): Promise<WebElement> {
    // priority for switches labelled left to right (l2r)
    const result = await this.fuzzyFind(
      name,
      ['input[type=checkbox]', '*[role=checkbox]', '*[role=switch]'],
      ['aria-label', 'title'],
      0,
      'r2l'
    )

    if (result !== undefined) {
      return result
    }

    return await this.fuzzyFind(
      name,
      ['input[type=checkbox]', '*[role=checkbox]', '*[role=switch]'],
      ['aria-label', 'title'],
      0,
      'l2r'
    )
  }

  async findInput (name: string): Promise<WebElement> {
    return await this.fuzzyFind(
      name,
      ['input'],
      ['aria-label', 'title', 'placeholder']
    )
  }

  async clearInput (name: string): Promise<void> {
    const input = await this.findInput(name)
    await this.clearElement(input)
  }

  async clearElement (element: WebElement): Promise<void> {
    const value = await element.getAttribute('value')
    // convert each character in the element into a backspace (like a user would)
    value.split('').forEach(() => {
      element.sendKeys(Key.BACK_SPACE).catch((err) => {
        throw err
      })
    })
  }

  async writeIntoInput (name: string, value: string): Promise<void> {
    const input = await this.findInput(name)
    await this.clearElement(input)
    await input.sendKeys(value)
  }

  async findText (value: string): Promise<WebElement> {
    return await this.fuzzyFind(value, ['*'], [])
  }

  async hoverOverText (value: string): Promise<void> {
    const text = await this.findText(value)
    await this.driver.actions().move({ origin: text }).perform()
  }

  async findDropdown (name: string): Promise<WebElement> {
    return await this.fuzzyFind(
      name,
      ['select', '*[role=combobox]'],
      ['aria-label', 'title'],
      0
    )
  }

  async findDropdownOption (name: string): Promise<WebElement> {
    return await this.fuzzyFind(
      name,
      ['option', '*[role=option]'],
      ['aria-label', 'title'],
      0,
      'l2r',
      false
    )
  }

  async selectOptionInDropdown (
    optionName: string,
    dropdownName: string): Promise<void> {
    const dropdown = await this.findDropdown(dropdownName)
    if (dropdown === undefined) {
      throw new Error(`unable to find dropdown "${dropdownName}"`)
    }

    const ariaExpanded = await dropdown.getAttribute('aria-expanded')
    if (ariaExpanded !== 'true') {
      await this.clickElement(dropdown)
    }

    const option = await this.findDropdownOption(optionName)
    if (option === undefined) {
      throw new Error(`unable to find dropdown option "${optionName}"`)
    }

    await this.clickElement(option)
  }

  async isEnabled (element: WebElement): Promise<boolean> {
    const disabled = await element.getAttribute('disabled')
    const ariaDisabled = await element.getAttribute('aria-disabled')
    return (disabled == null && ariaDisabled !== 'true')
  }

  async isDisabled (element: WebElement): Promise<boolean> {
    return !(await this.isEnabled(element))
  }

  registerPageCheck (name: string, check: (() => Promise<void>)): void {
    this.afterPageLoadChecks[name] = check
  }

  async waitForPageToLoad (): Promise<void> {
    return await this.waitFor(async () => {
      const readyState = await this.driver.executeScript('return document.readyState')
      if (readyState !== 'complete') {
        throw new Error(`document.readyState expected: "complete", got "${readyState as string}"`)
      }

      Object.keys(this.afterPageLoadChecks).forEach((name: string) => {
        this.debug(`running afterPageLoadCheck: ${name}`)
        this.afterPageLoadChecks[name].apply(this).catch((error: any) => { throw error })
      })
    })
  }

  async waitFor (func: () => any, options?: Record<string, any>): Promise<any> {
    let lastError: Error | undefined

    try {
      return await retry(async function () {
        return func()
      },
      {
        backoff: 'FIXED',
        retries: 'INFINITELY',
        // default to wait for 20s
        timeout: options?.timeout ?? 20000,
        delay: options?.delay ?? 250,
        retryIf: (error: Error): boolean => {
          lastError = error
          return true
        }
      })
    } catch (exception) {
      if (lastError != null) {
        throw lastError
      } else {
        throw exception
      }
    }
  }
}

export { WebElement }
