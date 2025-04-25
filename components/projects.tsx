import { AnimateIn } from "./animate-in"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLinkIcon, GithubIcon } from "lucide-react"
import Link from "next/link"

interface Project {
  title: string
  description: string
  image: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
}

export default function Projects() {
  const projects: Project[] = [
    {
      title: "Interactive Whiteboard",
      description:
        "A real-time collaborative whiteboard application built with Canvas API and fabric.js. Features include multi-user editing, shape tools, text annotations, and session recording.",
      image: "/digital-brainstorm.png",
      technologies: ["React", "Canvas API", "Fabric.js", "Socket.io", "TypeScript"],
      liveUrl: "https://example.com/whiteboard",
      githubUrl: "https://github.com/example/whiteboard",
    },
    {
      title: "Micro Frontend Architecture",
      description:
        "A scalable micro-frontend solution using Turborepo, creating a modular design system with Radix UI and Tailwind CSS that improved development velocity by 40%.",
      image: "/micro-frontend-dashboard-overview.png",
      technologies: ["React", "Turborepo", "Radix UI", "Tailwind CSS", "TypeScript"],
      githubUrl: "https://github.com/example/micro-frontend",
    },
    {
      title: "Streaming Platform",
      description:
        "Video streaming platform built with Amazon IVS, enabling high-quality live streaming with low latency. Includes chat functionality, viewer analytics, and customizable player.",
      image: "/modern-video-platform.png",
      technologies: ["React", "Amazon IVS", "WebRTC", "Node.js", "TypeScript"],
      liveUrl: "https://example.com/streaming",
    },
    {
      title: "Invoicing System",
      description:
        "A unified invoicing platform that consolidated both Linear and Digital Ad trafficking services, streamlining operations and reducing calculation errors by 25%.",
      image: "/invoicing-system-dashboard-overview.png",
      technologies: ["Angular", "TypeScript", "Material UI", "Chart.js", "Node.js"],
      liveUrl: "https://example.com/invoicing",
    },
  ]

  return (
    <section id="projects" className="py-12 md:py-16 bg-slate-950">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col items-center justify-center space-y-2 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-400">
              Projects
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-lg">
              Showcasing some of my recent work and contributions
            </p>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto max-w-6xl">
          {projects.map((project, index) => (
            <AnimateIn key={project.title} delay={200 + index * 100} direction={index % 2 === 0 ? "left" : "right"}>
              <Card className="overflow-hidden bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300 group">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-amber-300 mb-2">{project.title}</h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 transition-all duration-300"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    {project.liveUrl && (
                      <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500 text-amber-400 hover:bg-amber-500/10"
                        >
                          Live Demo <ExternalLinkIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {project.githubUrl && (
                      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-slate-300 hover:bg-slate-700/20"
                        >
                          <GithubIcon className="mr-2 h-4 w-4" /> Code
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
