import { type BrowserElement } from './BrowserElement'

export interface BrowserPlatform {
  open: (url: string) => Promise<void>
  refresh: () => Promise<void>
  executeScript: (script: string, ...args: any[]) => Promise<any>

  findElements: (selector: string) => Promise<BrowserElement[]>
  findElement: (selector: string) => Promise<BrowserElement>

  switchToFrame: (element: BrowserElement) => Promise<void>
  switchToDefaultContent: () => Promise<void>

  getCurrentUrl: () => Promise<string>

  getWindowHandle: () => Promise<string>
  getAllWindowHandles: () => Promise<string[]>
  switchToWindow: (handle: string) => Promise<void>
  closeCurrentWindow: () => Promise<void>

  hover: (element: BrowserElement) => Promise<void>

  takeScreenshot: () => Promise<string>
  getConsoleLogs: () => Promise<string[]>

  quit: () => Promise<void>

  waitForPageToLoad: () => Promise<void>
}
