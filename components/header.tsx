"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MenuIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"
import { AnimateIn } from "./animate-in"

export default function Header() {
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Education", href: "#education" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-slate-900/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <AnimateIn direction="down">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl font-heading text-white">
              Manjunatha C
            </Link>
          </div>
        </AnimateIn>

        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
              {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </Button>

            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4 flex flex-col gap-2 shadow-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 hover:bg-amber-900/30 rounded-md text-gray-300 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      const targetId = item.href.substring(1)
                      const targetElement = document.getElementById(targetId)
                      if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" })
                      }
                      setIsMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <AnimateIn direction="down">
            <div className="flex items-center gap-6">
              <nav className="flex gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      const targetId = item.href.substring(1)
                      const targetElement = document.getElementById(targetId)
                      if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" })
                      }
                      if (isMenuOpen) setIsMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </AnimateIn>
        )}
      </div>
    </header>
  )
}
