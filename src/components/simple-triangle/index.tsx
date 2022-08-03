import { useEffect, useRef } from "react"
import useWebGPU from "@/hooks/useWebGPU"

import vert from '@/shaders/simple-triangle/vert.wgsl'
import frag from '@/shaders/simple-triangle/frag.wgsl'

const SimpleTriangle = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const { adapter, device, canvas, context, format } = useWebGPU(canvasRef.current)

    useEffect(() => {
        if (!canvas || !context || !adapter || !device) return

        const canvsConfig: GPUCanvasConfiguration = {
            device,
            format,
            size: [canvas.clientWidth, canvas.clientHeight],
            compositingAlphaMode: 'opaque'
        }
        context.configure(canvsConfig)


        const pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({
                    code: vert
                }),
                entryPoint: 'main'
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
            }
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
                }]
            }
            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
            passEncoder.setPipeline(pipeline)
            passEncoder.draw(3, 1, 0, 0)
            passEncoder.end()

            device.queue.submit([commandEncoder.finish()])
        }
        draw()

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== canvas) continue
                canvsConfig.size = [canvas.clientWidth, canvas.clientHeight]
                context.configure(canvsConfig)
            }
            draw()
        })
        resizeObserver.observe(canvas)

        return () =>{
            resizeObserver.disconnect()
        }

        // const handleResize = () => {
        //     canvsConfig.size = [canvas.clientWidth, canvas.clientHeight]
        //     context.configure(canvsConfig)

        //     draw()
        // }
        // window.addEventListener('resize', handleResize)

        // return () => {
        //     window.removeEventListener('resize', handleResize)
        // }

    }, [canvas, context, format, adapter, device])

    return (
        <canvas ref={canvasRef} width={document.body.clientWidth} height={document.body.clientHeight} tabIndex={0} />
    )
}

export default SimpleTriangle
