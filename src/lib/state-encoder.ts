import createEncoder from './encode-object'
import type { EncoderConfig } from './encode-object'
import type { TogglePadAction } from '../copland'

const SOUNDS_COUNT = 9
const COLUMN_COUNT = 8

const encoderConfig: EncoderConfig = {}

let i = COLUMN_COUNT
while (i--) {
  // string instrument only has one active pad per column (or none)
  encoderConfig[`string-column-${i}`] = [0, SOUNDS_COUNT, 1]

  // piano instrument has 9 pads per column, any of which can be active
  let j = SOUNDS_COUNT
  while (j--) {
    encoderConfig[`piano-col-row-${i}-${j}`] = [0, 1, 1]
  }
}

const { encodeObject, decodeObject } = createEncoder(encoderConfig)

export function getActivePadsFromHash(encodedString: string): TogglePadAction[] {
  const activePads: TogglePadAction[] = []
  const settings = decodeObject(encodedString)

  for (let key in settings) {
    if (key.startsWith('string-column-')) {
      const activeRow = settings[key]
      const instrument = 1
      const column = parseInt(key.split('string-column-')[1], 10)
      if (activeRow) {
        const row = activeRow - 1
        activePads.push({ instrument, row, column, active: true })
      }
    }
    if (key.startsWith('piano-col-row-')) {
      const isActive = Boolean(settings[key])
      const instrument = 0
      if (isActive) {
        const [c, r] = key.split('piano-col-row-')[1].split('-')
        const column = parseInt(c, 10)
        const row = parseInt(r, 10)
        activePads.push({ instrument, row, column, active: true })
      }
    }
  }

  return activePads
}

// pads[INSTRUMENT][COLUMN][ROW]
export function generateHash(pads: boolean[][][]) {
  const pianoPads = pads[0]
  const stringPads = pads[1]

  const settings: Record<string, number> = {}

  stringPads.forEach((rows, colIdx) => {
    const activePad = rows.findIndex((isActive) => isActive)
    settings[`string-column-${colIdx}`] = activePad + 1
  })

  pianoPads.forEach((rows, colIdx) => {
    rows.forEach((isActive, rowIdx) => {
      settings[`piano-col-row-${colIdx}-${rowIdx}`] = isActive ? 1 : 0
    })
  })

  return encodeObject(settings)
}
