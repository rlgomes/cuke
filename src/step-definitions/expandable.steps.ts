import type { CukeWorld, BrowserElement } from '../index'
import {
  defineActionSteps,
  defineVisibilitySteps,
  defineInStateSteps
} from './utils.steps'

async function findExpandable (this: CukeWorld, name: string): Promise<BrowserElement> {
  return await this.findExpandable(name)
}

async function openExpandable (this: CukeWorld, expandable: BrowserElement): Promise<void> {
  await this.openExpandable(expandable)
}

async function closeExpandable (this: CukeWorld, expandable: BrowserElement): Promise<void> {
  await this.closeExpandable(expandable)
}

async function isExpanded (this: CukeWorld, expandable: BrowserElement): Promise<boolean> {
  return await this.isExpanded(expandable)
}

async function isClosed (this: CukeWorld, expandable: BrowserElement): Promise<boolean> {
  return await this.isClosed(expandable)
}

defineActionSteps('open', openExpandable, 'expandable item', findExpandable)
defineActionSteps('close', closeExpandable, 'expandable item', findExpandable)
defineVisibilitySteps('expandable item', findExpandable)
defineInStateSteps('expandable item', findExpandable, 'open', isExpanded)
defineInStateSteps('expandable item', findExpandable, 'closed', isClosed)
