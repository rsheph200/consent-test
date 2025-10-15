"use client"

import { useEffect, useRef } from "react"
import * as twgl from "twgl.js"

export default function GradientEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  let animationFrameId: number
  let gl: WebGLRenderingContext | null = null
  let programInfo: any = null
  let bufferInfo: any = null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    gl = canvas.getContext("webgl2", { alpha: true }) || canvas.getContext("webgl", { alpha: true })
    if (!gl) {
      console.error("WebGL not supported")
      return
    }

    const vertexShader = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `

    const fragmentShader = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      
      void main() {
        vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
        float dist = length(st);
        
        // PULSE SPEED: Change the multiplier after u_time (currently 2.0)
        // Higher = faster, Lower = slower
        float pulse1 = sin(u_time * 1.0) * 0.5 + 0.5;
        float pulse2 = sin(u_time * 1.0 + 1.0) * 0.5 + 0.5;
        float pulse3 = sin(u_time * 1.0 + 2.0) * 0.5 + 0.5;
        
        // EDGE BLUR: Change the second parameter (currently 0.02)
        // Higher = softer edges, Lower = sharper edges
        // MOVEMENT AMOUNT: Change the multiplier after pulse (0.2, 0.15, 0.1)
        // Higher = more movement, Lower = less movement
        float circle1 = smoothstep(0.3 + pulse1 * 0.2, 0.3 + pulse1 * 0.2 - 0.45, dist);
        float circle2 = smoothstep(0.5 + pulse2 * 0.15, 0.5 + pulse2 * 0.15 - 0.45, dist);
        float circle3 = smoothstep(0.7 + pulse3 * 0.1, 0.7 + pulse3 * 0.1 - 0.45, dist);
        
        // COLORS: Change the RGB values (0.0 to 1.0)
        // Circle 1: Lime Green (#CDFC60)
        // Circle 2: Pink (#EFA6EA)
        // Circle 3: Golden Yellow (#FFD767)
        vec3 color1 = vec3(0.804, 0.988, 0.376) * circle1;
        vec3 color2 = vec3(0.17, 0.651, 0.918) * circle2;
        vec3 color3 = vec3(1.0, 0.843, 0.404) * circle3;
        
        vec3 finalColor = color1 + color2 * 0.5 + color3 * 0.4;
        
        // GLOW SPREAD: Change the multiplier after dist (currently 1.5)
        // Higher = tighter glow, Lower = wider glow
        // GLOW INTENSITY: Change the multiplier (currently 0.4)
        // Higher = brighter glow, Lower = dimmer glow
        float glow = exp(-dist * 1.5) * 0.4;
        finalColor += vec3(glow);
        
        float alpha = clamp(circle1 + circle2 * 0.5 + circle3 * 0.4 + glow, 0.0, 1.0);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `

    programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader])

    const arrays = {
      position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
      },
    }
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

    const resize = () => {
      twgl.resizeCanvasToDisplaySize(canvas)
      if (gl) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      }
    }
    resize()
    window.addEventListener("resize", resize)

    const render = (time: number) => {
      if (!gl || !programInfo || !bufferInfo) return

      time *= 0.001

      gl.clearColor(1, 1, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is WebGL API, not a React hook
      gl.useProgram(programInfo.program)
      twgl.setUniforms(programInfo, {
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_time: time,
      })

      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
      twgl.drawBufferInfo(gl, bufferInfo)

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
