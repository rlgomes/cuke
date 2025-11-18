import CliTable3 from 'cli-table3'
import type * as messages from '@cucumber/messages'

function dataTableToString (datatable: any): string {
  const table = new CliTable3({
    chars: {
      left: '|',
      middle: '|',
      right: '|',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': '',
      mid: '',
      'left-mid': '',
      'mid-mid': '',
      'right-mid': '',
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': ''
    },
    style: {
      head: [],
      border: []
    }
  })

  if (datatable.rawTable !== undefined) {
    table.push(...datatable.rawTable)
  } else if (datatable.rows !== undefined) {
    table.push(
      ...datatable.rows.map((row: messages.TableRow) =>
        row.cells.map((cell) => cell.value ?? '')
      )
    )
  } else {
    console.log('unsupported table:', datatable)
    throw new Error('unsupported table, see above for details.')
  }

  return table.toString()
}

export { dataTableToString }
