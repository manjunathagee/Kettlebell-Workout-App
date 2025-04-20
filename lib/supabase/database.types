export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          date: string
          exercise: string
          weight: number
          reps: number
          sets: number
          completed_sets: number
          total_weight: number
          duration: number
          is_bodyweight: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          exercise: string
          weight: number
          reps: number
          sets: number
          completed_sets: number
          total_weight: number
          duration: number
          is_bodyweight?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exercise?: string
          weight?: number
          reps?: number
          sets?: number
          completed_sets?: number
          total_weight?: number
          duration?: number
          is_bodyweight?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      custom_exercises: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
