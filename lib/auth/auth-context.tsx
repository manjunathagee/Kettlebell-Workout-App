"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../supabase"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string) => Promise<{ error: any | null; user: User | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          setSession(session)
          setUser(session.user)

          // Check if user exists in the users table, if not create it
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  // Helper function to ensure user exists in users table
  const ensureUserExists = async (user: User) => {
    try {
      // First check if user already exists
      const { data, error } = await supabase.from("users").select("id").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error checking if user exists:", error)
        return
      }

      // If user doesn't exist, create it
      if (!data) {
        console.log("Creating user record for:", user.id)
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
        } else {
          console.log("User record created successfully")
        }
      }
    } catch (error) {
      console.error("Error in ensureUserExists:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      // If sign up is successful, create a user record in our users table
      if (data.user && !error) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
        }
      }

      return { error, user: data.user }
    } catch (error) {
      console.error("Error signing up:", error)
      return { error, user: null }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
