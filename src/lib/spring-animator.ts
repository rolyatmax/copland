import vec4 from 'gl-vec4'

type Vec4 = [number, number, number, number]

export function createSpring<T extends number | number[]>(
  stiffness: number,
  dampening: number,
  value: T,
  precision: number,
) {
  precision = precision ? precision * precision : Number.EPSILON
  const isInputArray = Array.isArray(value)
  const vecComponents = isInputArray ? value.length : Number.isFinite(value) ? 1 : null

  if (!Number.isFinite(stiffness) || !Number.isFinite(dampening)) {
    throw new Error(
      `spring-animator: expected numbers for stiffness and dampening. (e.g. createSpring(0.003, 0.1, startingValue))`,
    )
  }

  if (!vecComponents || vecComponents > 4) {
    throw new Error(
      `spring-animator: expected value \`${value}\` to be a scalar, vec2, vec3, or vec4`,
    )
  }

  function makeValueVec4(out: [number, number, number, number] = [0, 0, 0, 0], v: T) {
    if (isInputArray !== Array.isArray(v) || (Array.isArray(v) && vecComponents !== v.length)) {
      throw new Error(
        `spring-animator: destination value type must match initial value type: ${!isInputArray ? 'scalar' : vecComponents + '-component vector'}`,
      )
    }

    if (typeof v === 'number') {
      out[0] = v
      out[1] = out[2] = out[3] = 0
      return out
    }

    let i = 0
    while (i < 4) {
      out[i] = i < v.length ? v[i] : 0
      i += 1
    }
    return out
  }

  const vec4Value = makeValueVec4([0, 0, 0, 0], value)
  const lastValue: Vec4 = vec4.copy([], vec4Value) as Vec4
  const destinationValue: Vec4 = vec4.copy([], vec4Value) as Vec4

  // set up some reusable arrays to use in tick()
  let nextValue = []
  let velocity = []
  let delta = []
  let spring = []
  let damper = []
  let acceleration = []

  return {
    setDestination,
    setVelocity,
    getCurrentValue,
    isAtDestination,
    tick,
  }

  function setDestination(newValue, shouldAnimate = true) {
    makeValueVec4(destinationValue, newValue)
    if (!shouldAnimate) {
      vec4.copy(vec4Value, destinationValue)
      vec4.copy(lastValue, destinationValue)
    }
  }

  function setVelocity(velocity: T) {
    const v = makeValueVec4([0, 0, 0, 0], velocity)
    vec4.subtract(lastValue, vec4Value, v)
  }

  function isAtDestination(threshold?: number) {
    // square this so we don't need to use Math.sqrt
    threshold = threshold ? threshold * threshold : precision
    return (
      vec4.squaredDistance(vec4Value, destinationValue) <= threshold &&
      vec4.squaredDistance(vec4Value, lastValue) <= threshold
    )
  }

  function getCurrentValue(out?: T): T {
    if (!isInputArray) return vec4Value[0] as T
    out = (out || []) as T
    for (let i = 0; i < vecComponents!; i++) {
      out[i] = vec4Value[i]
    }
    return out
  }

  // returns true if the spring has reached its destination
  function tick(s = stiffness, d = dampening): boolean {
    vec4.subtract(velocity, vec4Value, lastValue)
    vec4.subtract(delta, destinationValue, vec4Value)
    vec4.scale(spring, delta, s)
    vec4.scale(damper, velocity, -d)
    vec4.add(acceleration, spring, damper)
    vec4.add(velocity, velocity, acceleration)
    vec4.add(nextValue, velocity, vec4Value)
    vec4.copy(lastValue, vec4Value)
    vec4.copy(vec4Value, nextValue)
    const atDestination = isAtDestination()
    if (atDestination) {
      vec4.copy(vec4Value, destinationValue)
      vec4.copy(lastValue, destinationValue)
    }
    return atDestination
  }
}
