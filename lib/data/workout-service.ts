import { supabase } from "../supabase"
import type { WorkoutEntry } from "./workout-types"
import { localStorageService } from "./local-storage-service"

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

  // Check if we're online
  isOnline(): boolean {
    return navigator.onLine
  },

  // Get all workouts for the current user
  async getWorkouts(): Promise<WorkoutEntry[]> {
    try {
      // Always get local workouts first
      const localWorkouts = localStorageService.getWorkouts()

      // If offline, return only local workouts
      if (!this.isOnline()) {
        console.log("Offline: returning local workouts only")
        return localWorkouts
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("User not authenticated:", userError)
        return localWorkouts // Return local workouts if not authenticated
      }

      console.log("Getting workouts for user:", userData.user.id)

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        console.error("Failed to ensure user exists in users table")
        return localWorkouts // Return local workouts if user doesn't exist
      }

      // Try to sync any pending uploads
      await this.syncPendingUploads(userData.user.id)

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching workouts:", error)
        return localWorkouts // Return local workouts if there's an error
      }

      console.log(`Retrieved ${data.length} workouts for user ${userData.user.id}`)

      // Convert Supabase data to WorkoutEntry format
      const serverWorkouts = data.map((workout) => ({
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

      // Update local storage with server data
      localStorageService.saveWorkouts(serverWorkouts)

      return serverWorkouts
    } catch (error) {
      console.error("Error in getWorkouts:", error)
      // Return local workouts if there's an error
      return localStorageService.getWorkouts()
    }
  },

  // Sync pending uploads to the server
  async syncPendingUploads(userId: string): Promise<void> {
    try {
      if (!this.isOnline()) {
        return // Skip if offline
      }

      const pendingUploads = localStorageService.getPendingUploads()
      if (pendingUploads.length === 0) {
        return // No pending uploads
      }

      console.log(`Syncing ${pendingUploads.length} pending uploads`)

      // Process each pending upload
      for (const workout of pendingUploads) {
        const workoutData = {
          user_id: userId,
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

        const { error } = await supabase.from("workouts").insert(workoutData)

        if (error) {
          console.error("Error syncing pending upload:", error)
          // Keep trying with the next one
        }
      }

      // Clear pending uploads after successful sync
      localStorageService.clearPendingUploads()
    } catch (error) {
      console.error("Error syncing pending uploads:", error)
    }
  },

  // Save a new workout - simplified approach
  async saveWorkout(workout: Omit<WorkoutEntry, "id">): Promise<WorkoutEntry> {
    try {
      // Generate a local ID for the workout
      const localId = crypto.randomUUID()
      const workoutWithId = { id: localId, ...workout }

      // Always save to local storage first
      localStorageService.addWorkout(workoutWithId)

      // If offline, add to pending uploads and return the local workout
      if (!this.isOnline()) {
        console.log("Offline: saving workout to pending uploads")
        localStorageService.addPendingUpload(workout)
        return workoutWithId
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.log("User not authenticated: saving workout to pending uploads")
        localStorageService.addPendingUpload(workout)
        return workoutWithId
      }

      console.log("Saving workout for user:", userData.user.id, workout)

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        console.error("Failed to ensure user exists in users table")
        localStorageService.addPendingUpload(workout)
        return workoutWithId
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
        localStorageService.addPendingUpload(workout)
        return workoutWithId
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
        return workoutWithId
      }

      const savedWorkout = data[0]
      const serverWorkout = {
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

      // Update the local storage with the server ID
      localStorageService.deleteWorkout(localId)
      localStorageService.addWorkout(serverWorkout)

      return serverWorkout
    } catch (error) {
      console.error("Error in saveWorkout:", error)
      // Return the local workout if there's an error
      const localId = crypto.randomUUID()
      const workoutWithId = { id: localId, ...workout }
      localStorageService.addPendingUpload(workout)
      return workoutWithId
    }
  },

  // Delete a workout
  async deleteWorkout(id: string): Promise<void> {
    try {
      // Always delete from local storage first
      localStorageService.deleteWorkout(id)

      // If offline, return early
      if (!this.isOnline()) {
        console.log("Offline: skipping server delete")
        return
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.log("User not authenticated: skipping server delete")
        return
      }

      const { error } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", userData.user.id)

      if (error) {
        console.error("Error deleting workout:", error)
      }
    } catch (error) {
      console.error("Error in deleteWorkout:", error)
    }
  },

  // Get custom exercises for the current user
  async getCustomExercises(): Promise<string[]> {
    try {
      // Always get local custom exercises first
      const localExercises = localStorageService.getCustomExercises()

      // If offline, return only local exercises
      if (!this.isOnline()) {
        console.log("Offline: returning local custom exercises only")
        return localExercises
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("User not authenticated:", userError)
        return localExercises // Return local exercises if not authenticated
      }

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        console.error("Failed to ensure user exists in users table")
        return localExercises // Return local exercises if user doesn't exist
      }

      const { data, error } = await supabase.from("custom_exercises").select("name").eq("user_id", userData.user.id)

      if (error) {
        console.error("Error fetching custom exercises:", error)
        return localExercises // Return local exercises if there's an error
      }

      const serverExercises = data.map((exercise) => exercise.name)

      // Merge server and local exercises (remove duplicates)
      const allExercises = [...new Set([...serverExercises, ...localExercises])]

      // Update local storage with merged data
      localStorageService.saveCustomExercises(allExercises)

      return allExercises
    } catch (error) {
      console.error("Error in getCustomExercises:", error)
      // Return local exercises if there's an error
      return localStorageService.getCustomExercises()
    }
  },

  // Save a custom exercise - simplified approach
  async saveCustomExercise(name: string): Promise<void> {
    try {
      // Always save to local storage first
      localStorageService.addCustomExercise(name)

      // If offline, return early
      if (!this.isOnline()) {
        console.log("Offline: skipping server save for custom exercise")
        return
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.log("User not authenticated: skipping server save for custom exercise")
        return
      }

      // Ensure user exists in the users table
      const userExists = await this.ensureUserExists(userData.user.id, userData.user.email || "")
      if (!userExists) {
        console.error("Failed to ensure user exists in users table")
        return
      }

      // Simple insert without returning data
      const { error } = await supabase.from("custom_exercises").insert({
        user_id: userData.user.id,
        name,
      })

      if (error) {
        console.error("Error saving custom exercise:", error)
      }
    } catch (error) {
      console.error("Error in saveCustomExercise:", error)
    }
  },

  // Delete a custom exercise
  async deleteCustomExercise(name: string): Promise<void> {
    try {
      // Always delete from local storage first
      localStorageService.deleteCustomExercise(name)

      // If offline, return early
      if (!this.isOnline()) {
        console.log("Offline: skipping server delete for custom exercise")
        return
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.log("User not authenticated: skipping server delete for custom exercise")
        return
      }

      const { error } = await supabase
        .from("custom_exercises")
        .delete()
        .eq("name", name)
        .eq("user_id", userData.user.id)

      if (error) {
        console.error("Error deleting custom exercise:", error)
      }
    } catch (error) {
      console.error("Error in deleteCustomExercise:", error)
    }
  },

  // Clear all data (both local and server)
  async clearAllData(): Promise<void> {
    try {
      // Clear local storage first
      localStorageService.clearAll()

      // If offline, return early
      if (!this.isOnline()) {
        console.log("Offline: skipping server data clear")
        return
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.log("User not authenticated: skipping server data clear")
        return
      }

      // Delete all workouts for the user
      const { error: workoutsError } = await supabase.from("workouts").delete().eq("user_id", userData.user.id)

      if (workoutsError) {
        console.error("Error deleting workouts:", workoutsError)
      }

      // Delete all custom exercises for the user
      const { error: exercisesError } = await supabase.from("custom_exercises").delete().eq("user_id", userData.user.id)

      if (exercisesError) {
        console.error("Error deleting custom exercises:", exercisesError)
      }
    } catch (error) {
      console.error("Error in clearAllData:", error)
    }
  },
}
