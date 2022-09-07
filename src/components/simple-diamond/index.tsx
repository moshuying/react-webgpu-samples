import { Fragment, useEffect, useRef, useState } from "react"
import useWebGPU from "@/hooks/useWebGPU"
import { mat4, vec3 } from 'gl-matrix'

import vert from '@/shaders/simple-diamond/vert.wgsl'
import frag from '@/shaders/simple-diamond/frag.wgsl'
import DiamondGeometry from "../../geometrys/diamond-geometry"
import { getRandomColor } from "@/utils/randomColor"

import DatGui, { DatFolder, DatNumber } from 'react-dat-gui'

interface GuiData {
    width: number
    height: number
    facets: number
    scale: number
    rotateX: number
    rotateY: number
    rotateZ: number
}

const guiDataInit: GuiData = {
    width: 1,
    height: 1,
    facets: 3,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0
}

const SimpleDiamond = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const { adapter, device, canvas, context, format } = useWebGPU(canvasRef.current)
    const [guiData, setGuiData] = useState<GuiData>(guiDataInit)

    useEffect(() => {
        if (!canvas || !context || !adapter || !device) return

        const canvsConfig: GPUCanvasConfiguration = {
            device,
            format,
            alphaMode: 'opaque'
        }
        context.configure(canvsConfig)

        const diamondGeometry = new DiamondGeometry(guiData.width, guiData.height, guiData.facets)
        const vertexArray = diamondGeometry.vertices
        const vertexBuffer = device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })
        device.queue.writeBuffer(vertexBuffer, 0, vertexArray)

        const colorArr = getRandomColor(vertexArray.length / 3)
        const colorBuffer = device.createBuffer({
            size: colorArr.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })
        device.queue.writeBuffer(colorBuffer, 0, colorArr)

        //创建模型矩阵
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0.0, 0.0, -2.0))
        mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(guiData.scale, guiData.scale, guiData.scale))
        mat4.rotateX(modelMatrix, modelMatrix, Math.PI * guiData.rotateX / 180)
        mat4.rotateY(modelMatrix, modelMatrix, Math.PI * guiData.rotateY / 180)
        mat4.rotateZ(modelMatrix, modelMatrix, Math.PI * guiData.rotateZ / 180)

        //创建视图矩阵
        const viewMatrix = mat4.create()
        //mat4.lookAt(viewMatrix, vec3.fromValues(0.0, 0.0, 1.0), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0))

        //创建投影矩阵
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100)

        //创建 MVP 矩阵
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        const matrixBuffer = device.createBuffer({
            size: mvpMatrix.length * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(matrixBuffer, 0, mvpMatrix as Float32Array)

        const depthTexture = device.createTexture({
            size: {
                width: canvas.width,
                height: canvas.height
            },
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        })

        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({
                    code: vert
                }),
                entryPoint: 'main',
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3'
                            }
                        ]
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                shaderLocation: 1,
                                offset: 0,
                                format: 'float32x3'
                            }
                        ]
                    }
                ]
            },
            fragment: {
                module: device.createShaderModule({
                    code: frag
                }),
                entryPoint: 'main',
                targets: [{ format }]
            },
            primitive: {
                topology: 'triangle-strip'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        })

        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: matrixBuffer
                    }
                }
            ]
        })

        const draw = () => {

            const commandEncoder = device.createCommandEncoder()
            const textureView = context.getCurrentTexture().createView()
            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }],
                depthStencilAttachment: {
                    view: depthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store'
                }
            }
            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
            passEncoder.setPipeline(pipeline)
            passEncoder.setVertexBuffer(0, vertexBuffer)
            passEncoder.setVertexBuffer(1, colorBuffer)
            passEncoder.setBindGroup(0, bindGroup)
            passEncoder.draw(vertexArray.length / 3)
            passEncoder.end()

            device.queue.submit([commandEncoder.finish()])
        }
        draw()

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== canvas) continue

                canvas.width = entry.devicePixelContentBoxSize[0].inlineSize
                canvas.height = entry.devicePixelContentBoxSize[0].blockSize
            }
            draw()
        })
        resizeObserver.observe(canvas)

        return () => {
            resizeObserver.disconnect()
        }

    }, [canvas, context, format, adapter, device, guiData])

    return (
        <Fragment>
            <canvas ref={canvasRef} width={document.body.clientWidth} height={document.body.clientHeight} tabIndex={0} />
            <DatGui data={guiData} onUpdate={(newData) => setGuiData(newData)}>
                <DatFolder title="diamond" closed={false}>
                    <DatNumber path='width' label='width' min={0.1} max={2} step={0.1} />
                    <DatNumber path='height' label='height' min={0.1} max={2} step={0.1} />
                    <DatNumber path='facets' label='facets' min={3} max={9} step={1} />
                </DatFolder>
                <DatFolder title="transform" closed={false}>
                    <DatNumber path='scale' label='scale' min={0.1} max={2} step={0.1} />
                    <DatNumber path='rotateX' label='rotateX' min={0} max={360} step={1} />
                    <DatNumber path='rotateY' label='rotateY' min={0} max={360} step={1} />
                    <DatNumber path='rotateZ' label='rotateZ' min={0} max={360} step={1} />
                </DatFolder>
            </DatGui>
        </Fragment>
    )
}

export default SimpleDiamond