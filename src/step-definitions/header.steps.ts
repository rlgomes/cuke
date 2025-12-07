import type { CukeWorld, BrowserElement } from '../index'
import {
  defineVisibilitySteps
} from './utils.steps'

async function findHeader (this: CukeWorld, name: string): Promise<BrowserElement> {
  return await this.findHeader(name)
}

defineVisibilitySteps('header', findHeader)
