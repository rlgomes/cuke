import type { CukeWorld, WebElement } from './world'
import { Step } from '../index'

import {
  defineParameterType
} from '@cucumber/cucumber'

defineParameterType({
  name: 'name',
  // match any character but only double quotes if escaped by backslash
  regexp: /([^"\\]*(\\.[^"\\]*)*)/,
  transformer: (value) => value,
  useForSnippets: false
})

defineParameterType({
  name: 'value',
  // match any character but only double quotes if escaped by backslash
  regexp: /([^"\\]*(\\.[^"\\]*)*)/,
  transformer: (value) => value,
  useForSnippets: false
})

defineParameterType({
  name: 'seconds',
  regexp: /.*/,
  transformer: (value) => value,
  useForSnippets: false
})

type Actioner = (this: CukeWorld, element: WebElement) => Promise<void>
type Checker = (this: CukeWorld, element: WebElement) => Promise<boolean>
type Finder = (this: CukeWorld, input: string) => Promise<WebElement>
type Getter = (this: CukeWorld) => Promise<string>
type NamedGetter = (this: CukeWorld, name: string) => Promise<string>

function defineActionSteps (
  actionName: string,
  actionFunction: Actioner,
  elementName: string,
  findFunction: Finder
): void {
  Step(`I ${actionName} the ${elementName} "{name}"`,
    async function (this: CukeWorld, name: string) {
      const element = await findFunction.bind(this)(name)
      await actionFunction.bind(this)(element)
    })

  Step(`I wait to ${actionName} the ${elementName} "{name}"`,
    async function (this: CukeWorld, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        await actionFunction.bind(this)(element)
      })
    })

  Step(`I wait up to "{seconds}" seconds to ${actionName} the ${elementName} "{name}"`,
    async function (this: CukeWorld, seconds: string, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        await actionFunction.bind(this)(element)
      },
      {
        timeout: parseInt(seconds) * 1000
      })
    })
}

function defineVisibilitySteps (
  elementName: string,
  findFunction: Finder
): void {
  Step(`I should see the ${elementName} "{name}"`,
    async function (this: CukeWorld, name: string) {
      const element = await findFunction.bind(this)(name)
      if (element == null) {
        throw new Error(`unable to find ${elementName} "${name}"`)
      }
    })

  Step(`I wait to see the ${elementName} "{name}"`,
    async function (this: CukeWorld, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element == null) {
          throw new Error(`unable to find ${elementName} "${name}"`)
        }
      })
    })

  Step(`I wait up to "{seconds}" seconds to see the ${elementName} "{name}"`,
    async function (this: CukeWorld, seconds: string, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element == null) {
          throw new Error(`unable to find ${elementName} "${name}"`)
        }
      },
      {
        timeout: parseInt(seconds) * 1000
      })
    })
}

function defineInStateSteps (
  elementName: string,
  findFunction: Finder,
  stateName: string,
  checkFunction: Checker
): void {
  Step(`I should see the ${elementName} "{name}" is ${stateName}`,
    async function (this: CukeWorld, name: string) {
      const element = await findFunction.bind(this)(name)
      if (!await checkFunction.bind(this)(element)) {
        throw new Error(`unable to find ${elementName} "${name}" is ${stateName}`)
      }
    })

  Step(`I wait to see the ${elementName} "{name}" is ${stateName}`,
    async function (this: CukeWorld, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (!(await checkFunction.bind(this)(element))) {
          throw new Error(`unable to find ${elementName} "${name}" is ${stateName}`)
        }
      })
    })

  Step(`I wait up to "{seconds}" seconds to see the ${elementName} "{name}" is ${stateName}`,
    async function (this: CukeWorld, seconds: string, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (!(await checkFunction.bind(this)(element))) {
          throw new Error(`unable to find ${elementName} "${name}" is ${stateName}`)
        }
      },
      {
        timeout: parseInt(seconds) * 1000
      })
    })
}

function defineElementValueSteps (
  elementName: string,
  getterFunction: Getter
): void {
  Step(`I should see the ${elementName} is equal to "{value}"`,
    async function (this: CukeWorld, value: string) {
      const actualValue = await getterFunction.bind(this)()
      if (value !== actualValue) {
        throw new Error(`${elementName} is "${actualValue}", expected "${value}"`)
      }
    })

  Step(`I wait to see the ${elementName} is equal to "{value}"`,
    async function (this: CukeWorld, value: string) {
      await this.waitFor(async () => {
        const actualValue = await getterFunction.bind(this)()
        if (value !== actualValue) {
          throw new Error(`${elementName} is "${actualValue}", expected "${value}"`)
        }
      })
    })

  Step(`I should see the ${elementName} matches "{value}"`,
    async function (this: CukeWorld, value: string) {
      const actualValue = await getterFunction.bind(this)()
      if (actualValue.match(value) == null) {
        throw new Error(`${elementName} is "${actualValue}", expected to match "${value}"`)
      }
    })

  Step(`I wait to see the ${elementName} matches "{value}"`,
    async function (this: CukeWorld, value: string) {
      await this.waitFor(async () => {
        const actualValue = await getterFunction.bind(this)()
        if (actualValue.match(value) == null) {
          throw new Error(`${elementName} is "${actualValue}", expected to match "${value}"`)
        }
      })
    })
}

function defineNamedElementValueSteps (
  elementName: string,
  getterFunction: NamedGetter
): void {
  Step(`I should see the ${elementName} "{name}" is equal to "{value}"`,
    async function (this: CukeWorld, name: string, value: string) {
      const actualValue = await getterFunction.bind(this)(name)
      if (value !== actualValue) {
        throw new Error(`${elementName} "${name}" is "${actualValue}", expected "${value}"`)
      }
    })
}

export {
  defineActionSteps,
  defineVisibilitySteps,
  defineInStateSteps,

  defineElementValueSteps,
  defineNamedElementValueSteps
}
