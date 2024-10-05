import React from 'react'
import Pad from './pad'
import { PAD_WIDTH } from '../constants'

interface ColumnProps {
  instrument: number
  column: number
  pads: any[]
  togglePad: (instrument: number, column: number, row: number) => void
  soundPalette: number
  pulsing: boolean
}

export default function Column({
  pads,
  column,
  togglePad,
  instrument,
  soundPalette,
  pulsing,
}: ColumnProps) {
  const els: React.ReactElement[] = []
  let row = pads.length
  while (row--) {
    const active = pads[row]
    els.push(
      <Pad
        key={row}
        pulsing={pulsing && active}
        {...{ column, row, active, instrument, soundPalette, togglePad }}
      />,
    )
  }
  return <div style={{ width: PAD_WIDTH, display: 'inline-block' }}>{els}</div>
}
