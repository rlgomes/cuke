export interface BrowserElement {
  click: () => Promise<void>
  sendKeys: (keys: string) => Promise<void>
  type: (keys: string) => Promise<void>
  getAttribute: (name: string) => Promise<string | null>
  isSelected: () => Promise<boolean>
  clear: () => Promise<void>
}
