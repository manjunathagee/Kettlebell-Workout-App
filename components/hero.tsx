"use client"

import { Button } from "@/components/ui/button"
import { ArrowDownIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon } from "lucide-react"
import Link from "next/link"
import { AnimateIn } from "./animate-in"
import AnimatedBackground from "./animated-background"
import HeroFloatingElements from "./hero-floating-elements"

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      <HeroFloatingElements />

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950 pointer-events-none"></div>

      <div className="container px-4 md:px-6 z-10 relative">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <AnimateIn direction="up" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-heading bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-400 mb-4">
              Manjunatha C
            </h1>
          </AnimateIn>

          <AnimateIn direction="up" delay={400}>
            <p className="text-xl md:text-2xl text-amber-200 mb-6 font-light">Senior Frontend Engineer</p>
          </AnimateIn>

          <AnimateIn direction="up" delay={600}>
            <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl">
              Seasoned Front-End Engineer with over 10+ years of experience in leading teams and building scalable,
              high-quality applications using modern technologies and frameworks.
            </p>
          </AnimateIn>

          <AnimateIn direction="up" delay={800}>
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => scrollToSection("contact")}>
                Contact Me
              </Button>
              <Button
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400/10"
                onClick={() => scrollToSection("about")}
              >
                Learn More <ArrowDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={1000}>
            <div className="flex gap-6 mt-4">
              <Link href="mailto:manjunathagee@gmail.com" aria-label="Email">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-amber-400/10 hover:text-amber-400">
                  <MailIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="tel:+919686061236" aria-label="Phone">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-amber-400/10 hover:text-amber-400">
                  <PhoneIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="https://www.linkedin.com/in/manjunatha-citragar-54512827/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-amber-400/10 hover:text-amber-400">
                  <LinkedinIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="https://github.com/manjunathagee"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-amber-400/10 hover:text-amber-400">
                  <GithubIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <AnimateIn direction="up" delay={1200}>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-2">Scroll Down</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
