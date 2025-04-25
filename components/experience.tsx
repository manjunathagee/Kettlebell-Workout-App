import { AnimateIn } from "./animate-in"
import { CodeIcon, LayoutIcon, UsersIcon, ZapIcon } from "lucide-react"
import { TimelineItem } from "./timeline-item"
import { YearMarker } from "./year-marker"
import { TimelineStartMarker } from "./timeline-start-marker"
import { TimelineEndMarker } from "./timeline-end-marker"

export default function Experience() {
  const experiences = [
    {
      title: "Frontend Developer, SDE IV",
      company: "Bhanzu",
      period: "2023 Apr – present",
      year: "2023",
      techStack: ["React.js", "Radix UI", "TurboRepo", "TailwindCSS", "Typescript"],
      highlights: [
        {
          icon: <LayoutIcon className="h-5 w-5 text-amber-400" />,
          title: "Micro Frontend Architecture",
          description:
            "Architected and implemented a scalable micro-frontend solution using Turborepo, creating a modular design system with Radix UI and Tailwind CSS that improved development velocity by 40%.",
        },
        {
          icon: <CodeIcon className="h-5 w-5 text-amber-400" />,
          title: "Real-time Whiteboard Solution",
          description:
            "Developed an interactive whiteboard application using Canvas API and fabric.js, enabling real-time collaboration features that increased user engagement by 35%.",
        },
        {
          icon: <ZapIcon className="h-5 w-5 text-amber-400" />,
          title: "Streaming Service Optimization",
          description:
            "Evaluated and integrated Amazon IVS for video streaming, reducing development costs by 60% while maintaining high-quality video delivery.",
        },
      ],
    },
    {
      title: "Frontend Principal Software Engineer",
      company: "Operative Media",
      period: "2019 Dec – 2022 Dec",
      year: "2019",
      techStack: ["Angular v8", "React.js", "Typescript", "Module Federation"],
      highlights: [
        {
          icon: <LayoutIcon className="h-5 w-5 text-amber-400" />,
          title: "Invoicing System Redesign",
          description:
            "Led the development of a unified invoicing platform that consolidated both Linear and Digital Ad trafficking services, streamlining operations and reducing calculation errors by 25%.",
        },
        {
          icon: <CodeIcon className="h-5 w-5 text-amber-400" />,
          title: "Legacy System Migration",
          description:
            "Successfully migrated critical legacy applications to modern tech stacks, improving performance by 30% and enabling new feature development.",
        },
        {
          icon: <UsersIcon className="h-5 w-5 text-amber-400" />,
          title: "Team Leadership",
          description:
            "Mentored junior engineers through code reviews and design sessions, helping team members achieve career growth while maintaining high code quality standards.",
        },
      ],
    },
    {
      title: "Frontend Engineer",
      company: "SmartBear (Formerly Zapi Tech)",
      period: "2017 Dec – 2019 Dec",
      year: "2017",
      techStack: ["Angular v6", "React.js", "Typescript"],
      highlights: [
        {
          icon: <ZapIcon className="h-5 w-5 text-amber-400" />,
          title: "Performance Optimization",
          description:
            "Restructured the application architecture using Angular CLI and implemented lazy loading, resulting in a 45% improvement in application startup time and enhanced user experience.",
        },
      ],
    },
    {
      title: "Frontend Software Developer",
      company: "OnMobile Ltd",
      period: "2014 Dec – 2016 Jul",
      year: "2014",
      techStack: ["JQuery", "SPA", "Struct", "Spring v3.0"],
      highlights: [
        {
          icon: <UsersIcon className="h-5 w-5 text-amber-400" />,
          title: "Cross-platform Development",
          description:
            "Led a 5-member team in developing responsive layouts for multiple devices, coordinating with product and UX teams to deliver seamless user experiences across platforms.",
        },
      ],
    },
    {
      title: "Frontend Software Developer",
      company: "Manhattan Associates, INC",
      period: "2014 Apr – 2014 Dec",
      year: "2014",
      techStack: ["ExtJS v4", "Spring v3.0"],
      highlights: [
        {
          icon: <CodeIcon className="h-5 w-5 text-amber-400" />,
          title: "Internal Tool Enhancement",
          description:
            "Implemented new features and resolved critical bugs for an internal product configuration tool, improving team productivity and reducing configuration errors.",
        },
      ],
    },
    {
      title: "Frontend Software Developer",
      company: "Trianz Holdings Pvt Ltd",
      period: "2012 Apr – 2014 Apr",
      year: "2012",
      techStack: ["ExtJS v4", "Sencha cmd", "JQuery Mobile", "Spring v3.0"],
      highlights: [
        {
          icon: <LayoutIcon className="h-5 w-5 text-amber-400" />,
          title: "Application Framework Development",
          description:
            "Created application workspaces using Sencha CMD, developed reusable UI components, and integrated REST APIs to build responsive and interactive web applications.",
        },
      ],
    },
  ]

  // Group experiences by year
  const experiencesByYear: Record<string, typeof experiences> = {}
  experiences.forEach((exp) => {
    if (!experiencesByYear[exp.year]) {
      experiencesByYear[exp.year] = []
    }
    experiencesByYear[exp.year].push(exp)
  })

  // Get unique years in descending order
  const years = Object.keys(experiencesByYear).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))

  return (
    <section id="experience" className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col items-center justify-center space-y-2 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-400">
              Professional Experience
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-lg">My journey as a Frontend Engineer</p>
          </div>
        </AnimateIn>

        <div className="mx-auto max-w-5xl relative timeline-container">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-amber-500/30 via-amber-400/50 to-amber-500/30 rounded-full"></div>
          <div className="md:hidden absolute left-8 top-8 bottom-0 w-1 bg-gradient-to-b from-amber-500/30 via-amber-400/50 to-amber-500/30 rounded-full"></div>

          <TimelineStartMarker />

          {years.map((year, yearIndex) => (
            <div key={year}>
              <YearMarker year={year} />
              {experiencesByYear[year].map((exp, expIndex) => (
                <TimelineItem
                  key={`${year}-${expIndex}`}
                  title={exp.title}
                  company={exp.company}
                  period={exp.period}
                  techStack={exp.techStack}
                  highlights={exp.highlights}
                  index={yearIndex + expIndex}
                />
              ))}
            </div>
          ))}

          <TimelineEndMarker />
        </div>
      </div>
    </section>
  )
}
