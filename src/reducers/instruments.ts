import type { Instrument, Action } from '../types'

function fillWithArrays(array: any[], fillArray: boolean[]): boolean[][] {
  let size = array.length
  const result = array.slice()
  while (size--) {
    result[size] = fillArray.slice()
  }
  return result
}

function emptyMatrix(columns: number, rows: number): boolean[][] {
  const columnData: boolean[] = Array(rows).fill(false)
  return fillWithArrays(Array(columns), columnData)
}

export function instruments(state: Instrument[] = [], action: Action): Instrument[] {
  switch (action.type) {
    case 'ADD_INSTRUMENT':
      const { measureLength, sounds } = action.instrument
      const active = emptyMatrix(measureLength, sounds)
      const newInstrument = { ...action.instrument, active }
      return [...state, newInstrument]
    case 'CLEAR_ALL_PADS':
      return state.map((instr) => ({
        ...instr,
        active: emptyMatrix(instr.measureLength, instr.sounds),
      }))
    case 'CHANGE_SOUND_PALETTE':
      return state.map((instr) => {
        return {
          ...instr,
          soundPalette: (instr.soundPalette + 1) % instr.palettes.length,
        }
      })
    case 'TOGGLE_PAD':
      let { instrument, column, row } = action.pad
      let col = state[instrument].limit
        ? Array(state[instrument].sounds).fill(false)
        : state[instrument].active[column].slice()
      col[row] = !col[row]
      let newActive = [
        ...state[instrument].active.slice(0, column),
        col,
        ...state[instrument].active.slice(column + 1),
      ]
      return [
        ...state.slice(0, instrument),
        { ...state[instrument], active: newActive },
        ...state.slice(instrument + 1),
      ]
    default:
      return state
  }
}
