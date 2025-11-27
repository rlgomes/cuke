import { diff } from 'jest-diff'

function assertEqual (actual: any, expected: any): void {
  if (actual !== expected) {
    const diffString: string = diff(expected, actual) ?? ''
    throw new Error(`Expected values to be equal:\n${diffString}`)
  }
}

function assertContains (actual: string, expected: string): void {
  if (!actual.includes(expected)) {
    throw new Error(`Expected "${actual}" to contain "${expected}"`)
  }
}

function assertMatches (actual: string, pattern: string): void {
  const regex = new RegExp(pattern)
  if (!regex.test(actual)) {
    throw new Error(`Expected "${actual}" to match pattern "${pattern}"`)
  }
}

export {
  assertEqual,
  assertContains,
  assertMatches
}
