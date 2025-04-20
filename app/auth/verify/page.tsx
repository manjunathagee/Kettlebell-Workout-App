"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function VerifyPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed in successfully",
          description: "Your account has been verified!",
        })
        // Redirect to home page after successful verification
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast({
        title: "Verification failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Account Verification</CardTitle>
            <CardDescription>
              If you're having trouble with the verification email, you can try signing in directly with your
              credentials.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleManualVerification}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Sign In"}
              </Button>
              <Link href="/" className="text-sm text-center text-muted-foreground hover:underline w-full">
                Return to home page
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
