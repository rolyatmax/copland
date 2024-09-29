import type { Action, Instrument } from './types'

export const tick = (): Action => ({ type: 'TICK' })
export const changeSoundPalette = (): Action => ({ type: 'CHANGE_SOUND_PALETTE' })
export const clearAllPads = (): Action => ({ type: 'CLEAR_ALL_PADS' })
export const togglePlaying = (): Action => ({ type: 'TOGGLE_PLAYING' })
export const toggleEvolving = (): Action => ({ type: 'TOGGLE_EVOLVING' })
export const toggleSave = (): Action => ({ type: 'TOGGLE_SAVE' })
export const fileLoaded = (): Action => ({ type: 'FILE_LOADED' })
export const loadPattern = (hash: string): Action => ({ type: 'LOAD_PATTERN', hash })
export const undo = (): Action => ({ type: 'UNDO' })
export const togglePad = ({ instrument, column, row }: { instrument: number, column: number, row: number }): Action => ({
  type: 'TOGGLE_PAD',
  pad: { instrument, column, row },
})
export const addInstrument = (instrument: Instrument): Action => ({
  type: 'ADD_INSTRUMENT',
  instrument,
})
