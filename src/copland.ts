import { Howl } from 'howler'
// import { getActivePadsFromHash, generateHash } from './state-encoder'

export type InstrumentDefinition = {
  palettes: { src: string; sprite: { [key: string]: [number, number] } }[]
  sounds: number
  measureLength: number
  duration: number
  limit: boolean
  evolve: boolean
}

type Instrument = {
  palettes: Howl[]
  sounds: number
  measureLength: number
  duration: number
  limit: boolean
  evolve: boolean
  soundPalette: number
  pads: boolean[][]
}

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
  // private evolveTimeout: ReturnType<typeof setTimeout> | null = null
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
                this.togglePlaying()
              }
              this.triggerOnChange()
            },
          }),
      )
      return { palettes, sounds, measureLength, duration, limit, evolve, soundPalette, pads }
    })
  }

  triggerOnChange() {
    this.onChangeCallbacks.forEach((callback) => callback())
  }

  addOnChange(callback: () => void): () => void {
    this.onChangeCallbacks.push(callback)
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter((c) => c !== callback)
    }
  }

  togglePlaying() {
    this.playing = !this.playing
    if (this.playing) {
      this.tickTimeout = setTimeout(() => this.tick(), this.tempo)
    } else {
      if (this.tickTimeout) {
        clearTimeout(this.tickTimeout)
        this.tickTimeout = null
      }
    }
  }

  // TODO: IMPLEMENT EVOLVE LOOP
  // toggleEvolving() {
  //   this.evolving = !this.evolving
  //   if (this.evolving) {
  //     this.evolveTimeout = setTimeout(() => this.evolve(), this.evolveSpeed)
  //   } else {
  //     if (this.evolveTimeout) {
  //       clearTimeout(this.evolveTimeout)
  //       this.evolveTimeout = null
  //     }
  //   }
  // }

  clearAllPads() {
    this.instruments.forEach((instrument) => {
      instrument.pads.forEach((column) => column.fill(false))
    })
    this.triggerOnChange()
  }

  togglePad(instrument: number, column: number, row: number) {
    const curInstrument = this.instruments[instrument]
    const curColumn = curInstrument.pads[column]
    const isLimited = curInstrument.limit
    if (isLimited) {
      for (let i = 0; i < curColumn.length; i++) {
        curColumn[i] = false
      }
    }
    curColumn[row] = !curColumn[row]
    this.triggerOnChange()
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
    this.instruments
      .filter((instrument) => this.currentTick % instrument.duration === 0)
      .forEach((instrument) => {
        const { palettes, soundPalette, pads, measureLength } = instrument
        const curColumn = (this.currentTick / instrument.duration) % measureLength
        pads[curColumn].forEach((isActive, i) => {
          if (isActive) {
            palettes[soundPalette].play(String(i + 1)) // pitches are 1-indexed
          }
        })
      })
    this.triggerOnChange()
  }

  // loadFromHash(hash: string) {
  //   const activePads = getActivePadsFromHash(hash)
  //   activePads.forEach(({ instrument, row, column }) => {
  //     this.togglePad(instrument, column, row)
  //   })
  // }

  // encodeState() {
  //   const activePads = this.instruments.map((instrument) => instrument.pads)
  //   return generateHash(activePads)
  // }
}
