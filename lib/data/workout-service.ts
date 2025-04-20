import { supabase } from "../supabase"
import type { WorkoutEntry } from "./workout-types"

export const workoutService = {
  // Helper function to ensure user exists in the users table
  async ensureUserExists(userId: string, email: string): Promise<boolean> {
    try {
      console.log("Ensuring user exists in users table:", userId)

      // First check if user already exists
      const { data, error } = await supabase.from("users").select("id").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error checking if user exists:", error)
        return false
      }

      // If user doesn't exist, create it
      if (!data) {
        console.log("User doesn't exist, creating record for:", userId)
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
          return false
        }

        // Verify the user was created
        const { data: verifyData, error: verifyError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .single()

        if (verifyError) {
          console.error("Error verifying user creation:", verifyError)
          return false
        }

        console.log("User record created successfully:", verifyData)
      } else {
        console.log("User already exists in users table")
      }

      return true
    } catch (error) {
      console.error("Error in ensureUserExists:", error)
      return false
    }
  },

  // Get all workouts for the current user
  async getWorkouts(): Promise<WorkoutEntry[]> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("User not authenticated:", userError)
        return []
      }

      console.log("Getting workouts for user:", userData.user.id)

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        console.error("Failed to ensure user exists in users table")
        return []
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

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        throw new Error("Failed to ensure user exists in users table")
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

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        console.error("Failed to ensure user exists in users table")
        return []
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

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        throw new Error("Failed to ensure user exists in users table")
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
