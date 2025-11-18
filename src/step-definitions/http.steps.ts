import { type CukeWorld, Step } from '../index'

import got from 'got'

Step('I send an HTTP "{arg}" to the URL "{arg}"',
  async function (this: CukeWorld, method: string, url: string) {
    const response = await got(url, { method })
    process.env.result = response
  }
)

Step('I wait for an HTTP "{arg}" to the URL "{arg}" to respond with status code "{arg}"',
  async function (this: CukeWorld, method: string, url: string, status: string) {
    await this.waitFor(async () => {
      const response = await got(url, { method })
      if (`${response.statusCode}` !== status) {
        throw new Error(`Expected response code ${status}, but got ${response.statusCode}`)
      }
      process.env.result = response
    })
  }
)

Step('I send an HTTP "{arg}" to the URL "{arg}" with the following data:',
  async function (this: CukeWorld, method: string, url: string, data: string) {
    const response = await got(url, { method, body: data })
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

    const response = await got(url, { method, body: data, headers: headerMap })
    process.env.result = response
  }
)
