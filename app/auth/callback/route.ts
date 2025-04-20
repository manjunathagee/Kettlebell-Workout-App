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
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        throw error
      }

      // If we have a user, ensure they exist in the users table
      if (data?.user) {
        console.log("Creating/updating user in callback route:", data.user.id)

        const { error: userError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )

        if (userError) {
          console.error("Error ensuring user exists:", userError)
        } else {
          console.log("User record created/updated successfully in callback")
        }

        // Verify the user was created
        const { data: verifyData, error: verifyError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (verifyError) {
          console.error("Error verifying user creation in callback:", verifyError)
        } else {
          console.log("User verified in users table from callback:", verifyData)
        }
      }
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/auth/verify?error=session_exchange_failed", requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
