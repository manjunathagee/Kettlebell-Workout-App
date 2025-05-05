"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabase } from "../supabase"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string) => Promise<{ error: any | null; user: User | null }>
  signInWithGoogle: () => Promise<{ error: any | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to ensure user exists in the users table
  const ensureUserExists = async (user: User) => {
    try {
      console.log("Ensuring user exists in users table:", user.id)

      // Call the API endpoint to create the user record
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Error creating user record:", result.error)
      } else {
        console.log("User record creation result:", result)
      }
    } catch (error) {
      console.error("Error in ensureUserExists:", error)
    }
  }

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await getSupabase().auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          setSession(session)
          setUser(session.user)

          // Ensure user exists in the users table
          await ensureUserExists(session.user)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Ensure user exists in users table when auth state changes
        await ensureUserExists(session.user)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })

      if (data.user && !error) {
        await ensureUserExists(data.user)
      }

      return { error }
    } catch (error) {
      console.error("Error signing in:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      // Determine the correct redirect URL
      let redirectUrl = `${window.location.origin}/auth/callback`

      // If we're in development but want to test with a specific URL
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }

      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      // If sign up is successful, create a user record in our users table
      if (data.user && !error) {
        await ensureUserExists(data.user)
      }

      return { error, user: data.user }
    } catch (error) {
      console.error("Error signing up:", error)
      return { error, user: null }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Determine the correct redirect URL
      let redirectUrl = `${window.location.origin}/auth/callback`

      // If we're in development but want to test with a specific URL
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }

      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      })

      return { error }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      return { error }
    }
  }

  const signOut = async () => {
    await getSupabase().auth.signOut()
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
