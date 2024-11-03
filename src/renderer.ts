import type { Instrument } from './copland'
import * as random from 'canvas-sketch-util/random'
import { setupWebGPU, createGPUBuffer } from './lib/webgpu'
import { COLORS, WHITE } from './constants'
import { createSpring } from './lib/spring-animator'
import Copland from './copland'

const settings = {
  seed: 1,
  cellSize: 90,
  cellSpacing: 100,
  squircleK: 2.9,
  marginTop: 200,
  springStiffness: 0.01,
  springDampening: 0.13,
  springPrecision: 0.0001,
  colorFade: 0.75,
}

type CellRenderState = {
  size: ReturnType<typeof createSpring<[number, number]>>
  color: ReturnType<typeof createSpring<[number, number, number]>>
  opacity: ReturnType<typeof createSpring<number>>
  position: ReturnType<typeof createSpring<[number, number]>>
}

export async function createRenderer(canvas: HTMLCanvasElement, copland: Copland) {
  const instruments = copland.instruments
  const { device, context } = await setupWebGPU(canvas)

  let mouseXY: [number, number] | null = null
  let hoveredCell: { instrumentIdx: number; measureIdx: number; soundIdx: number } | null = null

  const canvasRect = canvas.getBoundingClientRect()
  canvas.addEventListener('mousemove', (e) => {
    const canvasX = (e.clientX - canvasRect.left) * window.devicePixelRatio
    const canvasY = (e.clientY - canvasRect.top) * window.devicePixelRatio
    mouseXY = [canvasX, canvas.height - canvasY]
    hoveredCell = getCellFromMousePosition(mouseXY[0], mouseXY[1])
    if (hoveredCell) {
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'default'
    }
  })

  canvas.addEventListener('mouseleave', () => {
    mouseXY = null
    hoveredCell = null
  })

  canvas.addEventListener('click', () => {
    if (!mouseXY || !hoveredCell) return
    copland.togglePad(hoveredCell.instrumentIdx, hoveredCell.measureIdx, hoveredCell.soundIdx)
  })

  // Map of `{instIdx}-{measureIdx}-{soundIdx}` to cell render state
  const cellRenderStateMap = new Map<string, CellRenderState>()

  for (let instIdx = 0; instIdx < instruments.length; instIdx++) {
    const instrument = instruments[instIdx]
    for (let measureIdx = 0; measureIdx < instrument.measureLength; measureIdx++) {
      for (let soundIdx = 0; soundIdx < instrument.sounds; soundIdx++) {
        cellRenderStateMap.set(`${instIdx}-${measureIdx}-${soundIdx}`, {
          size: createSpring<[number, number]>(
            settings.springStiffness,
            settings.springDampening,
            [0, 0],
            settings.springPrecision,
          ),
          color: createSpring<[number, number, number]>(
            settings.springStiffness,
            settings.springDampening,
            WHITE,
            settings.springPrecision,
          ),
          opacity: createSpring<number>(
            settings.springStiffness,
            settings.springDampening,
            0,
            settings.springPrecision,
          ),
          position: createSpring(
            settings.springStiffness,
            settings.springDampening,
            [Math.random() * canvas.width, Math.random() * canvas.height],
            settings.springPrecision,
          ),
        })
      }
    }
  }

  copland.addOnToggle(({ instrument, column, row, active }) => {
    const key = `${instrument}-${column}-${row}`
    const renderState = cellRenderStateMap.get(key)!
    renderState.color.setDestination(active ? COLORS[instruments[instrument].soundPalette] : WHITE)
    renderState.opacity.setDestination(active ? 1 : 0)
    renderState.size.setDestination(active ? [1.0, 1.0] : [0.0, 0.0])
  })

  copland.addOnTick((columns: { instrument: number; column: number }[]) => {
    columns.forEach(({ instrument, column }) => {
      const ins = instruments[instrument]
      for (let soundIdx = 0; soundIdx < ins.sounds; soundIdx++) {
        const isActive = ins.pads[column][soundIdx]
        const key = `${instrument}-${column}-${soundIdx}`
        const renderState = cellRenderStateMap.get(key)!
        if (!isActive) {
          renderState.color.setDestination(WHITE)
          renderState.size.setDestination([0, 0])
          continue
        }
        const color = COLORS[ins.soundPalette]
        renderState.opacity.setVelocity(0.1)
        renderState.color.setDestination(color)
        renderState.size.setVelocity([-0.02, -0.02])
      }
    })
  })

  const verticesData = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1])
  const verticesBuffer = createGPUBuffer(device, verticesData.buffer, GPUBufferUsage.VERTEX)

  const shader = `
  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) rand: vec4f,
    @location(2) size: vec2f,
    @location(3) uv: vec2f
  };

  struct Cell {
    color: vec4f,
    rand: vec4f,
    size: vec2f,
    position: vec2f
  };

  struct Uniforms {
    dimensions: vec2f,
    cellSize: f32,
    squircleK: f32,
  };

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;
  @group(0) @binding(1) var<storage, read> cells: array<Cell>;

  @vertex
  fn mainVertex(
    @location(0) position: vec2f,
    @builtin(instance_index) instanceIdx: u32
  ) -> VertexOutput {
    let p = cells[instanceIdx].position / uniforms.dimensions * 2.0 - 1.0;
    let normalizedCellSize = uniforms.cellSize / uniforms.dimensions;

    var output: VertexOutput;
    output.position = vec4f(p + position * normalizedCellSize, 0, 1);
    output.color = cells[instanceIdx].color;
    output.rand = cells[instanceIdx].rand;
    output.size = cells[instanceIdx].size;
    output.uv = position;
    return output;
  }

  fn squircle(p: vec2f, k: f32) -> f32 {
    let q = abs(p) / 1.0;
    return pow(pow(q.x, k) + pow(q.y, k), 1.0 / k);
  }

  @fragment
  fn mainFragment(
    @location(0) color: vec4f,
    @location(1) rand: vec4f,
    @location(2) size: vec2f,
    @location(3) uv: vec2f
  ) -> @location(0) vec4f {
    let mainColor = vec4f(color.rgb, color.a * (0.75 + 0.25 * rand.y));

    // Define outline parameters
    let outlineWidth = 0.03;
    let outlineStart = 1.0 - outlineWidth;
    let outlineColor = vec4f(0.1, 0.1, 0.1, 0.45 + rand.x * 0.25);

    let squircleK = uniforms.squircleK; // - size.x * 0.5;

    // Calculate the main shape weight
    let mainT = squircle(uv / size.x, squircleK);
    let mainWeight = smoothstep(1.0 - 0.05, 1.0, mainT);

    // Calculate the outline weight - no longer multiplied by size.x
    let outlineT = squircle(uv, squircleK);
    let outlineWeight = smoothstep(outlineStart - 0.02, outlineStart, outlineT) *
                      (1.0 - smoothstep(outlineStart, outlineStart + 0.02, outlineT));

    // Combine main shape and outline
    let mainShape = mix(vec4f(1.0, 1.0, 1.0, 0.0), mainColor, (1.0 - mainWeight) * size.x);
    // The outline is now always visible, only the main shape is affected by size
    return mix(mainShape, outlineColor, outlineWeight);
  }`

  const instrumentWidths = instruments.map(
    (instrument) => settings.cellSize + (instrument.measureLength - 1) * settings.cellSpacing,
  )
  const instrumentSpacing = settings.cellSpacing * 2
  const totalWidth =
    instrumentWidths.reduce((acc, width) => acc + width, 0) +
    instrumentSpacing * (instruments.length - 1)

  const totalHeight = instruments.reduce(
    (acc, instrument) =>
      Math.max(acc, settings.cellSize + (instrument.sounds - 1) * settings.cellSpacing),
    0,
  )
  const boardOffsetX = (context.canvas.width - totalWidth) / 2
  const boardOffsetY = settings.marginTop

  const instrumentExtents = instrumentWidths.map((instrumentWidth, idx) => {
    const instrument = instruments[idx]
    const instrumentHeight = settings.cellSize + (instrument.sounds - 1) * settings.cellSpacing
    const instrumentOffsetX = instrumentWidths.slice(0, idx).reduce((acc, width) => acc + width, 0)
    const gridOffsetX = instrumentOffsetX + boardOffsetX + instrumentSpacing * idx
    const gridOffsetY = (totalHeight - instrumentHeight) / 2 + boardOffsetY
    return [gridOffsetX, gridOffsetY, gridOffsetX + instrumentWidth, gridOffsetY + instrumentHeight]
  })

  function getCellPosition(i: number, j: number, instrumentIdx: number): [number, number] {
    const instrumentExtent = instrumentExtents[instrumentIdx]
    const gridOffsetX = instrumentExtent[0]
    const gridOffsetY = instrumentExtent[1]
    return [
      i * settings.cellSpacing + settings.cellSize / 2 + gridOffsetX,
      j * settings.cellSpacing + settings.cellSize / 2 + gridOffsetY,
    ]
  }

  function getCellFromMousePosition(
    x: number,
    y: number,
  ): { instrumentIdx: number; measureIdx: number; soundIdx: number } | null {
    for (let instrumentIdx = 0; instrumentIdx < instruments.length; instrumentIdx++) {
      const instrumentExtent = instrumentExtents[instrumentIdx]
      if (
        x >= instrumentExtent[0] &&
        x <= instrumentExtent[2] &&
        y >= instrumentExtent[1] &&
        y <= instrumentExtent[3]
      ) {
        const soundIdx = Math.floor((y - instrumentExtent[1]) / settings.cellSpacing)
        const measureIdx = Math.floor((x - instrumentExtent[0]) / settings.cellSpacing)
        return { instrumentIdx, measureIdx, soundIdx }
      }
    }
    return null
  }

  const cellComponentCount = 12
  const cellCount = instruments.reduce(
    (acc, instrument) => acc + instrument.sounds * instrument.measureLength,
    0,
  )
  const cellData = new Float32Array(cellCount * cellComponentCount)

  // Returns true if all cells are at their destination and not animating
  function updateCellData(instruments: Instrument[]): boolean {
    let isAtDestination = true
    let i = 0
    let n = 0
    for (let instIdx = 0; instIdx < instruments.length; instIdx++) {
      const instrument = instruments[instIdx]
      for (let measureIdx = 0; measureIdx < instrument.measureLength; measureIdx++) {
        for (let soundIdx = 0; soundIdx < instrument.sounds; soundIdx++) {
          const isActive = instrument.pads[measureIdx][soundIdx]
          const isHovered =
            hoveredCell?.instrumentIdx === instIdx &&
            hoveredCell?.measureIdx === measureIdx &&
            hoveredCell?.soundIdx === soundIdx
          const renderState = cellRenderStateMap.get(`${instIdx}-${measureIdx}-${soundIdx}`)!

          renderState.position.setDestination(getCellPosition(measureIdx, soundIdx, instIdx))
          const color = COLORS[instrument.soundPalette]
          if (isHovered) {
            renderState.color.setDestination(color)
            renderState.opacity.setDestination(isActive ? 0.65 : 0.3)
            renderState.size.setDestination(isActive ? [0.9, 0.9] : [0.65, 0.65])
          } else {
            if (!isActive) {
              renderState.color.setDestination(WHITE)
            }
            renderState.opacity.setDestination(isActive ? settings.colorFade : 0)
            renderState.size.setDestination(isActive ? [1, 1] : [0, 0])
          }

          const sizeAtDestination = renderState.size.tick()
          const colorAtDestination = renderState.color.tick()
          const positionAtDestination = renderState.position.tick()
          const opacityAtDestination = renderState.opacity.tick()

          isAtDestination =
            isAtDestination &&
            sizeAtDestination &&
            colorAtDestination &&
            positionAtDestination &&
            opacityAtDestination

          const rand = random.createRandom(settings.seed + i)
          // cell color
          const c = renderState.color.getCurrentValue()
          const alpha = renderState.opacity.getCurrentValue()
          cellData[n++] = c[0] / 255
          cellData[n++] = c[1] / 255
          cellData[n++] = c[2] / 255
          cellData[n++] = alpha

          // cell random values
          cellData[n++] = rand.value()
          cellData[n++] = rand.value()
          cellData[n++] = rand.value()
          cellData[n++] = rand.value()

          // cell size
          const size = renderState.size.getCurrentValue()
          cellData[n++] = size[0]
          cellData[n++] = size[1]

          // cell position
          const position = renderState.position.getCurrentValue()
          cellData[n++] = position[0]
          cellData[n++] = position[1]

          i++
        }
      }
    }
    return isAtDestination
  }

  updateCellData(instruments)

  const cellBuffer = createGPUBuffer(
    device,
    cellData.buffer,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  )

  const uniformsData = new Float32Array([
    context.canvas.width,
    context.canvas.height,
    settings.cellSize,
    settings.squircleK,
  ])
  const uniformsBuffer = createGPUBuffer(
    device,
    uniformsData.buffer,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  )
  const uniformsGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' as const },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: 'read-only-storage' as const },
      },
    ],
  })

  const bindGroup = device.createBindGroup({
    layout: uniformsGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformsBuffer } },
      { binding: 1, resource: { buffer: cellBuffer } },
    ],
  })

  const shaderModule = device.createShaderModule({ code: shader })
  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [uniformsGroupLayout],
    }),
    vertex: {
      module: shaderModule,
      entryPoint: 'mainVertex',
      buffers: [
        {
          arrayStride: 8,
          stepMode: 'vertex' as const,
          attributes: [
            {
              shaderLocation: 0,
              format: 'float32x2' as const,
              offset: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'mainFragment',
      targets: [
        {
          format: 'bgra8unorm' as const,
          blend: {
            color: {
              srcFactor: 'src-alpha' as const,
              dstFactor: 'one-minus-src-alpha' as const,
              operation: 'add' as const,
            },
            alpha: {
              srcFactor: 'src-alpha' as const,
              dstFactor: 'one-minus-src-alpha' as const,
              operation: 'add' as const,
            },
          },
        },
      ],
    },
    primitive: {
      topology: 'triangle-strip',
    },
  })

  function render(instruments: Instrument[]) {
    const isAtDestination = updateCellData(instruments)
    if (isAtDestination) return
    device.queue.writeBuffer(cellBuffer, 0, cellData)

    // update uniforms
    uniformsData[0] = context.canvas.width
    uniformsData[1] = context.canvas.height
    uniformsData[2] = settings.cellSize
    uniformsData[3] = settings.squircleK
    device.queue.writeBuffer(uniformsBuffer, 0, uniformsData)

    const curTexture = context.getCurrentTexture()

    const commandEncoder = device.createCommandEncoder()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: curTexture.createView(),
          clearValue: { r: 1, g: 1, b: 1, a: 1 },
          loadOp: 'clear' as const,
          storeOp: 'store' as const,
        },
      ],
    })
    renderPass.setPipeline(pipeline)
    renderPass.setBindGroup(0, bindGroup)
    renderPass.setVertexBuffer(0, verticesBuffer)
    renderPass.draw(4, cellCount)
    renderPass.end()

    device.queue.submit([commandEncoder.finish()])
  }

  function start() {
    requestAnimationFrame(function loop() {
      render(instruments)
      requestAnimationFrame(loop)
    })
  }

  return { start }
}
