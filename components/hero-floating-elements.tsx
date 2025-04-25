import { FloatingElement } from "./floating-element"

export default function HeroFloatingElements() {
  return (
    <>
      {/* Floating circles and shapes */}
      <FloatingElement
        className="absolute top-[15%] left-[10%] w-16 h-16 rounded-full bg-amber-500/10 blur-xl"
        duration={5}
      />
      <FloatingElement
        className="absolute top-[30%] right-[15%] w-24 h-24 rounded-full bg-amber-600/10 blur-xl"
        duration={7}
        direction="down"
        delay={1}
      />
      <FloatingElement
        className="absolute bottom-[20%] left-[20%] w-20 h-20 rounded-full bg-amber-400/10 blur-xl"
        duration={6}
        delay={2}
      />
      <FloatingElement
        className="absolute top-[60%] right-[10%] w-12 h-12 rounded-full bg-amber-500/10 blur-xl"
        duration={4}
        direction="down"
        delay={1.5}
      />

      {/* Code-like elements */}
      <FloatingElement
        className="absolute top-[25%] left-[5%] text-amber-500/20 text-4xl font-mono hidden md:block"
        duration={8}
        delay={1}
      >
        &lt;div&gt;
      </FloatingElement>
      <FloatingElement
        className="absolute bottom-[15%] right-[5%] text-amber-500/20 text-4xl font-mono hidden md:block"
        duration={6}
        direction="down"
        delay={2}
      >
        &lt;/div&gt;
      </FloatingElement>
      <FloatingElement
        className="absolute top-[40%] right-[8%] text-amber-600/20 text-2xl font-mono hidden md:block"
        duration={7}
        delay={3}
      >
        {"{"}
      </FloatingElement>
      <FloatingElement
        className="absolute bottom-[30%] left-[8%] text-amber-600/20 text-2xl font-mono hidden md:block"
        duration={5}
        direction="down"
        delay={2.5}
      >
        {"}"}
      </FloatingElement>
    </>
  )
}
