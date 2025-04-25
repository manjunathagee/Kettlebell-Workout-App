import { Card, CardContent } from "@/components/ui/card"
import { AnimateIn } from "./animate-in"

export default function About() {
  return (
    <section id="about" className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-400">
              About Me
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-lg">
              Seasoned Front-End Engineer with over 10+ years of experience
            </p>
          </div>
        </AnimateIn>

        <AnimateIn delay={200}>
          <div className="mx-auto max-w-4xl">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300">
              <CardContent className="p-6">
                <ul className="list-disc pl-6 space-y-3 text-gray-300">
                  <li className="text-base">
                    Seasoned Front-End Engineer with over 10+ years of experience in leading teams and building
                    scalable, high-quality applications using modern technologies and frameworks.
                  </li>
                  <li className="text-base">
                    Expert in Project Management breaking down epics into manageable stories, conducting daily
                    stand-ups, and actively reviewing pull requests to ensure the smooth and timely delivery of stories
                    with minimal issues.
                  </li>
                  <li className="text-base">
                    Successfully led multiple projects from conception to completion, mentoring Junior engineers,
                    carried out Proof of Concept (POC).
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
