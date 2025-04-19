"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { defaultColor, type ThemeColor } from "@/lib/themes"

type ThemeContextType = {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

export const ThemeContext = React.createContext<ThemeContextType>({
  themeColor: defaultColor,
  setThemeColor: () => null,
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [themeColor, setThemeColor] = React.useState<ThemeColor>(defaultColor)

  // Update CSS variables and save to localStorage when theme color changes
  const handleSetThemeColor = React.useCallback((color: ThemeColor) => {
    setThemeColor(color)

    // Convert hex or hsl to HSL components for CSS variables
    const style = getComputedStyle(document.documentElement)
    const tempDiv = document.createElement("div")
    tempDiv.style.color = color.value
    document.body.appendChild(tempDiv)
    const rgbColor = getComputedStyle(tempDiv).color
    document.body.removeChild(tempDiv)

    // Parse RGB values
    const rgbMatch = rgbColor.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number)
      const [h, s, l] = rgbToHsl(r, g, b)

      // Set the HSL values as CSS variables
      document.documentElement.style.setProperty("--primary", `${h} ${s}% ${l}%`)

      // Set foreground color
      tempDiv.style.color = color.foreground
      document.body.appendChild(tempDiv)
      const fgRgbColor = getComputedStyle(tempDiv).color
      document.body.removeChild(tempDiv)

      const fgRgbMatch = fgRgbColor.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
      if (fgRgbMatch) {
        const [_, fgR, fgG, fgB] = fgRgbMatch.map(Number)
        const [fgH, fgS, fgL] = rgbToHsl(fgR, fgG, fgB)
        document.documentElement.style.setProperty("--primary-foreground", `${fgH} ${fgS}% ${fgL}%`)
      }
    }

    localStorage.setItem("kb-theme-color", JSON.stringify(color))
  }, [])

  // Load theme color from localStorage on mount
  React.useEffect(() => {
    try {
      const savedColor = localStorage.getItem("kb-theme-color")
      if (savedColor) {
        const parsedColor = JSON.parse(savedColor) as ThemeColor

        // Apply the saved color
        handleSetThemeColor(parsedColor)
      } else {
        // Apply the default color if none is saved
        handleSetThemeColor(defaultColor)
      }
    } catch (error) {
      console.error("Error loading theme color:", error)
      // Apply default color on error
      handleSetThemeColor(defaultColor)
    }
  }, [handleSetThemeColor])

  // Add RGB to HSL conversion function
  function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h *= 60
    }

    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor: handleSetThemeColor }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => React.useContext(ThemeContext)
