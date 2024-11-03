import React, { useState, useEffect, useCallback } from 'react'
import Copland from '../copland'
import Save from './save'

export default function Buttons({ copland }: { copland: Copland }) {
  const [showSave, setShowSave] = useState(false)
  const [_, setTick] = useState(0) // just used to trigger a re-render

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      const keyBindings: Record<string, () => void> = {
        Backspace: copland.clearAllPads.bind(copland),
        KeyE: copland.toggleEvolving.bind(copland),
        KeyS: () => setShowSave((show: boolean) => !show),
        Space: copland.togglePlaying.bind(copland),
        Enter: copland.togglePlaying.bind(copland),
      }
      const action = keyBindings[e.code]
      if (action) {
        action()
        e.preventDefault()
      }
    },
    [copland],
  )

  useEffect(() => {
    const onChangeUnsub = copland.addOnChange(() => setTick((tick) => tick + 1))
    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('keydown', onKeydown)
      onChangeUnsub()
    }
  }, [copland, onKeydown])

  if (!copland.ready) return null

  return (
    <>
      <div
        onClick={() => (window.location.href = 'https://github.com/rolyatmax/copland')}
        className="open-info"
      >
        info
      </div>
      <div onClick={() => setShowSave(true)} className="save-btn">
        save
      </div>
      <div
        onClick={() => copland.toggleEvolving()}
        className={`evolve-btn ${copland.evolving ? 'evolving' : ''}`}
      >
        evolve
      </div>
      <Save show={showSave} hideSave={() => setShowSave(false)} hash={copland.encodeState()} />
    </>
  )
}
