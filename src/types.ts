import type { Howl } from 'howler'

export type AppState = {
  tempo: number
  evolveSpeed: number
  playing: boolean
  evolving: boolean
  showInfo: boolean
  showSave: boolean
  filesToLoad: number
  filesLoaded: number
  currentTick: number
}

export type Instrument = {
  palettes: Howl[]
  sounds: number
  measureLength: number
  duration: number
  limit: boolean
  evolve: boolean
  soundPalette: number
  active: boolean[][]
}

export type ActionName =
  | 'TICK'
  | 'TOGGLE_PAD'
  | 'ADD_INSTRUMENT'
  | 'CLEAR_ALL_PADS'
  | 'CHANGE_SOUND_PALETTE'
  | 'TOGGLE_PLAYING'
  | 'TOGGLE_EVOLVING'
  | 'TOGGLE_INFO'
  | 'TOGGLE_SAVE'
  | 'FILE_LOADED'
  | 'LOAD_PATTERN'
  | 'UNDO'

export type Action = {
  type: ActionName
  [key: string]: any
}
