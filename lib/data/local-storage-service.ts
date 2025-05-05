import type { WorkoutEntry } from "./workout-types"

const WORKOUTS_STORAGE_KEY = "kettlebell-tracker-workouts"
const CUSTOM_EXERCISES_STORAGE_KEY = "kettlebell-tracker-custom-exercises"
const PENDING_UPLOADS_KEY = "kettlebell-tracker-pending-uploads"

export const localStorageService = {
  // Save workouts to local storage
  saveWorkouts(workouts: WorkoutEntry[]): void {
    try {
      localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts))
    } catch (error) {
      console.error("Error saving workouts to local storage:", error)
    }
  },

  // Get workouts from local storage
  getWorkouts(): WorkoutEntry[] {
    try {
      const workouts = localStorage.getItem(WORKOUTS_STORAGE_KEY)
      return workouts ? JSON.parse(workouts) : []
    } catch (error) {
      console.error("Error getting workouts from local storage:", error)
      return []
    }
  },

  // Add a single workout to local storage
  addWorkout(workout: WorkoutEntry): void {
    try {
      const workouts = this.getWorkouts()
      workouts.push(workout)
      this.saveWorkouts(workouts)
    } catch (error) {
      console.error("Error adding workout to local storage:", error)
    }
  },

  // Update a workout in local storage
  updateWorkout(updatedWorkout: WorkoutEntry): void {
    try {
      const workouts = this.getWorkouts()
      const index = workouts.findIndex((workout) => workout.id === updatedWorkout.id)

      if (index !== -1) {
        workouts[index] = updatedWorkout
        this.saveWorkouts(workouts)
      }
    } catch (error) {
      console.error("Error updating workout in local storage:", error)
    }
  },

  // Delete a workout from local storage
  deleteWorkout(id: string): void {
    try {
      const workouts = this.getWorkouts()
      const updatedWorkouts = workouts.filter((workout) => workout.id !== id)
      this.saveWorkouts(updatedWorkouts)
    } catch (error) {
      console.error("Error deleting workout from local storage:", error)
    }
  },

  // Save custom exercises to local storage
  saveCustomExercises(exercises: string[]): void {
    try {
      localStorage.setItem(CUSTOM_EXERCISES_STORAGE_KEY, JSON.stringify(exercises))
    } catch (error) {
      console.error("Error saving custom exercises to local storage:", error)
    }
  },

  // Get custom exercises from local storage
  getCustomExercises(): string[] {
    try {
      const exercises = localStorage.getItem(CUSTOM_EXERCISES_STORAGE_KEY)
      return exercises ? JSON.parse(exercises) : []
    } catch (error) {
      console.error("Error getting custom exercises from local storage:", error)
      return []
    }
  },

  // Add a custom exercise to local storage
  addCustomExercise(exercise: string): void {
    try {
      const exercises = this.getCustomExercises()
      if (!exercises.includes(exercise)) {
        exercises.push(exercise)
        this.saveCustomExercises(exercises)
      }
    } catch (error) {
      console.error("Error adding custom exercise to local storage:", error)
    }
  },

  // Delete a custom exercise from local storage
  deleteCustomExercise(exercise: string): void {
    try {
      const exercises = this.getCustomExercises()
      const updatedExercises = exercises.filter((e) => e !== exercise)
      this.saveCustomExercises(updatedExercises)
    } catch (error) {
      console.error("Error deleting custom exercise from local storage:", error)
    }
  },

  // Save pending uploads to local storage
  savePendingUploads(pendingUploads: Omit<WorkoutEntry, "id">[]): void {
    try {
      localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingUploads))
    } catch (error) {
      console.error("Error saving pending uploads to local storage:", error)
    }
  },

  // Get pending uploads from local storage
  getPendingUploads(): Omit<WorkoutEntry, "id">[] {
    try {
      const pendingUploads = localStorage.getItem(PENDING_UPLOADS_KEY)
      return pendingUploads ? JSON.parse(pendingUploads) : []
    } catch (error) {
      console.error("Error getting pending uploads from local storage:", error)
      return []
    }
  },

  // Add a pending upload to local storage
  addPendingUpload(workout: Omit<WorkoutEntry, "id">): void {
    try {
      const pendingUploads = this.getPendingUploads()
      pendingUploads.push(workout)
      this.savePendingUploads(pendingUploads)
    } catch (error) {
      console.error("Error adding pending upload to local storage:", error)
    }
  },

  // Clear pending uploads from local storage
  clearPendingUploads(): void {
    try {
      localStorage.removeItem(PENDING_UPLOADS_KEY)
    } catch (error) {
      console.error("Error clearing pending uploads from local storage:", error)
    }
  },

  // Clear all data from local storage
  clearAll(): void {
    try {
      localStorage.removeItem(WORKOUTS_STORAGE_KEY)
      localStorage.removeItem(CUSTOM_EXERCISES_STORAGE_KEY)
      localStorage.removeItem(PENDING_UPLOADS_KEY)
    } catch (error) {
      console.error("Error clearing all data from local storage:", error)
    }
  },
}
