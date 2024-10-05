import React, { useState, useEffect, useCallback } from 'react'
import Copland from '../copland'
import { COLORS } from '../constants'
// import Save from './save'
import Board from './board'

const TEXT_OPTS = [
  'Spinning Hamster Wheels',
  'Milking the Cows',
  'Brewing the Coffee',
  'Loading Audio Files',
  'Solving Rubiks Cube',
  'Filtering Water',
  'Sharpening Pencils',
]

const loadingText = TEXT_OPTS[Math.floor(Math.random() * TEXT_OPTS.length)]

export default function App({ copland }: { copland: Copland }) {
  // const [showSave, setShowSave] = useState(false)
  const [tick, setTick] = useState(0) // just used to trigger a re-render

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      const keyBindings: Record<string, () => void> = {
        Backspace: copland.clearAllPads.bind(copland),
        // KeyE: copland.toggleEvolving.bind(copland),
        // KeyS: () => setShowSave((show: boolean) => !show),
        Space: copland.togglePlaying.bind(copland),
        Enter: copland.togglePlaying.bind(copland),
      }
      keyBindings[e.code]?.()
    },
    [copland],
  )

  useEffect(() => {
    const unsub = copland.addOnChange(() => {
      console.log('rerender!', copland)
      setTick((tick) => tick + 1)
    })
    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('keydown', onKeydown)
      unsub()
    }
  }, [copland, onKeydown])

  const { currentTick, instruments, playing } = copland
  const togglePad = copland.togglePad.bind(copland)
  const nextSoundPalette = copland.nextSoundPalette.bind(copland)

  const style = {
    opacity: copland.ready ? 1 : 0,
    transition: 'opacity 300ms linear 500ms',
  }

  const perc = copland.loading ? ((copland.filesLoaded / copland.filesToLoad) * 100 + 0.5) | 0 : 100
  const index = copland.loading ? copland.filesLoaded : copland.currentTick / 8 | 0
  const backgroundColor = COLORS[index % COLORS.length]

  return (
    <div>
      <div id="main-view">
        <div style={style}>
          <div className="topbar"></div>
          <div id="container">
            <h1 className="title">Copland</h1>
            {copland.ready ? (
              <Board {...{ currentTick, instruments, togglePad, nextSoundPalette, playing }} />
            ) : null}
            {/** TODO: TURN THIS BACK ON ONCE SAVE/EVOLVE ARE SET UP  */}
            {/* {copland.ready ? (
              <div className="btns">
                <div onClick={() => setShowSave(true)} className="save-btn">
                  save
                </div>
                <div onClick={toggleEvolving} className={`evolve-btn ${evolving ? 'evolving' : ''}`}>
                evolve
              </div>
              </div>
            ) : null} */}
          </div>
        </div>
        {copland.loading ? (
          <div className="loader">
            <h3>{loadingText}...</h3>
            <div id="perc">{perc}%</div>
          </div>
        ) : null}
        {copland.filesToLoad ? (
          <div
            className={`bottombar ${copland.ready ? 'loaded' : ''}`}
            style={{ width: `${perc}%`, backgroundColor }}
          />
        ) : null}
      </div>
      {/* <Save show={showSave} hideSave={() => setShowSave(false)} hash={copland.encodeState()} /> */}
    </div>
  )
}
