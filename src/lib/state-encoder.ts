// @ts-nocheck

import createEncoder from './encode-object'
import type { EncoderConfig } from './encode-object'

const SOUNDS_COUNT = 9
const COLUMN_COUNT = 8

const encoderConfig: EncoderConfig = {
  stringsActive: ['int', COLUMN_COUNT], // only 8 columns, one active pad per column
}

const digits = Math.pow(2, SOUNDS_COUNT).toString().length
let i = COLUMN_COUNT
while (i--) {
  // each column has 9 pads, 2^9 - 1 = 511
  encoderConfig[`c${i}`] = ['int', digits]
}

const { encodeObject, decodeObject } = createEncoder(encoderConfig)

type ActivePad = { instrument: number; row: number; column: number }
export function getActivePadsFromHash(encodedString: string): ActivePad[] {
  const activePads: ActivePad[] = []

  const settings = decodeObject(encodedString)
  settings.stringsActive
    .toString()
    .split('')
    .forEach((activeRowStr: string, column: number) => {
      const instrument = 1
      const activeRow = parseInt(activeRowStr, 10)
      if (activeRow) {
        const row = activeRow - 1
        activePads.push({ instrument, row, column })
      }
    })

  for (let j = 0; j < COLUMN_COUNT; j++) {
    const bits = settings[`c${j}`].toString(2)
    bits
      .padStart(SOUNDS_COUNT, '0')
      .split('')
      .forEach((isActive: '0' | '1', k: number) => {
        const instrument = 0
        const column = j
        if (isActive === '1') {
          const row = k % SOUNDS_COUNT
          activePads.push({ instrument, row, column })
        }
      })
  }

  return activePads
}

// pads[INSTRUMENT][COLUMN][ROW]
export function generateHash(pads: boolean[][][]) {
  const pianoPads = pads[0]
  const stringPads = pads[1]

  const stringsActive = stringPads
    .map((col) => {
      const activePad = col.find((isActive) => isActive)
      return activePad ? col.indexOf(activePad) + 1 : 0
    })
    .join('')

  const settings = {
    stringsActive: stringsActive,
  }

  pianoPads.map((col, j) => {
    const bits = col.map((isActive) => (isActive ? 1 : 0)).join('')
    settings[`c${j}`] = parseInt(bits, 2)
  })

  return encodeObject(settings)
}
