import { chmod } from 'fs/promises'
import { join } from 'path'
import { split } from 'shlex'
import { spawnSync } from 'child_process'
import { tmpdir } from 'os'
import { writeFileSync } from 'fs'
import { v4 } from 'uuid'

import { type CukeWorld, Step } from '../index'

import Debug from 'debug'

const debug = Debug('command.steps')

function runCommand (this: CukeWorld, command: string): void {
  debug(`command.steps running "${command}"`)
  const args = split(command)
  const result = spawnSync(args[0], args.slice(1))

  if (result.error !== undefined) {
    throw new Error(result.error.toString())
  }

  process.env.result = result
}

Step('I run the following script:',
  async function (this: CukeWorld, script: string) {
    const scriptFile = join(tmpdir(), v4())
    writeFileSync(scriptFile, script)
    await chmod(scriptFile, 0o777)

    runCommand.bind(this)(scriptFile)
  })

Step('I run the command "{arg}"',
  async function (this: CukeWorld, command: string) {
    runCommand.bind(this)(command)
  }
)
