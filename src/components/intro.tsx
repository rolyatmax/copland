import React, { useState, useCallback, useEffect } from 'react'
import Copland from '../copland'
import { COLORS } from '../constants'

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
const cssColors = COLORS.map((c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`)

export default function Intro({ copland }: { copland: Copland }) {
  const [optedIn, setOptedIn] = useState(false)
  const [_, setTick] = useState(0) // just used to trigger a re-render

  const onStart = useCallback(() => {
    setOptedIn(true)
    copland.togglePlaying(true)
  }, [copland])

  useEffect(() => copland.addOnChange(() => setTick((tick) => tick + 1)), [copland])

  const perc = copland.loading ? ((copland.filesLoaded / copland.filesToLoad) * 100 + 0.5) | 0 : 100
  const index = copland.loading ? copland.filesLoaded : (copland.currentTick / 8) | 0
  const backgroundColor = cssColors[index % cssColors.length]

  return (
    <>
      <div className={`opt-in ${!copland.ready || optedIn ? 'hide' : ''}`}>
        <button onClick={onStart}>Start</button>
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
    </>
  )
}
