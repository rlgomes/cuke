import { type CukeWorld, Step } from '../index'

Step('I should see the table cell "{arg}"',
  async function (this: CukeWorld, name: string) {
    const cell = await this.fuzzyFind(name, ['td', '[role=cell]'])

    if (cell === undefined) {
      throw new Error(`unable to find cell "${name}"`)
    }
  })

Step('I wait to see the table cell "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.waitFor(async () => {
      const cell = await this.fuzzyFind(name, ['td', '[role=cell]'])

      if (cell === undefined) {
        throw new Error(`unable to find cell "${name}"`)
      }
    })
  })

Step('I click the table cell "{arg}"',
  async function (this: CukeWorld, name: string) {
    const cell = await this.fuzzyFind(name, ['td', '[role=cell]'])

    if (cell === undefined) {
      throw new Error(`unable to find cell "${name}"`)
    }

    await cell.click().catch((error: Error) => {
      this.debug(error)
      throw error
    })
  })

Step('I wait to click the table cell "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.waitFor(async () => {
      const cell = await this.fuzzyFind(name, ['td', '[role=cell]'])

      if (cell === undefined) {
        throw new Error(`unable to find cell "${name}"`)
      }

      await cell.click()
    })
  })
