import { AnimateIn } from "./animate-in"
import { CodeIcon, GitBranchIcon, LibraryIcon, CheckCircle2Icon } from "lucide-react"

export default function Skills() {
  const skillCategories = [
    {
      title: "Technical Skills",
      icon: <CodeIcon className="h-6 w-6 text-amber-400" />,
      skills: [
        "HTML5 & CSS3",
        "JavaScript (ES6+)",
        "TypeScript",
        "React.js",
        "Next.js",
        "Responsive Web Design",
        "Redux",
      ],
    },
    {
      title: "Workflow & Tools",
      icon: <GitBranchIcon className="h-6 w-6 text-amber-400" />,
      skills: ["Git & GitHub", "Docker", "CI/CD Pipelines", "Monorepo Management", "Storybook"],
    },
    {
      title: "Libraries & Frameworks",
      icon: <LibraryIcon className="h-6 w-6 text-amber-400" />,
      skills: ["Turborepo", "Radix UI", "Shadcn/ui", "Tailwind CSS"],
    },
    {
      title: "Core Competencies",
      icon: <CheckCircle2Icon className="h-6 w-6 text-amber-400" />,
      skills: [
        "Agile Methodologies",
        "Third-Party Integrations",
        "SaaS Based Products",
        "Micro-Frontend Architecture",
        "Code Reviews & Quality Assurance",
        "Project Management",
        "Proof of Concept (POC)",
      ],
    },
  ]

  return (
    <section id="skills" className="py-12 md:py-16 bg-slate-950">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col items-center justify-center space-y-2 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-600">
              Skills
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-lg">
              My technical expertise and professional competencies
            </p>
          </div>
        </AnimateIn>

        <div className="mx-auto max-w-5xl">
          {skillCategories.map((category, categoryIndex) => (
            <AnimateIn
              key={category.title}
              delay={200 + categoryIndex * 100}
              direction={categoryIndex % 2 === 0 ? "left" : "right"}
            >
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm">{category.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <div className="flex flex-wrap gap-3">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-full bg-amber-900/30 text-amber-200 border border-amber-800/50 hover:bg-amber-800/40 transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
