import { type CukeWorld, Step } from '../index'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'

Step('I write to the file "{arg}" the following:',
  async function (this: CukeWorld, filepath: string, contents: string) {
    const dirpath = dirname(filepath)
    mkdirSync(dirpath, { recursive: true })
    writeFileSync(filepath, contents)
  }
)

Step('I read the file "{arg}" contents to the variable "{arg}"',
  async function (this: CukeWorld, filepath: string, variable: string) {
    const contents = readFileSync(filepath, { encoding: 'utf8', flag: 'r' })
    process.env[variable] = contents
  }
)
