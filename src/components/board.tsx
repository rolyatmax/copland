import React from 'react'
import type Copland from '../copland'
import { PAD_WIDTH, COLORS } from '../constants'
import Column from './column'

type BoardProps = {
  instruments: Copland['instruments']
  togglePad: (instrument: number, column: number, row: number) => void
  nextSoundPalette: () => void
  currentTick: number
  playing: boolean
}

export default function Board({
  togglePad,
  nextSoundPalette,
  instruments,
  currentTick,
  playing,
}: BoardProps) {
  return (
    <div>
      {instruments.map((instrument: Copland['instruments'][number], i: number) => {
        let { measureLength, pads, soundPalette, duration } = instrument
        return (
          <div key={i} className="instrument" style={{ width: measureLength * PAD_WIDTH }}>
            {pads.map((pads, column) => (
              <Column
                key={column}
                instrument={i}
                pulsing={playing && (currentTick / duration) % measureLength === column}
                {...{ togglePad, pads, column, soundPalette }}
              />
            ))}
          </div>
        )
      })}
      <div
        onClick={nextSoundPalette}
        className="sounds-control"
        style={{ backgroundColor: COLORS[instruments[0].soundPalette] }}
      />
    </div>
  )
}
