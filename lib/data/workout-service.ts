import { supabase } from "../supabase"
import type { WorkoutEntry } from "./workout-types"

export const workoutService = {
  // Get all workouts for the current user
  async getWorkouts(): Promise<WorkoutEntry[]> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("User not authenticated:", userError)
        return []
      }

      console.log("Getting workouts for user:", userData.user.id)

      // First, verify the user exists in the users table
      const { data: userExists, error: userExistsError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userData.user.id)
        .single()

      if (userExistsError) {
        console.error("User does not exist in users table:", userExistsError)

        // Try to create the user
        console.log("Attempting to create user record")
        const { error: insertError } = await supabase.from("users").insert({
          id: userData.user.id,
          email: userData.user.email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
          return []
        }
      }

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching workouts:", error)
        throw error
      }

      console.log(`Retrieved ${data.length} workouts for user ${userData.user.id}`)
      return data.map((workout) => ({
        id: workout.id,
        date: workout.date,
        exercise: workout.exercise,
        weight: workout.weight,
        reps: workout.reps,
        sets: workout.sets,
        completedSets: workout.completed_sets,
        totalWeight: workout.total_weight,
        duration: workout.duration,
        isBodyweight: workout.is_bodyweight,
      }))
    } catch (error) {
      console.error("Error in getWorkouts:", error)
      return []
    }
  },

  // Save a new workout - simplified approach
  async saveWorkout(workout: Omit<WorkoutEntry, "id">): Promise<WorkoutEntry> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("User not authenticated")
      }

      console.log("Saving workout for user:", userData.user.id, workout)

      // First, verify the user exists in the users table
      const { data: userExists, error: userExistsError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userData.user.id)
        .single()

      if (userExistsError) {
        console.error("User does not exist in users table:", userExistsError)

        // Try to create the user
        console.log("Attempting to create user record before saving workout")
        const { error: insertError } = await supabase.from("users").insert({
          id: userData.user.id,
          email: userData.user.email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
          throw new Error("Could not create user record")
        }

        // Verify the user was created
        const { data: verifyData, error: verifyError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userData.user.id)
          .single()

        if (verifyError) {
          console.error("Error verifying user creation:", verifyError)
          throw new Error("Could not verify user creation")
        } else {
          console.log("User verified in users table:", verifyData)
        }
      }

      // Create the workout object without any optional fields
      const workoutData = {
        user_id: userData.user.id,
        date: workout.date,
        exercise: workout.exercise,
        weight: workout.weight,
        reps: workout.reps,
        sets: workout.sets,
        completed_sets: workout.completedSets,
        total_weight: workout.totalWeight,
        duration: workout.duration,
        is_bodyweight: workout.isBodyweight || false,
      }

      console.log("Inserting workout data:", workoutData)

      // Insert without returning data first
      const { error } = await supabase.from("workouts").insert(workoutData)

      if (error) {
        console.error("Error saving workout:", error)
        throw error
      }

      console.log("Workout saved successfully")

      // Then fetch the latest workouts
      const { data, error: fetchError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("exercise", workout.exercise)
        .eq("date", workout.date)
        .order("created_at", { ascending: false })
        .limit(1)

      if (fetchError || !data || data.length === 0) {
        console.error("Error fetching saved workout:", fetchError)
        // Return a mock workout with generated ID if we can't fetch the saved one
        return {
          id: crypto.randomUUID(),
          ...workout,
        }
      }

      const savedWorkout = data[0]
      return {
        id: savedWorkout.id,
        date: savedWorkout.date,
        exercise: savedWorkout.exercise,
        weight: savedWorkout.weight,
        reps: savedWorkout.reps,
        sets: savedWorkout.sets,
        completedSets: savedWorkout.completed_sets,
        totalWeight: savedWorkout.total_weight,
        duration: savedWorkout.duration,
        isBodyweight: savedWorkout.is_bodyweight,
      }
    } catch (error) {
      console.error("Error in saveWorkout:", error)
      throw error
    }
  },

  // Delete a workout
  async deleteWorkout(id: string): Promise<void> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", userData.user.id)

      if (error) {
        console.error("Error deleting workout:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteWorkout:", error)
      throw error
    }
  },

  // Get custom exercises for the current user
  async getCustomExercises(): Promise<string[]> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("User not authenticated:", userError)
        return []
      }

      // First, verify the user exists in the users table
      const { data: userExists, error: userExistsError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userData.user.id)
        .single()

      if (userExistsError) {
        console.error("User does not exist in users table:", userExistsError)

        // Try to create the user
        console.log("Attempting to create user record")
        const { error: insertError } = await supabase.from("users").insert({
          id: userData.user.id,
          email: userData.user.email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
          return []
        }
      }

      const { data, error } = await supabase.from("custom_exercises").select("name").eq("user_id", userData.user.id)

      if (error) {
        console.error("Error fetching custom exercises:", error)
        throw error
      }

      return data.map((exercise) => exercise.name)
    } catch (error) {
      console.error("Error in getCustomExercises:", error)
      return []
    }
  },

  // Save a custom exercise - simplified approach
  async saveCustomExercise(name: string): Promise<void> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("User not authenticated")
      }

      // First, verify the user exists in the users table
      const { data: userExists, error: userExistsError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userData.user.id)
        .single()

      if (userExistsError) {
        console.error("User does not exist in users table:", userExistsError)

        // Try to create the user
        console.log("Attempting to create user record")
        const { error: insertError } = await supabase.from("users").insert({
          id: userData.user.id,
          email: userData.user.email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
          throw new Error("Could not create user record")
        }
      }

      // Simple insert without returning data
      const { error } = await supabase.from("custom_exercises").insert({
        user_id: userData.user.id,
        name,
      })

      if (error) {
        console.error("Error saving custom exercise:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in saveCustomExercise:", error)
      throw error
    }
  },

  // Delete a custom exercise
  async deleteCustomExercise(name: string): Promise<void> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from("custom_exercises")
        .delete()
        .eq("name", name)
        .eq("user_id", userData.user.id)

      if (error) {
        console.error("Error deleting custom exercise:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteCustomExercise:", error)
      throw error
    }
  },
}
