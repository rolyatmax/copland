import { Howl } from 'howler'
import { getActivePadsFromHash, generateHash } from './lib/state-encoder'
import { sample, getRowAndColumn, getMostFilledCol, getMostFilledRow } from './lib/evolve-utils'

export type InstrumentDefinition = {
  palettes: { src: string; sprite: { [key: string]: [number, number] } }[]
  sounds: number
  measureLength: number
  duration: number
  limit: boolean
  evolve: boolean
}

export type Instrument = {
  palettes: Howl[]
  sounds: number
  measureLength: number
  duration: number
  limit: boolean
  evolve: boolean
  soundPalette: number
  pads: boolean[][]
}

export type TogglePadAction = { instrument: number; row: number; column: number; active?: boolean }

export default class Copland {
  readonly tempo = 350
  readonly evolveSpeed = 2000
  ready = false
  loading = false
  playing = false
  evolving = false
  readonly filesToLoad: number
  filesLoaded = 0
  currentTick = -1
  readonly instruments: Instrument[]

  private onChangeCallbacks: (() => void)[] = []
  private onReadyCallbacks: (() => void)[] = []
  private onToggleCallbacks: ((action: TogglePadAction) => void)[] = []
  private onTickCallbacks: ((columns: { instrument: number; column: number }[]) => void)[] = []
  private evolveTimeout: ReturnType<typeof setTimeout> | null = null
  private tickTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(instruments: InstrumentDefinition[]) {
    this.filesToLoad = instruments.reduce((acc, instrument) => acc + instrument.palettes.length, 0)
    if (this.filesToLoad > 0) this.loading = true

    this.instruments = instruments.map((instrument) => {
      const { sounds, measureLength, duration, limit, evolve } = instrument
      const soundPalette = 0
      const pads = Array.from({ length: measureLength }, () => Array(sounds).fill(false))
      const palettes = instrument.palettes.map(
        (palette) =>
          new Howl({
            src: [palette.src],
            sprite: palette.sprite,
            onload: () => {
              this.filesLoaded++
              const isDone = this.filesLoaded === this.filesToLoad
              if (isDone) {
                this.ready = true
                this.loading = false
                this.toggleEvolving(true)
                this.onReadyCallbacks.forEach((callback) => callback())
              }
              this.triggerOnChange()
            },
          }),
      )
      return { palettes, sounds, measureLength, duration, limit, evolve, soundPalette, pads }
    })
  }

  triggerOnChange = throttle(() => {
    this.onChangeCallbacks.forEach((callback) => callback())
  }, 1000 / 60)

