export function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function maxBy<T>(arr: T[], fn: (item: T) => number): T {
  return arr.reduce((max, item) => (fn(item) > fn(max) ? item : max), arr[0])
}

export function getRowAndColumn(
  isActive: boolean,
  pads: boolean[][],
): { column: number; row: number }[] {
  return pads.reduce(
    (collection: { column: number; row: number }[], rows: boolean[], column: number) => {
      let row = rows.length
      collection = collection.slice()
      while (row--) {
        if (isActive === rows[row]) {
          collection.push({ column, row })
        }
      }
      return collection
    },
    [],
  )
}

export function getMostFilledCol(activePads: boolean[][]) {
  let columnData = activePads.map((rows, column) => {
    return rows.reduce(
      (collection: { column: number; row: number }[], isActive: boolean, row: number) => {
        collection = collection.slice()
        if (isActive) {
          collection.push({ column, row })
        }
        return collection
      },
      [],
    )
  })

  return maxBy(columnData, (column) => column.length)
}

export function getMostFilledRow(activePads: boolean[][]) {
  let rowData: { column: number; row: number }[][] = []
  let row = activePads[0].length
  while (row--) {
    rowData[row] = []
    let column = activePads.length
    while (column--) {
      if (activePads[column][row]) {
        rowData[row].push({ column, row })
      }
    }
  }
  return maxBy(rowData, (r) => r.length)
}
