import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

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
      const { data, error } = await getSupabase().auth.exchangeCodeForSession(code)

      if (error) {
        throw error
      }

      // If we have a user, ensure they exist in the users table
      if (data?.user) {
        console.log("Creating/updating user in callback route:", data.user.id)

        // First check if user already exists
        const { data: existingUser, error: checkError } = await getSupabase()
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error
          console.error("Error checking if user exists:", checkError)
        }

        // If user doesn't exist, create it
        if (!existingUser) {
          const { error: insertError } = await getSupabase()
            .from("users")
            .insert({
              id: data.user.id,
              email: data.user.email || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error("Error creating user record:", insertError)
          } else {
            console.log("User record created successfully in callback")
          }

          // Verify the user was created
          const { data: verifyData, error: verifyError } = await getSupabase()
            .from("users")
            .select("id")
            .eq("id", data.user.id)
            .single()

          if (verifyError) {
            console.error("Error verifying user creation in callback:", verifyError)
          } else {
            console.log("User verified in users table from callback:", verifyData)
          }
        } else {
          console.log("User already exists in users table")
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
