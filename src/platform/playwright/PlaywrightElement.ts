import { type BrowserElement } from '../BrowserElement'
import { type Locator, type ElementHandle } from 'playwright'

const KEY_MAP: Record<string, string> = {
  // Basics
  enter: 'Enter',
  return: 'Enter', // Handle common alias
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  escape: 'Escape',
  esc: 'Escape',
  space: ' ', // Important: Playwright expects a literal space sometimes

  // Navigation (CamelCase is required by Playwright)
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  home: 'Home',
  end: 'End'
}

export class PlaywrightElement implements BrowserElement {
  private readonly element: Locator | ElementHandle

  constructor (element: Locator | ElementHandle) {
    this.element = element
  }

  async click (): Promise<void> {
    await this.element.click()
  }

  async sendKeys (keys: string): Promise<void> {
    if (KEY_MAP[keys.toLowerCase()] !== null) {
      keys = KEY_MAP[keys.toLowerCase()]
    }
    await this.element.press(keys)
  }

  async type (keys: string): Promise<void> {
    if ('pressSequentially' in this.element) {
      // TypeScript now knows this is a Locator
      await this.element.pressSequentially(keys)
    } else {
      // Fallback for ElementHandle (which uses the older .type() method)
      await this.element.type(keys)
    }
  }

  async getAttribute (name: string): Promise<string | null> {
    if (name === 'value') {
      /* istanbul ignore next */
      const value = await (this.element as any).evaluate((el: any) => el.value)
      if (value !== undefined && value !== null) {
        return String(value)
      }
    }
    return await this.element.getAttribute(name)
  }

  async isSelected (): Promise<boolean> {
    return await this.element.isChecked()
  }

  async clear (): Promise<void> {
    await this.element.fill('')
  }

  getLocator (): Locator | ElementHandle {
    return this.element
  }
}
