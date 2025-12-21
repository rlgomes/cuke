import Debug from 'debug'
import { spawnSync } from 'child_process'
import { split } from 'shlex'

import { type CukeWorld, Step } from '../index'

const debug = Debug('cuke')

interface ContainerArguments {
  cmd: string
  options?: {
    filter?: string
    expectedExitCode?: string
  }
}

function getContainerRuntime (): string {
  const podman = spawnSync('podman', ['--version'])
  if (podman.status === 0) {
    return 'podman'
  }
  return 'docker'
}

const runtime = getContainerRuntime()

function container ({
  cmd = '',
  options = {
    filter: '',
    expectedExitCode: '0'
  }
}: ContainerArguments): string[] {
  debug(`running "${runtime} ${cmd}"`)
  const result = spawnSync(runtime, split(cmd), {
    stdio: ['inherit', 'pipe', 'pipe']
  })

  if (result.error !== undefined) {
    throw new Error(result.error.toString())
  }

  if (result.status !== parseInt(options.expectedExitCode ?? '0')) {
    const output = `STDOUT:\n${result.stdout?.toString()}\nSTDERR:\n${result.stderr?.toString()}`
    throw new Error(`script failed with exit code: ${result.status ?? ''}\n${output}`)
  }

  return [result.stdout.toString(), result.stderr.toString()]
}

function listContainers (filter?: string): string[] {
  const filterBy = filter !== undefined ? `--filter ${filter}` : ''
  return container({
    cmd: `ps --all --format {{.Names}} ${filterBy}`
  })[0].split('\n')
}

function containerExists (name: string, filter?: string): boolean {
  const containerNames = listContainers(filter)
  return containerNames.includes(name)
}

// label every container started by these steps with `cuke-automation` so they
// are easy to find and clean up
Step('I run the container "{arg}" with image "{arg}"',
  (name: string, image: string) => {
    container({ cmd: `run --label cuke-automation --detach --name ${name} --publish-all ${image}` })
  })

Step('I run the container "{arg}" with image "{arg}", ports "{arg}"',
  (name: string, image: string, ports: string) => {
    const portsOption = ports.split(',').map((value) => `--publish ${value}`).join(' ')
    container({ cmd: `run --label cuke-automation --detach --name ${name} ${portsOption} ${image}` })
  })

Step('I run "{arg}" on the image "{arg}"',
  (command: string, image: string) => {
    container({ cmd: `run --label cuke-automation --rm ${image} ${command}` })
  })

Step('I run "{arg}" on the image "{arg}" with volume "{arg}"',
  (command: string, image: string, volume: string) => {
    container({ cmd: `run --label cuke-automation --rm --volume ${volume} ${image} ${command}` })
  })

Step('I kill the container "{arg}"',
  (name: string) => {
    container({ cmd: `kill ${name}` })
  })

Step('I kill the container "{arg}" if it exists',
  (name: string) => {
    if (containerExists(name, 'status=running')) {
      container({ cmd: `kill ${name}` })
    }
  })

Step('I remove the container "{arg}"',
  (name: string) => container({ cmd: `rm ${name}` })
)

Step('I remove the container "{arg}" if it exists',
  (name: string) => {
    if (containerExists(name)) {
      container({ cmd: `rm ${name}` })
    }
  })

Step('I kill and remove the container "{arg}"',
  (name: string) => {
    container({ cmd: `kill ${name}` })
    container({ cmd: `rm ${name}` })
  })

Step('I kill and remove the container "{arg}" if it exists',
  (name: string) => {
    if (containerExists(name, 'status=running')) {
      container({ cmd: `kill ${name}` })
    }
    if (containerExists(name)) {
      container({ cmd: `rm ${name}` })
    }
  })

Step('I exec "{arg}" on the container "{arg}"',
  (command: string, name: string) => {
    container({ cmd: `exec -i ${name} ${command}` })
  })

Step('I exec "{arg}" on the container "{arg}" and wait for exit code "{arg}"',
  async function (this: CukeWorld, command: string, name: string, exitCode: string) {
    await this.waitFor(async () => {
      container({
        cmd: `exec -i ${name} ${command}`,
        options: {
          expectedExitCode: exitCode
        }
      })
    })
  })

Step('I run the following command on the container "{arg}":',
  (name: string, command: string) => {
    container({ cmd: `exec -i ${name} ${command}` })
  })

Step('I exec "{arg}" on the container "{arg}" and wait for stdout to contain "{arg}"',
  async function (this: CukeWorld, command: string, name: string, output: string) {
    await this.waitFor(async () => {
      const stdout = container({
        cmd: `exec -i ${name} ${command}`
      })[0]

      if (!stdout.includes(output)) {
        throw new Error(`\n${stdout}\n does not contain:\n${output}\n`)
      }
    },
    {
      delay: 1000
    })
  })

Step('I exec "{arg}" on the container "{arg}" and wait for stdout to match the following:',
  async function (this: CukeWorld, command: string, name: string, output: string) {
    await this.waitFor(async () => {
      const stdout = container({
        cmd: `exec -i ${name} ${command}`
      })[0]

      if (stdout.match(output) === null) {
        throw new Error(`\n${stdout}\n does not match:\n${output}\n`)
      }
    },
    {
      delay: 1000
    })
  })

Step('I exec "{arg}" on the container "{arg}" and save stdout to the variable "{arg}"',
  async function (this: CukeWorld, command: string, name: string, variableName: string) {
    await this.waitFor(async () => {
      const stdout = container({
        cmd: `exec -i ${name} ${command}`
      })[0]

      process.env[variableName] = stdout
    })
  })

Step('I save the host port for the guest port "{arg}" of the container "{arg}" to the variable "{arg}"',
  async function (this: CukeWorld, guestPort: string, name: string, variable: string) {
    const mapping = await this.waitFor(async () => {
      return container({
        cmd: `port ${name} ${guestPort}`
      })[0]
    })

    //
    // `docker port ...` is sometimes just the ipv4 address and other times
    // with the 2nd line having the ipv6 address and port
    //
    // 0.0.0.0:8080
    // [::]:8080
    //
    //
    process.env[variable] = mapping.split('\n')[0].split(':')[1].trim()
  })
