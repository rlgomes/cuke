import type { CukeWorld, BrowserElement } from '../index'
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

export type ElementFinder = (this: CukeWorld, input: string) => Promise<BrowserElement>
export type ElementAction = (this: CukeWorld, element: BrowserElement) => Promise<void>
export type ElementChecker = (this: CukeWorld, element: BrowserElement) => Promise<boolean>

type Actioner = ElementAction
type Checker = ElementChecker
type Finder = ElementFinder
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
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element == null) {
          throw new Error(`unable to find ${elementName} "${name}"`)
        }

        await actionFunction.bind(this)(element)
      })
    })

  Step(`I ${actionName} the ${elementName} "{name}" waiting up to "{seconds}" seconds`,
    async function (this: CukeWorld, name: string, seconds: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element == null) {
          throw new Error(`unable to find ${elementName} "${name}"`)
        }

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
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element == null) {
          throw new Error(`unable to find ${elementName} "${name}"`)
        }
      })
    })

  Step(`I should see the ${elementName} "{name}" waiting up to "{seconds}" seconds`,
    async function (this: CukeWorld, name: string, seconds: string) {
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

  Step(`I should not see the ${elementName} "{name}"`,
    async function (this: CukeWorld, name: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element != null) {
          throw new Error(`able to find ${elementName} "${name}"`)
        }
      })
    })

  Step(`I should not see the ${elementName} "{name}" waiting up to "{seconds}" seconds`,
    async function (this: CukeWorld, name: string, seconds: string) {
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (element != null) {
          throw new Error(`able to find ${elementName} "${name}"`)
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
      await this.waitFor(async () => {
        const element = await findFunction.bind(this)(name)
        if (!(await checkFunction.bind(this)(element))) {
          throw new Error(`unable to find ${elementName} "${name}" is ${stateName}`)
        }
      })
    })

  Step(`I should see the ${elementName} "{name}" is ${stateName} waiting up to "{seconds}" seconds`,
    async function (this: CukeWorld, name: string, seconds: string) {
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
      await this.waitFor(async () => {
        const actualValue = await getterFunction.bind(this)()
        if (value !== actualValue) {
          throw new Error(`${elementName} is "${actualValue}", expected "${value}"`)
        }
      })
    })

  Step(`I should see the ${elementName} matches "{value}"`,
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
