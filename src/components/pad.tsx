import React, { useCallback, useState, useEffect } from 'react'
import { COLORS } from '../constants'

type PadProps = {
  instrument: number
  column: number
  row: number
  active: boolean
  soundPalette: number
  togglePad: (instrument: number, column: number, row: number) => void
  pulsing: boolean
}

export default function Pad({
  instrument,
  column,
  row,
  active,
  soundPalette,
  togglePad,
  pulsing,
}: PadProps) {
  const [color, setColor] = useState(active ? COLORS[soundPalette % COLORS.length] : 'white')
  const [opacity, setOpacity] = useState(0.65)
  const [transition, setTransition] = useState('none')

  const onClick = useCallback(() => {
    if (!active) {
      setColor(COLORS[soundPalette % COLORS.length])
    }
    togglePad(instrument, column, row)
  }, [instrument, column, row, active, soundPalette, togglePad])

  useEffect(() => {
    if (pulsing) {
      setOpacity(1)
      setTransition('none')
      setColor(COLORS[soundPalette % COLORS.length])
      setTimeout(() => {
        setOpacity(0.65)
        setTransition('opacity 400ms linear')
      }, 50)
    }
  }, [pulsing])

  const style = {
    backgroundColor: active ? color : 'white',
    opacity,
    transition,
  }

  return <div onClick={onClick} style={style} className={`pad ${active ? 'active' : ''}`} />
}
