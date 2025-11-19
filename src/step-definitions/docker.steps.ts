import Debug from 'debug'
import { spawnSync } from 'child_process'
import { split } from 'shlex'

import { type CukeWorld, Step } from '../index'

const debug = Debug('cuke')

// XXX couldn't find a good docker client so just assuming the docker CLI is
// available for now
interface DockerArguments {
  cmd: string
  options?: {
    filter?: string
    expectedExitCode?: string
  }
}

function docker ({
  cmd = '',
  options = {
    filter: '',
    expectedExitCode: '0'
  }
}: DockerArguments): string[] {
  debug(`running "docker ${cmd}"`)
  const result = spawnSync('docker', split(cmd), {
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

function listContainers (filter?: string): string [] {
  const filterBy = filter !== undefined ? `--filter ${filter}` : ''
  return docker({
    cmd: `ps --all --format {{.Names}} ${filterBy}`
  })[0].split('\n')
}

function containerExists (name: string, filter?: string): boolean {
  const containerNames = listContainers(filter)
  return containerNames.includes(name)
}

// label every container started by these steps with `cuke-automation` so they
// are easy to find and clean up
Step('I run the docker container "{arg}" with image "{arg}"',
  (name: string, image: string) => {
    docker({ cmd: `run --label cuke-automation --detach --name ${name} --publish-all ${image}` })
  })

Step('I run the docker container "{arg}" with image "{arg}", ports "{arg}"',
  (name: string, image: string, ports: string) => {
    const portsOption = ports.split(',').map((value) => `--publish ${value}`).join(' ')
    docker({ cmd: `run --label cuke-automation --detach --name ${name} ${portsOption} ${image}` })
  })

Step('I run "{arg}" on the docker image "{arg}"',
  (command: string, image: string) => {
    docker({ cmd: `run --label cuke-automation --rm ${image} ${command}` })
  })

Step('I run "{arg}" on the docker image "{arg}" with volume "{arg}"',
  (command: string, image: string, volume: string) => {
    docker({ cmd: `run --label cuke-automation --rm --volume ${volume} ${image} ${command}` })
  })

Step('I kill the docker container "{arg}"',
  (name: string) => {
    docker({ cmd: `kill ${name}` })
  })

Step('I kill the docker container "{arg}" if it exists',
  (name: string) => {
    if (containerExists(name, 'status=running')) {
      docker({ cmd: `kill ${name}` })
    }
  })

Step('I remove the docker container "{arg}"',
  (name: string) => docker({ cmd: `rm ${name}` })
)

Step('I remove the docker container "{arg}" if it exists',
  (name: string) => {
    if (containerExists(name)) {
      docker({ cmd: `rm ${name}` })
    }
  })

Step('I kill and remove the docker container "{arg}" if it exists',
  (name: string) => {
    if (containerExists(name, 'status=running')) {
      docker({ cmd: `kill ${name}` })
    }
    if (containerExists(name)) {
      docker({ cmd: `rm ${name}` })
    }
  })

Step('I exec "{arg}" on the docker container "{arg}"',
  (command: string, name: string) => {
    docker({ cmd: `exec -it ${name} ${command}` })
  })

Step('I exec "{arg}" on the docker container "{arg}" and wait for exit code "{arg}"',
  async function (this: CukeWorld, command: string, name: string, exitCode: string) {
    await this.waitFor(async () => {
      docker({
        cmd: `exec -it ${name} ${command}`,
        options: {
          expectedExitCode: exitCode
        }
      })
    })
  })

Step('I run the following command on the docker container "{arg}":',
  (name: string, command: string) => {
    docker({ cmd: `exec -it ${name} ${command}` })
  })

function listNetworks (): string[] {
  return docker({
    cmd: 'network ls --format {{.Name}}'
  })[0].split('\n')
}

Step('I create the docker network "{arg}" if it does not exist',
  async function (name: string) {
    const networks = listNetworks()
    if (!networks.includes(name)) {
      docker({ cmd: `network create ${name}` })
    }
  })

Step('I connect the docker container "{arg}" to the network "{arg}"',
  async function (containerName: string, networkName: string) {
    docker({ cmd: `network connect ${networkName} ${containerName}` })
  })

Step('I exec "{arg}" on the docker container "{arg}" and wait for stdout to contain "{arg}"',
  async function (this: CukeWorld, command: string, name: string, output: string) {
    await this.waitFor(async () => {
      const stdout = docker({
        cmd: `exec -it ${name} ${command}`
      })[0]

      if (!stdout.includes(output)) {
        throw new Error(`\n${stdout}\n does not contain:\n${output}\n`)
      }
    },
    {
      delay: 1000
    })
  })

Step('I exec "{arg}" on the docker container "{arg}" and wait for stdout to match the following:',
  async function (this: CukeWorld, command: string, name: string, output: string) {
    await this.waitFor(async () => {
      const stdout = docker({
        cmd: `exec -it ${name} ${command}`
      })[0]

      if (stdout.match(output) === null) {
        throw new Error(`\n${stdout}\n does not match:\n${output}\n`)
      }
    },
    {
      delay: 1000
    })
  })

Step('I exec "{arg}" on the docker container "{arg}" and save stdout to the variable "{arg}"',
  async function (this: CukeWorld, command: string, name: string, variableName: string) {
    await this.waitFor(async () => {
      const stdout = docker({
        cmd: `exec -it ${name} ${command}`
      })[0]

      process.env[variableName] = stdout
    })
  })

Step('I save the host port for the guest port "{arg}" of the docker container "{arg}" to the variable "{arg}"',
  async function (this: CukeWorld, guestPort: string, name: string, variable: string) {
    const mapping = await this.waitFor(async () => {
      return docker({
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
    process.env[variable] = mapping.split('\n')[0].split(':')[1].trim()
  })
