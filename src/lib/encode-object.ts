import hashObject from 'object-hash'
import { toBase62, fromBase62, toBase2, fromBase2 } from 'bases'

export interface EncoderConfig {
  [key: string]: [number, number, number] // [min, max, step] (min and max are inclusive)
}

export interface Encoder {
  encodeObject: (obj: Record<string, any>) => string
  decodeObject: (encodedString: string) => Record<string, any>
}

const ALGO_VERSION = 2
const VERSION_LENGTH = 2
const alphabetize = (a: string, b: string) => (a < b ? -1 : 1)

const base2ChunkSize = Math.log2(Number.MAX_SAFE_INTEGER)
const base62ChunkSize = Math.ceil(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(62))

function validateConfig(config: EncoderConfig) {
  Object.keys(config).forEach((key) => {
    const [min, max, step] = config[key]
    if (min > max) throw new RangeError(`min is greater than max for field: "${key}"`)
    if ((max - min) % step !== 0) {
      throw new RangeError(
        `the range between min and max must be divisible by step ${step} for field: ${key}`,
      )
    }
  })
}

export default function createEncoder(config: EncoderConfig): Encoder {
  if (!config) throw new Error('config required')

  const configKeys = Object.keys(config)
  configKeys.sort(alphabetize)

  let totalBitsNeeded = 0

  configKeys.forEach((key) => {
    const [min, max, step = 1] = config[key]
    if (step === 0) throw new RangeError(`step cannot be 0 for field: ${key}`)
    const bitsNeeded = getBitsNeeded(min, max, step)
    totalBitsNeeded += bitsNeeded
  })

  const base2HashLength = Math.ceil(totalBitsNeeded / base2ChunkSize) * base2ChunkSize
  const base62HashLength = (base2HashLength / base2ChunkSize) * base62ChunkSize

  validateConfig(config)

  const configVersion = hashObject({
    ...config,
    __ALGORITHM_VERSION__: ALGO_VERSION,
  }).slice(0, VERSION_LENGTH)

  function validateObject(obj: Record<string, number>) {
    const objKeys = Object.keys(obj)
    const missingConfigKeys = objKeys.filter((key) => !configKeys.includes(key))
    const missingObjKeys = configKeys.filter((key) => !objKeys.includes(key))
    if (missingConfigKeys.length) {
      throw new Error(`config is missing fields: ${missingConfigKeys.join(', ')}`)
    }
    if (missingObjKeys.length) {
      throw new Error(`object is missing config fields: ${missingObjKeys.join(', ')}`)
    }

    configKeys.forEach((key) => {
      const [min, max, step] = config[key]
      const val = obj[key]

      if (!Number.isFinite(val)) {
        throw new TypeError('all object values must be numbers')
      }

      if (val > max) {
        throw new RangeError(`value ${val} is greater than ${max} for field "${key}"`)
      }

      if (val < min) {
        throw new RangeError(`value ${val} is less than ${min} for field "${key}"`)
      }

      if ((val - min) % step !== 0) {
        throw new RangeError(
          `value ${val} cannot be reached from minimum ${min} by step ${step} for field "${key}"`,
        )
      }
    })
  }

  function validateHash(hash: string) {
    const version = hash.slice(0, VERSION_LENGTH)
    if (version !== configVersion) {
      throw new Error('hash was encoded with different config version')
    }
  }

  function encodeObject(obj: Record<string, number>): string {
    validateObject(obj)
    let bits = configKeys
      .map((key) => {
        const [min, max, step] = config[key]
        const bitsNeeded = getBitsNeeded(min, max, step)
        const val = obj[key]
        // NOTE: rounding here because of floating point errors?
        const valInBase2 = toBase2(Math.round((val - min) / step))
        return valInBase2.padStart(bitsNeeded, '0')
      })
      .join('')
    bits = bits.padStart(base2HashLength, '0')
    let hash = ''
    while (bits.length) {
      let chunk = toBase62(fromBase2(bits.slice(0, base2ChunkSize)))
      bits = bits.slice(base2ChunkSize)
      hash += chunk.padStart(base62ChunkSize, '0')
    }
    while (hash[0] === '0') {
      hash = hash.slice(1)
    }
    return configVersion + hash
  }

  function decodeObject(hash: string): Record<string, number> {
    const obj = {}
    validateHash(hash)
    hash = hash.slice(VERSION_LENGTH)
    hash = hash.padStart(base62HashLength, '0')
    let bits = ''
    while (hash.length) {
      let chunk = toBase2(fromBase62(hash.slice(0, base62ChunkSize)))
      hash = hash.slice(base62ChunkSize)
      bits += chunk.padStart(base2ChunkSize, '0')
    }
    const extraBits = bits.length - totalBitsNeeded
    bits = extraBits ? bits.slice(extraBits) : bits.padStart(totalBitsNeeded, '0')
    configKeys.forEach((key) => {
      const [min, max, step] = config[key]
      const bitsNeeded = getBitsNeeded(min, max, step)
      const bit = bits.slice(0, bitsNeeded)
      const val = fromBase2(bit)
      obj[key] = val * step + min
      bits = bits.slice(bitsNeeded)
    })
    return obj
  }

  return { decodeObject, encodeObject }
}

function getBitsNeeded(min: number, max: number, step: number): number {
  const steps = (max - min) / step + 1 // plus one because range is inclusive
  const bitsNeeded = Math.max(1, Math.ceil(Math.log2(steps))) // requires at least 1 bit
  return bitsNeeded
}
