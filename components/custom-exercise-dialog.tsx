"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { workoutService } from "@/lib/data/workout-service"
import { useAuth } from "@/lib/auth/auth-context"

interface CustomExerciseDialogProps {
  onExercisesChange: (exercises: string[]) => void
}

export function CustomExerciseDialog({ onExercisesChange }: CustomExerciseDialogProps) {
  const [open, setOpen] = useState(false)
  const [newExercise, setNewExercise] = useState("")
  const [customExercises, setCustomExercises] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Load custom exercises from Supabase
  useEffect(() => {
    const loadCustomExercises = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const exercises = await workoutService.getCustomExercises()
        setCustomExercises(exercises)
        onExercisesChange(exercises)
      } catch (error) {
        console.error("Error loading custom exercises:", error)
        toast({
          title: "Error loading exercises",
          description: "Could not load your custom exercises.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomExercises()
  }, [user, onExercisesChange, toast])

  // Add a new custom exercise
  const handleAddExercise = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add custom exercises.",
        variant: "destructive",
      })
      return
    }

    if (!newExercise.trim()) {
      toast({
        title: "Exercise name required",
        description: "Please enter a name for your custom exercise.",
        variant: "destructive",
      })
      return
    }

    if (customExercises.includes(newExercise.trim())) {
      toast({
        title: "Exercise already exists",
        description: "This exercise name is already in your list.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await workoutService.saveCustomExercise(newExercise.trim())

      const updatedExercises = [...customExercises, newExercise.trim()]
      setCustomExercises(updatedExercises)
      onExercisesChange(updatedExercises)
      setNewExercise("")

      toast({
        title: "Exercise added",
        description: `"${newExercise.trim()}" has been added to your exercises.`,
      })
    } catch (error) {
      console.error("Error adding custom exercise:", error)
      toast({
        title: "Error adding exercise",
        description: "Could not add your custom exercise.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Remove a custom exercise
  const handleRemoveExercise = async (exercise: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      await workoutService.deleteCustomExercise(exercise)

      const updatedExercises = customExercises.filter((e) => e !== exercise)
      setCustomExercises(updatedExercises)
      onExercisesChange(updatedExercises)

      toast({
        title: "Exercise removed",
        description: `"${exercise}" has been removed from your exercises.`,
      })
    } catch (error) {
      console.error("Error removing custom exercise:", error)
      toast({
        title: "Error removing exercise",
        description: "Could not remove your custom exercise.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add custom exercise</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Exercises</DialogTitle>
          <DialogDescription>Add your own custom exercises to track in the app.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <Input
              placeholder="Enter exercise name"
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddExercise()
                }
              }}
              disabled={isLoading || !user}
            />
            <Button onClick={handleAddExercise} disabled={isLoading || !user}>
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Your Custom Exercises</Label>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : customExercises.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No custom exercises yet. Add one above.</p>
            ) : (
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-2">
                  {customExercises.map((exercise) => (
                    <div key={exercise} className="flex items-center justify-between py-2 px-1 border-b last:border-0">
                      <span className="text-sm">{exercise}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExercise(exercise)}
                        className="h-7 w-7 p-0"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove {exercise}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
