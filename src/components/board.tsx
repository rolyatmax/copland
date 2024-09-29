import React from 'react'
import type { Instrument } from '../types'
import { PAD_WIDTH, COLORS } from '../constants'
import Column from './column'

type BoardProps = {
  instruments: any[]
  togglePad: (opts: { instrument: number; column: number; row: number }) => void
  changeSoundPalette: () => void
  currentTick: number
  playing: boolean
}

export default function Board({ togglePad, changeSoundPalette, instruments, currentTick, playing }: BoardProps) {
  return (
    <div>
      {instruments.map((instrument: Instrument, i: number) => {
        let { measureLength, active, soundPalette, duration } = instrument
        return (
          <div key={i} className="instrument" style={{ width: measureLength * PAD_WIDTH }}>
            {active.map((pads, column) => (
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
        onClick={changeSoundPalette}
        className="sounds-control"
        style={{ backgroundColor: COLORS[instruments[0].soundPalette] }}
      />
    </div>
  )
}
