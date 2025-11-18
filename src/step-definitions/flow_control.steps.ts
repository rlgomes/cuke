import { Step } from '../index'

Step('I fail', function () {
  throw new Error('step failed on purpose')
})

Step('I sleep for "{arg}" seconds',
  async function (seconds: string) {
    return await new Promise(resolve => setTimeout(resolve, parseFloat(seconds) * 1000))
  })
