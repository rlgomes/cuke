import { Config } from './config'

export { AfterAll, BeforeAll, Step } from './cucumber'
export { CukeWorld, WebElement } from './step-definitions/world'

process.env = new Config()
