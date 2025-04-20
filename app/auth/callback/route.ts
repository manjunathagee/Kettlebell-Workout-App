import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // If there's an error, redirect to the verification page with the error
  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/auth/verify?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`,
        requestUrl.origin,
      ),
    )
  }

  // If there's a code, exchange it for a session
  if (code) {
    try {
      const supabase = createServerSupabaseClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/auth/verify?error=session_exchange_failed", requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
