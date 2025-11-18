import { type CukeWorld, Step } from '../index'

Step('I write "{arg}" into the input "{arg}"',
  async function (this: CukeWorld, value: string, name: string) {
    await this.writeIntoInput(name, value)
  }
)

Step('I wait to write "{arg}" into the input "{arg}"',
  async function (this: CukeWorld, value: string, name: string) {
    await this.waitFor(async () => {
      await this.writeIntoInput(name, value)
    })
  }
)

Step('I clear the input "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.clearInput(name)
  })

Step('I should see the input "{arg}" is equal to "{arg}"',
  async function (this: CukeWorld, name: string, value: string) {
    const input = await this.findInput(name)
    const inputValue: string = await input.getAttribute('value')
    if (inputValue !== value) {
      throw new Error(
        `input ${name} has value ${inputValue} instead of expected ${value}`
      )
    }
  }
)

Step('I should see the input "{arg}"',
  async function (this: CukeWorld, name: string) {
    const input = await this.findInput(name)
    if (input === undefined) {
      throw new Error(`unable to find input "${name}"`)
    }
  })

Step('I wait to see the input "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.waitFor(async () => {
      const input = await this.findInput(name)
      if (input === undefined) {
        throw new Error(`unable to find input "${name}"`)
      }
    })
  })

Step('I should see the input "{arg}" is enabled',
  async function (this: CukeWorld, name: string) {
    const input = await this.findInput(name)
    if (input === undefined) {
      throw new Error(`unable to find input "${name}"`)
    }

    if (await this.isDisabled(input)) {
      throw new Error(`input "${name}" is disabled`)
    }
  })

Step('I wait to see the input "{arg}" is enabled',
  async function (this: CukeWorld, name: string) {
    await this.waitFor(async () => {
      const input = await this.findInput(name)

      if (input === undefined) {
        throw new Error(`unable to find input "${name}"`)
      }

      const disabled = await input.getAttribute('disabled') ?? undefined
      if (disabled !== undefined) {
        throw new Error(`input "${name}" is disabled`)
      }
    })
  })
