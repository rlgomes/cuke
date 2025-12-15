import { type CukeWorld, Step } from '../index'

interface Options {
  method: string
  body?: string
  headers?: Record<string, string>
}

async function request (url: string, options: Options): Promise<Record<string, string>> {
  const { default: got } = await import('got')
  const response = await got(url, options)

  return {
    body: `${response?.body}`,
    status: `${response?.statusCode}`
  }
}

Step('I send an HTTP "{arg}" to the URL "{arg}"',
  async function (this: CukeWorld, method: string, url: string) {
    const response = await request(url, { method })
    process.env.result = response
  }
)

Step('I wait for an HTTP "{arg}" to the URL "{arg}" to respond with status code "{arg}"',
  async function (this: CukeWorld, method: string, url: string, status: string) {
    await this.waitFor(async () => {
      const response = await request(url, { method })
      if (`${response.status}` !== status) {
        throw new Error(`Expected response code ${status}, but got ${response.status}`)
      }
      process.env.result = response
    })
  }
)

Step('I send an HTTP "{arg}" to the URL "{arg}" with the following data:',
  async function (this: CukeWorld, method: string, url: string, data: string) {
    const response = await request(url, { method, body: data })
    process.env.result = response
  }
)

Step('I send an HTTP "{arg}" to the URL "{arg}" with headers "{arg}" and the following data:',
  async function (this: CukeWorld, method: string, url: string, headers: string, data: string) {
    const headerMap = headers.split(',').map((element) => {
      const parts = element.split(':')
      const data: Record<string, string> = {}
      data[parts[0]] = parts[1]
      return data
    }).reduce((map, submap) => {
      return Object.assign(map, submap)
    }, {})

    const response = await request(url, { method, body: data, headers: headerMap })
    process.env.result = response
  }
)
