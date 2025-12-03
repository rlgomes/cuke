import type { CukeWorld, WebElement } from '../index'
import {
  defineActionSteps,
  defineVisibilitySteps,
  defineInStateSteps
} from './utils.steps'

async function findExpandable (this: CukeWorld, name: string): Promise<WebElement> {
  return await this.findExpandable(name)
}

async function openExpandable (this: CukeWorld, element: WebElement): Promise<void> {
  await this.openExpandable(element)
}

async function closeExpandable (this: CukeWorld, element: WebElement): Promise<void> {
  await this.closeExpandable(element)
}

async function isExpanded (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isExpanded(element)
}

async function isClosed (this: CukeWorld, element: WebElement): Promise<boolean> {
  return await this.isClosed(element)
}

defineActionSteps('open', openExpandable, 'expandable item', findExpandable)
defineActionSteps('close', closeExpandable, 'expandable item', findExpandable)
defineVisibilitySteps('expandable item', findExpandable)
defineInStateSteps('expandable item', findExpandable, 'open', isExpanded)
defineInStateSteps('expandable item', findExpandable, 'closed', isClosed)
