import { tick, togglePlaying } from '../actions'
import type { Action, Instrument, AppState } from '../types'

// TODO: TOGGLE_PAD should play the sounds when playing is off
export const playLoop = (store) => (next) => (action: Action) => {
  switch (action.type) {
    case 'TOGGLE_PLAYING':
      toggleLoop(store)
      break
    case 'TICK':
      playTick(store.getState())
      break
    case 'FILE_LOADED':
      let { filesToLoad, filesLoaded } = store.getState().appState
      if (filesToLoad === filesLoaded + 1) {
        store.dispatch(togglePlaying())
      }
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
    store.dispatch(tick())
    let { playing, tempo } = store.getState().appState
    if (playing) {
      timeout = setTimeout(step, tempo)
    }
  }

  timeout = setTimeout(step, 0)
}

function playTick({ appState, instruments }: { appState: AppState; instruments: Instrument[] }) {
  let { currentTick } = appState
  currentTick += 1
  instruments
    .filter((instrument) => currentTick % instrument.duration === 0)
    .forEach((instrument) => {
      let { palettes, soundPalette, active, measureLength } = instrument
      let curColumn = (currentTick / instrument.duration) % measureLength
      active[curColumn].forEach((isActive, i) => {
        if (isActive) {
          palettes[soundPalette].play(i + 1) // pitches are 1-indexed
        }
      })
    })
}
