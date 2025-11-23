import { Config } from './config'

export { After, AfterAll, Before, BeforeAll } from '@cucumber/cucumber'
export { Step } from './cucumber'
export { CukeWorld, WebElement } from './step-definitions/world'

process.env = new Config()
