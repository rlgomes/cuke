import type { CukeWorld, WebElement } from './world'
import {
  defineVisibilitySteps
} from './utils.steps'

async function findHeader (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findHeader(name)
}

defineVisibilitySteps('header', findHeader)
