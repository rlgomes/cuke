import { type CukeWorld, Step } from '../index'

Step('I set the variable "{arg}" to "{arg}"',
  async function (this: CukeWorld, variable: string, value: string) {
    process.env[variable] = value
  }
)

Step('I set the variable "{arg}" to the following:',
  async function (this: CukeWorld, variable: string, value: string) {
    process.env[variable] = value
  }
)

Step('I unset the variable "{arg}"', async function (this: CukeWorld, variable: string) {
  process.env[variable] = undefined
})

Step('I should see that "{arg}" is empty', async function (this: CukeWorld, value: string) {
  if (value !== '') {
    throw new Error(`"${value}" is not empty, is "${value}"`)
  }
})

Step('I should see that "{arg}" is equal to "{arg}"',
  async function (this: CukeWorld, value1: string, value2: string) {
    if (value1 !== value2) {
      throw new Error(`"${value1}" is not equal to "${value2}"`)
    }
  }
)

Step('I should see that "{arg}" is equal to the following:',
  async function (this: CukeWorld, value1: string, value2: string) {
    if (value1 !== value2) {
      throw new Error(`"${value1}" is not equal to "${value2}"`)
    }
  }
)

Step('I should see that "{arg}" contains "{arg}"',
  async function (this: CukeWorld, value1: string, value2: string) {
    if (!value1.includes(value2)) {
      throw new Error(`"${value1}" does not contain "${value2}"`)
    }
  }
)

Step('I should see that "{arg}" contains the following:',
  async function (this: CukeWorld, value1: string, value2: string) {
    if (!value1.includes(value2)) {
      throw new Error(`"${value1}" does not contain "${value2}"`)
    }
  }
)

Step('I should see that "{arg}" matches "{arg}"',
  async function (this: CukeWorld, value1: string, value2: string) {
    if (value1.match(value2) === null) {
      throw new Error(`"${value1}" does not match "${value2}"`)
    }
  }
)

Step('I should see that "{arg}" matches the following:',
  async function (this: CukeWorld, value1: string, value2: string) {
    if (value1.match(value2) === null) {
      throw new Error(`"${value1}" does not match "${value2}"`)
    }
  }
)
