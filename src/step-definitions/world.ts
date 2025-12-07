import { World } from '@cucumber/cucumber'
import { type BrowserPlatform } from '../platform/BrowserPlatform'
import { SeleniumBrowserPlatform } from '../platform/selenium/SeleniumBrowserPlatform'
import { type BrowserElement } from '../platform/BrowserElement'
import { PlaywrightBrowserPlatform } from '../platform/playwright/PlaywrightBrowserPlatform'
import { readFileSync } from 'fs'
import { join } from 'path'
import Debug from 'debug'
import { retry } from 'ts-retry-promise'

const JQUERY_JS = readFileSync(
  join(__dirname, '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.slim.min.js'),
  'utf-8')
const FUZZY_JS = readFileSync(join(__dirname, '..', 'fuzzy.js'), 'utf-8')

class CukeWorld extends World {
  browser: BrowserPlatform
  debug = Debug('cuke')

  afterPageLoadChecks: Record<string, () => Promise<void>>

  constructor (options: any) {
    super(options)
    this.afterPageLoadChecks = {}

    if (process.env.CUKE_BROWSER_PLATFORM === 'playwright') {
      this.browser = new PlaywrightBrowserPlatform()
    } else {
      this.browser = new SeleniumBrowserPlatform()
    }
  }

  async handleSTDERR (text: string): Promise<void> {
    this.attach(`STDERR: ${text}`)
  }

  // XXX: here is where we can decide if selenium-webriver is enough or should
  // we use some other more generic browser automation framework that would allow
  // us to flip between webdriver/cypress/nightwatch/etc ?
  async openBrowser (url: string): Promise<void> {
    await this.browser.open(url)
    await this.waitForPageToLoad()
  }

  async refreshBrowser (): Promise<void> {
    await this.browser.refresh()
  }

