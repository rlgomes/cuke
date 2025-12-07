import { type BrowserElement } from '../BrowserElement'
import { Key, type WebElement } from 'selenium-webdriver'

export class SeleniumElement implements BrowserElement {
  private readonly element: WebElement

  constructor (element: WebElement) {
    this.element = element
  }

  async click (): Promise<void> {
    await this.element.click()
  }

  async sendKeys (keys: string): Promise<void> {
    let keyName = keys.toUpperCase()
    let keyToSend

    if (keyName === 'BACKSPACE') { keyName = 'BACK_SPACE' }
    if (keyName in Key) {
      keyToSend = (Key as any)[keyName]
    } else {
      keyToSend = keys
    }
    await this.element.sendKeys(keyToSend)
  }

  async type (keys: string): Promise<void> {
    await this.element.sendKeys(keys)
  }

  async getAttribute (name: string): Promise<string | null> {
    return await this.element.getAttribute(name)
  }

  async isSelected (): Promise<boolean> {
    return await this.element.isSelected()
  }

  async clear (): Promise<void> {
    await this.element.clear()
  }

  getRawElement (): WebElement {
    return this.element
  }
}
