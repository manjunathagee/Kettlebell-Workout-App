import { GithubIcon, LinkedinIcon, MailIcon } from "lucide-react"
import Link from "next/link"
import { AnimateIn } from "./animate-in"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800 py-6">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center text-sm text-gray-400 md:text-left">
              &copy; {currentYear} Manjunatha C. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="mailto:manjunathagee@gmail.com" aria-label="Email">
                <MailIcon className="h-5 w-5 text-gray-400 hover:text-amber-400 transition-colors" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/manjunatha-citragar-54512827/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-5 w-5 text-gray-400 hover:text-amber-400 transition-colors" />
              </Link>
              <Link
                href="https://github.com/manjunathagee"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5 text-gray-400 hover:text-amber-400 transition-colors" />
              </Link>
            </div>
          </div>
        </AnimateIn>
      </div>
    </footer>
  )
}
