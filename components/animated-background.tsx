"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set initial dimensions
    let width = window.innerWidth
    let height = window.innerHeight

    // Function to resize canvas
    const resizeCanvas = () => {
      const heroSection = document.getElementById("hero-section")
      if (heroSection) {
        width = heroSection.offsetWidth
        height = heroSection.offsetHeight
        canvas.width = width
        canvas.height = height
      } else {
        // Fallback if hero section isn't found
        width = window.innerWidth
        height = window.innerHeight
        canvas.width = width
        canvas.height = height
      }
    }

    // Initial resize
    resizeCanvas()

    // Add resize listener
    window.addEventListener("resize", resizeCanvas)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        this.opacity = Math.random() * 0.5 + 0.2

        // Create an amber color palette
        const hue = Math.random() * 40 + 30 // 30-70 range (ambers to golds)
        const saturation = Math.floor(Math.random() * 40 + 60) // 60-100%
        const lightness = Math.floor(Math.random() * 30 + 50) // 50-80%

        this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${this.opacity})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > width) {
          this.x = 0
        } else if (this.x < 0) {
          this.x = width
        }

        if (this.y > height) {
          this.y = 0
        } else if (this.y < 0) {
          this.y = height
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const particles: Particle[] = []
    // Increase particle density for hero section
    const particleCount = Math.min(100, Math.floor((width * height) / 8000))

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "rgba(20, 15, 10, 0.8)")
      gradient.addColorStop(1, "rgba(40, 30, 20, 0.8)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw a subtle grid pattern
      ctx.strokeStyle = "rgba(255, 200, 100, 0.05)"
      ctx.lineWidth = 0.5

      const gridSize = 30
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = "rgba(255, 200, 100, 0.1)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ pointerEvents: "none", zIndex: 0 }}
    />
  )
}
