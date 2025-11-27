import { type CukeWorld, Step } from '../index'
import { assertEqual, assertContains, assertMatches } from '../utils/comparator'

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

Step('I should see that "{arg}" is equal to "{arg}"',
  async function (this: CukeWorld, value1: string, value2: string) {
    assertEqual(value1, value2)
  }
)

Step('I should see that "{arg}" is equal to the following:',
  async function (this: CukeWorld, value1: string, value2: string) {
    assertEqual(value1, value2)
  }
)

Step('I should see that "{arg}" contains "{arg}"',
  async function (this: CukeWorld, value1: string, value2: string) {
    assertContains(value1, value2)
  }
)

Step('I should see that "{arg}" contains the following:',
  async function (this: CukeWorld, value1: string, value2: string) {
    assertContains(value1, value2)
  }
)

Step('I should see that "{arg}" matches "{arg}"',
  async function (this: CukeWorld, value1: string, value2: string) {
    assertMatches(value1, value2)
  }
)

Step('I should see that "{arg}" matches the following:',
  async function (this: CukeWorld, value1: string, value2: string) {
    assertMatches(value1, value2)
  }
)