  async fuzzyFind (
    name: string,
    tags: string[],
    attributes: string[] = [],
    index: number = 0,
    direction: string = 'l2r',
    filterInvisible: boolean = true
  ): Promise<BrowserElement> {
    const filterBy = filterInvisible ? ':visible' : ''
    this.debug(`fuzzy('${name}', ${JSON.stringify(tags)}, ${JSON.stringify(attributes)}, '${direction}', '${filterBy}')`)

    await this.browser.switchToDefaultContent()
    let result = await this.browser.executeScript(
      `${JQUERY_JS};
        ${FUZZY_JS};
        return window.fuzzy.apply(this, arguments);`,
      name, tags, attributes, { direction, filterBy, index }
    )

    let element: BrowserElement = (result as BrowserElement[])[index]

    if (element === undefined) {
      const frames: BrowserElement[] = await this.browser.findElements('iframe')

      for (const frame of frames) {
        await this.browser.switchToDefaultContent()
        await this.browser.switchToFrame(frame)

        result = await this.browser.executeScript(
          `${JQUERY_JS};
            ${FUZZY_JS};
            return window.fuzzy.apply(this, arguments);`,
          name, tags, attributes, { direction, filterBy, index }
        )

        element = (result as BrowserElement[])[index]
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

  async getCurrentURL (): Promise<string> {
    return await this.browser.getCurrentUrl()
  }

  async openNewTab (url?: string): Promise<void> {
    const oldHandles = await this.browser.getAllWindowHandles()
    await this.browser.executeScript('window.open(arguments[0] || "", "_blank")', url ?? '')
    const newHandles = await this.browser.getAllWindowHandles()

    const newHandle = await this.waitFor(() => {
      const newHandle = newHandles.find(handle => !oldHandles.includes(handle))

      if (newHandle === undefined) {
        throw new Error('failed to open new tab')
      }

      return newHandle
    })

    await this.browser.switchToWindow(newHandle)
    await this.waitForPageToLoad()
  }

  async switchToNextTab (): Promise<void> {
    const handles = await this.browser.getAllWindowHandles()

    if (handles.length < 2) {
      throw new Error('cannot switch tabs: only one tab is open')
    }

    const currentHandle = await this.browser.getWindowHandle()
    const currentIndex: number = handles.indexOf(currentHandle)

    if (currentIndex === -1) {
      throw new Error('current tab handle not found')
    }

    // Switch to next tab, wrapping around if at the end
    const nextIndex = (currentIndex + 1) % handles.length
    await this.browser.switchToWindow(handles[nextIndex])
    await this.waitForPageToLoad()
  }

  async switchToPreviousTab (): Promise<void> {
    const handles: string[] = await this.browser.getAllWindowHandles()

    if (handles.length < 2) {
      throw new Error('cannot switch tabs: only one tab is open')
    }

    const currentHandle = await this.browser.getWindowHandle()
    const currentIndex = handles.indexOf(currentHandle)

    if (currentIndex === -1) {
      throw new Error('current tab handle not found')
    }

    // Switch to previous tab, wrapping around if at the beginning
    const previousIndex = (currentIndex - 1 + handles.length) % handles.length
    await this.browser.switchToWindow(handles[previousIndex])
    await this.waitForPageToLoad()
  }

  async closeCurrentTab (): Promise<void> {
    const handles = await this.browser.getAllWindowHandles()

    if (handles.length === 1) {
      throw new Error('cannot close the last remaining tab')
    }

    // Close the current tab
    await this.browser.closeCurrentWindow()

    // Switch to the first remaining tab
    const remainingHandles = await this.browser.getAllWindowHandles()
    if (remainingHandles.length > 0) {
      await this.browser.switchToWindow(remainingHandles[0])
      await this.waitForPageToLoad()
    }
  }

  buttonExpressions: string[] = [
    'button',
    'a',
    'input[type=submit]',
    'input[type=radio]',

    '*[role=button]',
    '*[role=link]',
    '*[role=checkbox]',
    '*[role=switch]',
    '*[role=tab]',
    '*[role=option]',
    '*[role=menuitem]',
    '*[role=treeitem]'
  ]

  registerButtonCSSExpression (expression: string): void {
    this.buttonExpressions.push(expression)
  }

  buttonAttributes: string[] = [
    'aria-label',
    'title',
    'placeholder'
  ]

  registerButtonAttributes (name: string): void {
    this.buttonAttributes.push(name)
  }

  async findButton (name: string): Promise<BrowserElement> {
    return await this.fuzzyFind(name, this.buttonExpressions, this.buttonAttributes)
  }

  async clickElement (element: BrowserElement): Promise<void> {
    await element.click()
    await this.waitForPageToLoad()
  }

  async hoverOverButton (name: string): Promise<void> {
    const button = await this.findButton(name)
    await this.browser.hover(button)
  }

  async findCheckbox (name: string): Promise<BrowserElement> {
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

  async isChecked (element: BrowserElement): Promise<boolean> {
    const ariaChecked = await element.getAttribute('aria-checked')
    const checked = await element.isSelected()
    return (checked || ariaChecked === 'true')
  }

  async isUnchecked (element: BrowserElement): Promise<boolean> {
    return !(await this.isChecked(element))
  }

  async checkCheckbox (checkbox: BrowserElement): Promise<void> {
    if (await this.isChecked(checkbox)) {
      throw new Error('checkbox is already checked')
    }

    await checkbox.click()
  }

  async unCheckCheckbox (checkbox: BrowserElement): Promise<void> {
    if (await this.isUnchecked(checkbox)) {
      throw new Error('checkbox is already unchecked')
    }

    await checkbox.click()
  }

  radioExpressions: string[] = [
    'input[type=radio]',
    '*[role=radio]'
  ]

  radioAttributes: string[] = [
    'aria-label',
    'title'
  ]

  async findRadio (name: string): Promise<BrowserElement> {
    // priority for radios labelled right to left (r2l)
    const result = await this.fuzzyFind(
      name,
      this.radioExpressions,
      this.radioAttributes,
      0,
      'r2l'
    )

    if (result !== undefined) {
      return result
    }

    return await this.fuzzyFind(
      name,
      this.radioExpressions,
      this.radioAttributes,
      0,
      'l2r'
    )
  }

  async selectRadio (radio: BrowserElement): Promise<void> {
    if (await this.isChecked(radio)) {
      return
    }

    await radio.click()
  }

  switchExpressions: string[] = [
    'input[type=checkbox]',
    '*[role=checkbox]',
    '*[role=switch]'
  ]

  switchAttributes: string[] = [
    'aria-label',
    'title'
  ]

  async findSwitch (name: string): Promise<BrowserElement> {
    // priority for switches labelled left to right (l2r)
    const result = await this.fuzzyFind(name, this.switchExpressions, this.switchAttributes, 0, 'r2l')

    if (result !== undefined) {
      return result
    }

    return await this.fuzzyFind(name, this.switchExpressions, this.switchAttributes, 0, 'l2r')
  }

  inputExpressions: string[] = [
    'input[type=text]',
    'input[type=password]',
    'input[type=search]',
    'input',
    'textarea',
    '*[role=textbox]',
    '*[role=searchbox]',
    '*[contenteditable]'
  ]

  registerInputCSSExpression (expression: string, priority: number = -1): void {
    if (priority === -1) {
      this.inputExpressions.push(expression)
    } else {
      this.inputExpressions.splice(priority, 0, expression)
    }
  }

  inputAttributes: string[] = [
    'aria-label',
    'title',
    'placeholder'
  ]

  async findInput (name: string): Promise<BrowserElement> {
    return await this.fuzzyFind(name, this.inputExpressions, this.inputAttributes)
  }

  async clearInput (name: string): Promise<void> {
    const input = await this.findInput(name)
    await input.clear()
  }

  async clearElement (element: BrowserElement): Promise<void> {
    const value = await element.getAttribute('value')

    if (value != null) {
      // convert each character in the element into a backspace (like a user would)
      value.split('').forEach(() => {
        element.sendKeys('\uE003').catch((err) => {
          throw err
        })
      })
    }
  }

  async writeIntoInput (name: string, value: string): Promise<void> {
    const input = await this.findInput(name)
    if (input == null) {
      throw Error(`unable to find input "${name}"`)
    }

    await this.clickElement(input)
    const focusedElement = await this.browser.findElement(':focus')
    await focusedElement.type(value)
  }

  async sendKeyToInput (name: string, key: string): Promise<void> {
    const input = await this.findInput(name)
    if (input == null) {
      throw Error(`unable to find input "${name}"`)
    }

    await this.sendKeyToElement(input, key)
  }

  async getFocusedElement (): Promise<BrowserElement> {
    return await this.browser.findElement(':focus')
  }

  async sendKeyToElement (element: BrowserElement, key: string): Promise<void> {
    await this.clickElement(element)
    const focusedElement = await this.browser.findElement(':focus')
    await focusedElement.sendKeys(key)
  }

  async sendKeyToPage (key: string): Promise<void> {
    const body = await this.browser.findElement('body')
    await body.sendKeys(key)
  }

  async findText (value: string): Promise<BrowserElement> {
    return await this.fuzzyFind(value, ['*'], [])
  }

  async hoverOverText (value: string): Promise<void> {
    const text = await this.findText(value)
    await this.browser.hover(text)
  }

  headerExpressions: string[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  async findHeader (name: string): Promise<BrowserElement> {
    return await this.fuzzyFind(name, this.headerExpressions, [])
  }

  dropdownExpressions: string[] = ['select', '*[role=combobox]']
  dropdownAttributes: string[] = ['aria-label', 'title']

  async findDropdown (name: string): Promise<BrowserElement> {
    return await this.fuzzyFind(name, this.dropdownExpressions, this.dropdownAttributes, 0)
  }

  async findDropdownOption (name: string): Promise<BrowserElement> {
    return await this.fuzzyFind(name, this.dropdownExpressions, this.dropdownAttributes, 0, 'l2r', false)
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

  expandableExpressions: string[] = [
    '*[aria-expanded]'
  ]

  expandableAttributes: string[] = ['aria-label', 'title']

  async findExpandable (name: string): Promise<BrowserElement> {
    return await this.fuzzyFind(name, this.expandableExpressions, this.expandableAttributes)
  }

  async isExpanded (element: BrowserElement): Promise<boolean> {
    const ariaExpanded = await element.getAttribute('aria-expanded')
    return ariaExpanded === 'true'
  }

  async isClosed (element: BrowserElement): Promise<boolean> {
    return !(await this.isExpanded(element))
  }

  async openExpandable (expandable: BrowserElement): Promise<void> {
    if (!(await this.isExpanded(expandable))) {
      await this.clickElement(expandable)
    }
  }

  async closeExpandable (expandable: BrowserElement): Promise<void> {
    if (await this.isExpanded(expandable)) {
      await this.clickElement(expandable)
    }
  }

  async isEnabled (element: BrowserElement): Promise<boolean> {
    const disabled = await element.getAttribute('disabled')
    const ariaDisabled = await element.getAttribute('aria-disabled')
    return (disabled == null && ariaDisabled !== 'true')
  }

  async isDisabled (element: BrowserElement): Promise<boolean> {
    return !(await this.isEnabled(element))
  }

  registerPageCheck (name: string, check: (() => Promise<void>)): void {
    this.afterPageLoadChecks[name] = check
  }

  async waitForPageToLoad (): Promise<void> {
    return await this.waitFor(async () => {
      await this.browser.waitForPageToLoad()

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
        timeout: options?.timeout ?? parseInt(process.env.CUKE_WAIT_FOR_TIMEOUT_MS ?? '20000'),
        delay: options?.delay ?? 500,
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

export { CukeWorld, type BrowserElement }
