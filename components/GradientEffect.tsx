"use client"

import { useEffect, useRef } from "react"
import * as twgl from "twgl.js"

export default function GradientEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const animationFrameIdRef = useRef<number>()
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programInfoRef = useRef<twgl.ProgramInfo | null>(null)
  const bufferInfoRef = useRef<twgl.BufferInfo | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    glRef.current = canvas.getContext("webgl2", { alpha: true }) || canvas.getContext("webgl", { alpha: true })
    if (!glRef.current) {
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

    programInfoRef.current = twgl.createProgramInfo(glRef.current, [vertexShader, fragmentShader])

    const arrays = {
      position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
      },
    }
    bufferInfoRef.current = twgl.createBufferInfoFromArrays(glRef.current, arrays)

    const resize = () => {
      twgl.resizeCanvasToDisplaySize(canvas)
      if (glRef.current) {
        glRef.current.viewport(0, 0, glRef.current.canvas.width, glRef.current.canvas.height)
      }
    }
    resize()
    window.addEventListener("resize", resize)

    const render = (time: number) => {
      if (!glRef.current || !programInfoRef.current || !bufferInfoRef.current) return

      time *= 0.001

      glRef.current.clearColor(1, 1, 1, 1)
      glRef.current.clear(glRef.current.COLOR_BUFFER_BIT)

      // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is WebGL API, not a React hook
      glRef.current.useProgram(programInfoRef.current.program)
      twgl.setUniforms(programInfoRef.current, {
        u_resolution: [glRef.current.canvas.width, glRef.current.canvas.height],
        u_time: time,
      })

      twgl.setBuffersAndAttributes(glRef.current, programInfoRef.current, bufferInfoRef.current)
      twgl.drawBufferInfo(glRef.current, bufferInfoRef.current)

      animationFrameIdRef.current = requestAnimationFrame(render)
    }

    animationFrameIdRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resize)
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
