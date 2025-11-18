import { type CukeWorld, Step } from '../index'

Step('I turn on the switch "{arg}"',
  async function (this: CukeWorld, name: string) {
    const switch_ = await this.findSwitch(name)

    if (switch_ === undefined) {
      throw new Error(`unable to find switch ${name}`)
    }

    const checked = await switch_.getAttribute('checked')

    if (checked === 'true') {
      throw new Error(`switch "${name}" is already on`)
    }

    await switch_.click()
  })

Step('I wait to turn on the switch "{arg}"',
  async function (this: CukeWorld, name: string) {
    await this.waitFor(async () => {
      const switch_ = await this.findSwitch(name)

      if (switch_ === undefined) {
        throw new Error(`unable to find switch ${name}`)
      }

      const checked = await switch_.getAttribute('checked')

      if (checked === 'true') {
        throw new Error(`switch "${name}" is already on`)
      }
      await switch_.click()
    })
  })

Step('I turn off the switch "{arg}"',
  async function (this: CukeWorld, name: string) {
    const switch_ = await this.findSwitch(name)

    if (switch_ === undefined) {
      throw new Error(`unable to find switch_ ${name}`)
    }

    const checked = await switch_.getAttribute('checked')
    if (checked !== 'true') {
      throw new Error(`switch_ "${name}" is already uchecked`)
    }
    await switch_.click()
  })

Step('I should see the switch "{arg}"',
  async function (this: CukeWorld, name: string) {
    const switch_ = await this.findSwitch(name)
    if (switch_ === undefined) {
      throw new Error(`unable to find switch_ "${name}"`)
    }
  })

Step('I should see the switch "{arg}" is on',
  async function (this: CukeWorld, name: string) {
    const switch_ = await this.findSwitch(name)
    if (switch_ === undefined) {
      throw new Error(`unable to find switch_ ${name}`)
    }
    const checked = await switch_.getAttribute('checked')
    if (checked !== 'true') {
      throw new Error(`switch_ "${name}" is not checked`)
    }
  })

Step('I should see the switch "{arg}" is off',
  async function (this: CukeWorld, name: string) {
    const switch_ = await this.findSwitch(name)
    if (switch_ === undefined) {
      throw new Error(`unable to find switch_ ${name}`)
    }

    const checked = await switch_.getAttribute('checked')

    if (checked === 'true') {
      throw new Error(`switch_ "${name}" is checked`)
    }
  })
