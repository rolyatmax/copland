import type { AppState, Action } from '../types'

function getInitialState(): AppState {
  return {
    tempo: 350,
    evolveSpeed: 2000,
    playing: false,
    evolving: false,
    showInfo: false,
    showSave: false,
    filesToLoad: 0,
    filesLoaded: 0,
    currentTick: -1,
  }
}

export function appState(state = getInitialState(), action: Action) {
  switch (action.type) {
    case 'TICK':
      return { ...state, currentTick: state.currentTick + 1 }
    case 'TOGGLE_PLAYING':
      return { ...state, playing: !state.playing }
    case 'TOGGLE_EVOLVING':
      return { ...state, evolving: !state.evolving }
    case 'TOGGLE_INFO':
      return { ...state, showInfo: !state.showInfo }
    case 'TOGGLE_SAVE':
      return { ...state, showSave: !state.showSave }
    case 'FILE_LOADED':
      return { ...state, filesLoaded: state.filesLoaded + 1 }
    case 'ADD_INSTRUMENT':
      let fileCount = action.instrument.palettes.length
      return { ...state, filesToLoad: state.filesToLoad + fileCount }
    default:
      return state
  }
}