  addOnChange(callback: () => void): () => void {
    this.onChangeCallbacks.push(callback)
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter((c) => c !== callback)
    }
  }

  addOnReady(callback: () => void): () => void {
    this.onReadyCallbacks.push(callback)
    return () => {
      this.onReadyCallbacks = this.onReadyCallbacks.filter((c) => c !== callback)
    }
  }

  addOnToggle(callback: (action: TogglePadAction) => void): () => void {
    this.onToggleCallbacks.push(callback)
    return () => {
      this.onToggleCallbacks = this.onToggleCallbacks.filter((c) => c !== callback)
    }
  }

  addOnTick(callback: (columns: { instrument: number; column: number }[]) => void): () => void {
    this.onTickCallbacks.push(callback)
    return () => {
      this.onTickCallbacks = this.onTickCallbacks.filter((c) => c !== callback)
    }
  }

  togglePlaying(play?: boolean) {
    this.playing = play ?? !this.playing
    if (this.tickTimeout) clearTimeout(this.tickTimeout)
    if (this.playing) {
      this.tickTimeout = setTimeout(() => this.tick(), this.tempo)
    } else {
      this.tickTimeout = null
    }
  }

  toggleEvolving(evolve?: boolean) {
    this.evolving = evolve ?? !this.evolving
    if (this.evolveTimeout) clearTimeout(this.evolveTimeout)
    if (this.evolving) {
      this.evolveTimeout = setTimeout(() => this.evolve(), this.evolveSpeed)
    } else {
      this.evolveTimeout = null
    }
  }

  clearAllPads() {
    this.instruments.forEach((instrument, i) => {
      instrument.pads.forEach((column, j) => {
        column.forEach((active, k) => {
          if (active) {
            this.togglePad(i, j, k, false)
          }
        })
      })
    })
  }

  togglePad(instrument: number, column: number, row: number, active?: boolean) {
    const curInstrument = this.instruments[instrument]
    const curColumn = curInstrument.pads[column]
    const isLimited = curInstrument.limit
    if (isLimited) {
      for (let i = 0; i < curColumn.length; i++) {
        if (i === row) continue
        if (curColumn[i]) {
          curColumn[i] = false
          this.onToggleCallbacks.forEach((callback) =>
            callback({ instrument, column, row: i, active: false }),
          )
        }
      }
    }
    curColumn[row] = active ?? !curColumn[row]
    this.onToggleCallbacks.forEach((callback) =>
      callback({ instrument, column, row, active: curColumn[row] }),
    )
    this.triggerOnChange()
  }

  randomizePads() {
    // pick one sound for each column for the strings
    const strings = this.instruments[1]
    strings.pads.forEach((_, colIdx) => {
      const rowIdx = Math.floor(Math.random() * strings.sounds)
      this.togglePad(1, colIdx, rowIdx)
    })

    const piano = this.instruments[0]
    piano.pads.forEach((rows, colIdx) => {
      rows.forEach((_, rowIdx) => {
        if (Math.random() < 0.1) {
          this.togglePad(0, colIdx, rowIdx)
        }
      })
    })
  }

  nextSoundPalette() {
    this.instruments.forEach((instrument) => {
      instrument.soundPalette = (instrument.soundPalette + 1) % instrument.palettes.length
    })
    this.triggerOnChange()
  }

  tick() {
    this.tickTimeout = setTimeout(() => this.tick(), this.tempo)
    this.currentTick++
    const columns: { instrument: number; column: number }[] = this.instruments
      .filter((instrument) => this.currentTick % instrument.duration === 0)
      .map((instrument, instIdx) => {
        const { measureLength } = instrument
        const curColumn = (this.currentTick / instrument.duration) % measureLength
        return { instrument: instIdx, column: curColumn }
      })
    columns.forEach(({ instrument, column }) => {
      const { palettes, soundPalette, pads } = this.instruments[instrument]
      const activePadsCount = pads[column].filter(Boolean).length
      pads[column].forEach((isActive, i) => {
        if (isActive) {
          palettes[soundPalette].volume(1 / Math.pow(activePadsCount, 0.2))
          palettes[soundPalette].play(String(i + 1)) // pitches are 1-indexed
        }
      })
    })
    this.triggerOnChange()
    this.onTickCallbacks.forEach((callback) => callback(columns))
  }

  evolve() {
    this.evolveTimeout = setTimeout(() => this.evolve(), this.evolveSpeed)
    this.instruments
      .filter((instr) => instr.evolve && Math.random() < 0.5)
      .forEach((instrument, i) => {
        const { measureLength, sounds, pads } = instrument

        // Collect some stats on the whole grid, and each row/column
        const totalPads = sounds * measureLength
        const activePads = getRowAndColumn(true, pads)
        const inactivePads = getRowAndColumn(false, pads)
        const percFilled = activePads.length / totalPads
        const mostFilledCol = getMostFilledCol(pads)
        const mostFilledRow = getMostFilledRow(pads)

        // string instruments should never toggle off
        const makeActive = i === 1 ? true : undefined

        if (mostFilledCol.length > 2) {
          const pad = sample(mostFilledCol)
          this.togglePad(i, pad.column, pad.row, makeActive)
        } else if (mostFilledRow.length > 2) {
          const pad = sample(mostFilledRow)
          this.togglePad(i, pad.column, pad.row, makeActive)
        } else if (percFilled > 0.38) {
          const pad = sample(activePads)
          this.togglePad(i, pad.column, pad.row, makeActive)
        } else if (percFilled < 0.29) {
          const pad = sample(inactivePads)
          this.togglePad(i, pad.column, pad.row, makeActive)
        } else {
          const pad1 = sample(activePads)
          this.togglePad(i, pad1.column, pad1.row, makeActive)
          const pad2 = sample(inactivePads)
          this.togglePad(i, pad2.column, pad2.row, makeActive)
        }

        if (Math.random() < 0.15) {
          this.nextSoundPalette()
        }
      })
  }

  loadFromHash(hash: string) {
    const activePads = getActivePadsFromHash(hash)
    activePads.forEach(({ instrument, row, column, active }) => {
      this.togglePad(instrument, column, row, active)
    })
  }

  encodeState() {
    const activePads = this.instruments.map((instrument) => instrument.pads)
    return generateHash(activePads)
  }
}

function throttle(fn: () => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timeout) return
    timeout = setTimeout(() => {
      fn()
      timeout = null
    }, wait)
  }
}
