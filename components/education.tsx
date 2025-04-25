import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrophyIcon } from "lucide-react"
import { AnimateIn } from "./animate-in"

export default function Education() {
  return (
    <section id="education" className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-400">
              Education & Awards
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-lg">My academic background and recognitions</p>
          </div>
        </AnimateIn>

        <div className="mx-auto max-w-4xl grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <AnimateIn delay={200} direction="left">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-amber-300">Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">B.E (Computer Science and Engineering)</h3>
                    <p className="text-sm text-gray-400">SDMCET, Dharwad</p>
                    <Badge variant="outline" className="mt-2 border-amber-500 text-amber-300">
                      2007 Jul – 2011 Aug
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>

          <AnimateIn delay={300} direction="right">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-300">
                  <TrophyIcon className="h-5 w-5 text-amber-500" />
                  Awards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Operative Opstar</h3>
                    <p className="text-sm text-gray-400">For best performer in Quarter Q</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
