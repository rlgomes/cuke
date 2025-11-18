import { type CukeWorld, Step } from '../index'

Step('I should see the text "{arg}"',
  async function (this: CukeWorld, value: string) {
    const text = await this.findText(value)
    if (text === undefined) {
      throw new Error(`unable to find the text "${value}"`)
    }
  })

Step('I should not see the text "{arg}"',
  async function (this: CukeWorld, value: string) {
    const text = await this.findText(value)
    if (text !== undefined) {
      throw new Error(`able to find the text "${value}"`)
    }
  })

Step('I wait to see the text "{arg}"',
  async function (this: CukeWorld, value: string) {
    await this.waitFor(async () => {
      const text = await this.findText(value)
      if (text === undefined) {
        throw new Error(`unable to find the text "${value}"`)
      }
    })
  })

Step('I wait to not see the text "{arg}"',
  async function (this: CukeWorld, value: string) {
    await this.waitFor(async () => {
      const text = await this.findText(value)
      if (text !== undefined) {
        throw new Error(`able to find the text "${value}"`)
      }
    })
  })

Step('I hover over the text "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.hoverOverText(name)
  })
