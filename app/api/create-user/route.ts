import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("Creating user record for:", userId, email)

    const supabase = createServerSupabaseClient()

    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error checking if user exists:", checkError)
      return NextResponse.json({ error: "Error checking if user exists" }, { status: 500 })
    }

    // If user already exists, return success
    if (existingUser) {
      console.log("User already exists:", existingUser)
      return NextResponse.json({ success: true, message: "User already exists", userId })
    }

    // Create user record
    const { data, error } = await supabase.from("users").insert({
      id: userId,
      email: email || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating user record:", error)
      return NextResponse.json({ error: "Failed to create user record" }, { status: 500 })
    }

    // Verify the user was created
    const { data: verifyData, error: verifyError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (verifyError) {
      console.error("Error verifying user creation:", verifyError)
      return NextResponse.json({ error: "Failed to verify user creation" }, { status: 500 })
    }

    console.log("User record created successfully:", verifyData)
    return NextResponse.json({ success: true, message: "User record created", userId })
  } catch (error) {
    console.error("Error in create-user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
