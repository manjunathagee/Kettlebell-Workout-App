// Update the themes to use HSL values directly for better compatibility

export type ThemeColor = {
  name: string
  value: string
  foreground: string
}

export type Theme = {
  name: string
  colors: ThemeColor[]
}

export const themes: Theme[] = [
  {
    name: "Default",
    colors: [
      { name: "orange", value: "hsl(24.6, 95%, 53.1%)", foreground: "hsl(0, 0%, 100%)" },
      { name: "blue", value: "hsl(217.2, 91.2%, 59.8%)", foreground: "hsl(0, 0%, 100%)" },
      { name: "green", value: "hsl(142.1, 76.2%, 36.3%)", foreground: "hsl(0, 0%, 100%)" },
      { name: "red", value: "hsl(0, 84.2%, 60.2%)", foreground: "hsl(0, 0%, 100%)" },
      { name: "purple", value: "hsl(262.1, 83.3%, 57.8%)", foreground: "hsl(0, 0%, 100%)" },
    ],
  },
  {
    name: "Pastel",
    colors: [
      { name: "peach", value: "hsl(21, 100%, 80%)", foreground: "hsl(20, 80%, 20%)" },
      { name: "mint", value: "hsl(150, 60%, 80%)", foreground: "hsl(150, 80%, 20%)" },
      { name: "lavender", value: "hsl(270, 60%, 80%)", foreground: "hsl(270, 80%, 20%)" },
      { name: "sky", value: "hsl(200, 60%, 80%)", foreground: "hsl(200, 80%, 20%)" },
      { name: "rose", value: "hsl(350, 60%, 80%)", foreground: "hsl(350, 80%, 20%)" },
    ],
  },
  {
    name: "Neon",
    colors: [
      { name: "lime", value: "hsl(120, 100%, 50%)", foreground: "hsl(0, 0%, 0%)" },
      { name: "magenta", value: "hsl(300, 100%, 50%)", foreground: "hsl(0, 0%, 100%)" },
      { name: "cyan", value: "hsl(180, 100%, 50%)", foreground: "hsl(0, 0%, 0%)" },
      { name: "yellow", value: "hsl(60, 100%, 50%)", foreground: "hsl(0, 0%, 0%)" },
      { name: "pink", value: "hsl(330, 100%, 50%)", foreground: "hsl(0, 0%, 100%)" },
    ],
  },
]

export const defaultTheme = themes[0]
export const defaultColor = defaultTheme.colors[0]
