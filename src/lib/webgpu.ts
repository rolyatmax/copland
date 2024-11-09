export function createGPUBuffer(
  device: GPUDevice,
  data: ArrayBuffer & { buffer?: never }, // make sure this is NOT a TypedArray
  usageFlag: GPUBufferUsageFlags,
  byteOffset = 0,
  byteLength = data.byteLength,
) {
  const buffer = device.createBuffer({
    size: byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  })
  new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data, byteOffset, byteLength))
  buffer.unmap()
  return buffer
}

export async function checkWebGPU() {
  function showError() {
    document.body.innerHTML = `
    <div style="font-size: 1.5em; margin: 100px auto; max-width: 800px; text-align: center;">
      This demo requires WebGPU.
    </div>
    `
  }

  if (!window.navigator.gpu) {
    showError()
    throw new Error('WebGPU not supported')
  }

  const adapter = await window.navigator.gpu.requestAdapter()
  if (!adapter) {
    showError()
    throw new Error('WebGPU: Failed to call requestAdapter()')
  }

  const device = await adapter.requestDevice()
  if (!device) {
    showError()
    throw new Error('WebGPU: Failed to call requestDevice()')
  }
}

export async function setupWebGPU(canvas?: HTMLCanvasElement) {
  await checkWebGPU()

  const adapter = await window.navigator.gpu.requestAdapter()
  const device = await adapter!.requestDevice()

  if (!canvas) {
    canvas = document.body.appendChild(document.createElement('canvas'))
  }
  window.addEventListener(
    'resize',
    fit(canvas, canvas.parentElement!, window.devicePixelRatio),
    false,
  )

  const context = canvas.getContext('webgpu')
  if (!context) throw new Error('Failed to getContext("webgpu")')

  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'opaque',
  })

  return { device, context }
}

export function fit(canvas: HTMLCanvasElement, parent: HTMLElement, scale = 1) {
  const p = parent

  canvas.style.position = canvas.style.position || 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  return resize()

  function resize() {
    let width = window.innerWidth
    let height = window.innerHeight
    if (p && p !== document.body) {
      const bounds = p.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
    }
    canvas.width = width * scale
    canvas.height = height * scale
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    return resize
  }
}
