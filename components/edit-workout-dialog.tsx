"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Dumbbell, User } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { WorkoutEntry } from "../lib/data/workout-types"
import { format } from "date-fns"

// Default exercise types
const defaultExerciseTypes = [
  "Swing",
  "Clean",
  "Press",
  "Snatch",
  "Goblet Squat",
  "Turkish Get-Up",
  "Deadlift",
  "Row",
  "Lunge",
  "Clean and Press",
]

interface EditWorkoutDialogProps {
  workout: WorkoutEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedWorkout: WorkoutEntry) => Promise<void>
  customExercises?: string[]
}

export function EditWorkoutDialog({
  workout,
  open,
  onOpenChange,
  onSave,
  customExercises = [],
}: EditWorkoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isBodyweight, setIsBodyweight] = useState(workout?.isBodyweight || false)
  const [weight, setWeight] = useState(workout?.weight || 0)
  const [reps, setReps] = useState(workout?.reps || 0)
  const [sets, setSets] = useState(workout?.sets || 0)
  const [completedSets, setCompletedSets] = useState(workout?.completedSets || 0)
  const [exercise, setExercise] = useState(workout?.exercise || "")
  const { toast } = useToast()

  // Reset form when workout changes
  useEffect(() => {
    if (workout) {
      setIsBodyweight(workout.isBodyweight || false)
      setWeight(workout.weight)
      setReps(workout.reps)
      setSets(workout.sets)
      setCompletedSets(workout.completedSets)
      setExercise(workout.exercise)
    }
  }, [workout])

  if (!workout) return null

  // Combine default and custom exercises
  const allExercises = [...defaultExerciseTypes, ...customExercises]

  const handleSave = async () => {
    if (!workout) return

    setIsLoading(true)
    try {
      // Calculate total weight based on bodyweight status
      const totalWeight = isBodyweight ? 0 : weight * reps * completedSets

      const updatedWorkout: WorkoutEntry = {
        ...workout,
        exercise, // Include the exercise type in the update
        weight: isBodyweight ? 0 : weight,
        reps,
        sets,
        completedSets,
        totalWeight,
        isBodyweight,
      }

      await onSave(updatedWorkout)
      onOpenChange(false)
      toast({
        title: "Workout updated",
        description: "Your workout has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating workout:", error)
      toast({
        title: "Error updating workout",
        description: "Could not update your workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Workout</DialogTitle>
          <DialogDescription>{format(new Date(workout.date), "PPP")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Exercise Type Selection */}
          <div className="grid gap-2">
            <Label htmlFor="exercise">Exercise Type</Label>
            <Select value={exercise} onValueChange={setExercise}>
              <SelectTrigger id="exercise">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Default Exercises</SelectLabel>
                  {defaultExerciseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>

                {customExercises.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Custom Exercises</SelectLabel>
                    {customExercises.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Bodyweight toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="bodyweight">Bodyweight Exercise</Label>
            </div>
            <Switch
              id="bodyweight"
              checked={isBodyweight}
              onCheckedChange={setIsBodyweight}
              aria-label="Toggle bodyweight exercise"
            />
          </div>

          {/* Weight input - only show if not bodyweight */}
          {!isBodyweight && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="weight">Weight (kg)</Label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[12, 16, 24, 32, 40].map((w) => (
                  <Button
                    key={w}
                    type="button"
                    variant={weight === w ? "default" : "outline"}
                    onClick={() => setWeight(w)}
                    className="h-10"
                  >
                    {w}kg
                  </Button>
                ))}
              </div>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          )}

          {/* Reps slider */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reps">Reps</Label>
              <span className="text-sm text-muted-foreground">{reps} reps</span>
            </div>
            <Slider id="reps" value={[reps]} min={1} max={30} step={1} onValueChange={(value) => setReps(value[0])} />
          </div>

          {/* Sets slider */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sets">Total Sets</Label>
              <span className="text-sm text-muted-foreground">{sets} sets</span>
            </div>
            <Slider
              id="sets"
              value={[sets]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => {
                setSets(value[0])
                // Ensure completed sets doesn't exceed total sets
                if (completedSets > value[0]) {
                  setCompletedSets(value[0])
                }
              }}
            />
          </div>

          {/* Completed Sets slider */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="completedSets">Completed Sets</Label>
              <span className="text-sm text-muted-foreground">
                {completedSets} of {sets} sets
              </span>
            </div>
            <Slider
              id="completedSets"
              value={[completedSets]}
              min={1}
              max={sets}
              step={1}
              onValueChange={(value) => setCompletedSets(value[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
