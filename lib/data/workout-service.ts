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

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching workouts:", error)
        throw error
      }

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

  // Save a new workout
  async saveWorkout(workout: Omit<WorkoutEntry, "id">): Promise<WorkoutEntry> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("User not authenticated")
      }

      console.log("Saving workout for user:", userData.user.id, workout)

      const { data, error } = await supabase
        .from("workouts")
        .insert({
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
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving workout:", error)
        throw error
      }

      return {
        id: data.id,
        date: data.date,
        exercise: data.exercise,
        weight: data.weight,
        reps: data.reps,
        sets: data.sets,
        completedSets: data.completed_sets,
        totalWeight: data.total_weight,
        duration: data.duration,
        isBodyweight: data.is_bodyweight,
      }
    } catch (error) {
      console.error("Error in saveWorkout:", error)
      throw error
    }
  },

  // Delete a workout
  async deleteWorkout(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("workouts").delete().eq("id", id)

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

  // Save a custom exercise
  async saveCustomExercise(name: string): Promise<void> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("User not authenticated")
      }

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
