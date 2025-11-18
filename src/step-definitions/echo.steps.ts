import { dataTableToString } from '../formatters/table.utils'
import { Step } from '../index'

Step('I echo "{arg}"', async function (value: string) {
  console.log(value)
})

Step('I echo the following:', async function (value: any) {
  if (value.rawTable !== undefined) {
    console.log(dataTableToString(value))
  } else {
    console.log(value)
  }
})
