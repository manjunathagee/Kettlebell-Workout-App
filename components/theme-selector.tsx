"use client"

import { useState } from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { themes } from "@/lib/themes"
import { useThemeContext } from "./theme-provider"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor } = useThemeContext()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          <DropdownMenuSeparator />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Palette className="mr-2 h-4 w-4" />
                <span>Theme Colors</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Theme Color</DialogTitle>
                <DialogDescription>Choose a color theme for the app</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue={themes[0].name} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  {themes.map((theme) => (
                    <TabsTrigger key={theme.name} value={theme.name}>
                      {theme.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {themes.map((theme) => (
                  <TabsContent key={theme.name} value={theme.name} className="mt-0">
                    <div className="grid grid-cols-5 gap-2">
                      {theme.colors.map((color) => (
                        <button
                          key={color.name}
                          className={cn(
                            "h-8 w-8 rounded-full border-2 transition-all",
                            themeColor.value === color.value
                              ? "border-black dark:border-white scale-110"
                              : "border-transparent",
                          )}
                          style={{ backgroundColor: color.value }}
                          onClick={() => {
                            setThemeColor(color)
                            setOpen(false)
                          }}
                          aria-label={`Select ${color.name} theme`}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
