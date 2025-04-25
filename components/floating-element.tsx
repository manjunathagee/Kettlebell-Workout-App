"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
  direction?: "up" | "down"
}

export function FloatingElement({
  children,
  className,
  delay = 0,
  duration = 3,
  distance = 10,
  direction = "up",
}: FloatingElementProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className={className}>{children}</div>
  }

  const floatKeyframes = {
    "0%, 100%": {
      transform: `translateY(0px)`,
    },
    "50%": {
      transform: `translateY(${direction === "up" ? -distance : distance}px)`,
    },
  }

  const floatAnimation = `float ${duration}s ease-in-out infinite`
  const animationDelay = `${delay}s`

  return (
    <div
      className={cn(className)}
      style={{
        animation: floatAnimation,
        animationDelay,
      }}
    >
      {children}
    </div>
  )
}
