import { changeSoundPalette, togglePad } from '../actions'
import type { Action, Instrument } from '../types'

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function maxBy<T>(arr: T[], fn: (item: T) => number): T {
  return arr.reduce((max, item) => fn(item) > fn(max) ? item : max, arr[0])
}

export const evolveLoop = (store) => (next) => (action: Action) => {
  switch (action.type) {
    case 'TOGGLE_EVOLVING':
      toggleLoop(store)
      break
    default:
      break
  }
  return next(action)
}

let timeout: ReturnType<typeof setTimeout> | null = null
function toggleLoop(store) {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
    return
  }

  function step() {
    let { evolving, evolveSpeed } = store.getState().appState
    evolveStep(store)
    if (evolving) {
      timeout = setTimeout(step, evolveSpeed)
    }
  }

  timeout = setTimeout(step, 0)
}

function getRowAndColumn(isActive: boolean, pads: boolean[][]): { column: number; row: number }[] {
  return pads.reduce((collection: { column: number; row: number }[], rows: boolean[], column: number) => {
    let row = rows.length
    collection = collection.slice()
    while (row--) {
      if (isActive === rows[row]) {
        collection.push({ column, row })
      }
    }
    return collection
  }, [])
}

function evolveStep({ getState, dispatch }) {
  getState()
    .instruments
    .filter((instrument: Instrument) => {
      return instrument.evolve && Math.random() < 0.5
    })
    .forEach((instrument: Instrument, i: number) => {
      let { measureLength, sounds, active } = instrument

      // Collect some stats on the whole grid, and each row/column
      let totalPads = sounds * measureLength
      let activePads = getRowAndColumn(true, active)
      let inactivePads = getRowAndColumn(false, active)
      let percFilled = activePads.length / totalPads
      let mostFilledCol = getMostFilledCol(active)
      let mostFilledRow = getMostFilledRow(active)

      if (mostFilledCol.length > 2) {
        dispatch(
          togglePad({
            ...sample(mostFilledCol),
            instrument: i,
          }),
        )
      } else if (mostFilledRow.length > 2) {
        dispatch(
          togglePad({
            ...sample(mostFilledRow),
            instrument: i,
          }),
        )
      } else if (percFilled > 0.38) {
        dispatch(
          togglePad({
            ...sample(activePads),
            instrument: i,
          }),
        )
      } else if (percFilled < 0.29) {
        dispatch(
          togglePad({
            ...sample(inactivePads),
            instrument: i,
          }),
        )
      } else {
        dispatch(
          togglePad({
            ...sample(activePads),
            instrument: i,
          }),
        )
        dispatch(
          togglePad({
            ...sample(inactivePads),
            instrument: i,
          }),
        )
      }

      if (Math.random() < 0.15) {
        dispatch(changeSoundPalette())
      }
    })
}

function getMostFilledCol(activePads: boolean[][]) {
  let columnData = activePads.map((rows, column) => {
    return rows.reduce((collection: { column: number; row: number }[], isActive: boolean, row: number) => {
      collection = collection.slice()
      if (isActive) {
        collection.push({ column, row })
      }
      return collection
    }, [])
  })

  return maxBy(columnData, (column) => column.length)
}

function getMostFilledRow(activePads: boolean[][]) {
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
