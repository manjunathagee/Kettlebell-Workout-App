"use client"

import { Badge } from "@/components/ui/badge"
import { AnimateIn } from "./animate-in"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"

interface Highlight {
  icon: ReactNode
  title: string
  description: string
}

interface TimelineItemProps {
  title: string
  company: string
  period: string
  techStack: string[]
  highlights: Highlight[]
  index: number
}

export function TimelineItem({ title, company, period, techStack, highlights, index }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false)
  const isEven = index % 2 === 0

  // Show only the first highlight when collapsed
  const visibleHighlights = expanded ? highlights : highlights.slice(0, 1)

  return (
    <div className="mb-12 relative">
      <AnimateIn
        delay={200 + index * 100}
        direction={isEven ? "left" : "right"}
        className={`md:w-[calc(50%-24px)] ${
          isEven
            ? "md:mr-auto md:ml-0 md:pr-12 md:pl-0 md:text-right"
            : "md:ml-auto md:mr-0 md:pl-12 md:pr-0 md:text-left"
        } relative z-10`}
      >
        {/* Timeline dot */}
        <div className="absolute left-8 md:left-1/2 top-8 transform md:-translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-900 z-10"></div>

        {/* Experience card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300 shadow-lg hover:shadow-amber-500/10">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-amber-300">{title}</h3>
            <p className="text-lg font-medium text-white">{company}</p>
            <Badge variant="outline" className="mt-2 border-amber-500 text-amber-300">
              {period}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {techStack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 transition-all duration-300"
              >
                {tech}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            {visibleHighlights.map((highlight, i) => (
              <div key={i} className={`flex gap-3 ${isEven ? "md:flex-row-reverse" : ""}`}>
                <div className="mt-1 shrink-0">{highlight.icon}</div>
                <div className={isEven ? "md:text-right" : ""}>
                  <h4 className="font-medium text-white">{highlight.title}</h4>
                  <p className="text-gray-300">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Show expand/collapse button only if there are more than 1 highlight */}
          {highlights.length > 1 && (
            <div className={`mt-4 flex ${isEven ? "md:justify-end" : ""}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    Show Less <ChevronUpIcon className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read More <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Timeline connector */}
        <div
          className="hidden md:block absolute top-8 w-12 h-1 bg-amber-400/50 transform -translate-y-1/2"
          style={{
            [isEven ? "right" : "left"]: "0",
          }}
        ></div>

        {/* Timeline connector for mobile */}
        <div className="md:hidden absolute left-8 top-8 w-8 h-1 bg-amber-400/50 transform -translate-y-1/2"></div>
      </AnimateIn>
    </div>
  )
}
