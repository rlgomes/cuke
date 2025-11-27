import { Step } from '../index'

Step('I fail', function () {
  throw new Error('step failed on purpose')
})
