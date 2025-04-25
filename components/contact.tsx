"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MailIcon, PhoneIcon, LinkedinIcon, GithubIcon, Loader2 } from "lucide-react"
import { AnimateIn } from "./animate-in"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // This would be replaced with your actual API endpoint
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success toast
      toast({
        title: "Message sent successfully!",
        description: "Thank you for reaching out. I'll get back to you soon.",
        variant: "default",
        duration: 5000,
      })

      setIsSubmitted(true)
      setFormData({ name: "", email: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (error) {
      // Show error toast
      toast({
        title: "Something went wrong!",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <AnimateIn>
          <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-400">
              Get In Touch
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-lg">
              Have a project in mind? Let's work together!
            </p>
          </div>
        </AnimateIn>

        <div className="mx-auto max-w-4xl grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <AnimateIn delay={200} direction="left">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-amber-300">Contact Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Feel free to reach out through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MailIcon className="h-5 w-5 text-amber-400" />
                    <a
                      href="mailto:manjunathagee@gmail.com"
                      className="text-sm text-white hover:text-amber-300 transition-colors"
                    >
                      manjunathagee@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-amber-400" />
                    <a href="tel:+919686061236" className="text-sm text-white hover:text-amber-300 transition-colors">
                      +91 9686061236
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <LinkedinIcon className="h-5 w-5 text-amber-400" />
                    <a
                      href="https://www.linkedin.com/in/manjunatha-citragar-54512827/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white hover:text-amber-300 transition-colors"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <GithubIcon className="h-5 w-5 text-amber-400" />
                    <a
                      href="https://github.com/manjunathagee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white hover:text-amber-300 transition-colors"
                    >
                      Github Profile
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>

          <AnimateIn delay={300} direction="right">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full hover:bg-gradient-to-br hover:from-amber-900/20 hover:to-slate-900/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-amber-300">Send Me a Message</CardTitle>
                <CardDescription className="text-gray-400">I'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="min-h-[120px] bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                  {isSubmitted && (
                    <p className="text-sm text-green-400">Thank you for your message! I'll get back to you soon.</p>
                  )}
                </form>
              </CardContent>
            </Card>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
