"use client"

import { useState, useEffect, useRef } from "react"
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

// LocalStorage key for custom exercises
const CUSTOM_EXERCISES_KEY = "kettlebell-tracker-custom-exercises"

interface CustomExerciseDialogProps {
  onExercisesChange: (exercises: string[]) => void
}

export function CustomExerciseDialog({ onExercisesChange }: CustomExerciseDialogProps) {
  const [open, setOpen] = useState(false)
  const [newExercise, setNewExercise] = useState("")
  const [customExercises, setCustomExercises] = useState<string[]>([])
  const { toast } = useToast()
  const initialLoadRef = useRef(false)
  const prevExercisesRef = useRef<string[]>([])

  // Load custom exercises from localStorage only once on mount
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      try {
        const savedExercises = localStorage.getItem(CUSTOM_EXERCISES_KEY)
        if (savedExercises) {
          const parsedExercises = JSON.parse(savedExercises) as string[]
          setCustomExercises(parsedExercises)
          prevExercisesRef.current = parsedExercises
          onExercisesChange(parsedExercises)
        }
      } catch (error) {
        console.error("Error loading custom exercises:", error)
      }
    }
  }, [onExercisesChange])

  // Save custom exercises to localStorage
  const saveCustomExercises = (exercises: string[]) => {
    try {
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises))
      setCustomExercises(exercises)

      // Only call onExercisesChange if the exercises have actually changed
      if (JSON.stringify(exercises) !== JSON.stringify(prevExercisesRef.current)) {
        prevExercisesRef.current = exercises
        onExercisesChange(exercises)
      }
    } catch (error) {
      console.error("Error saving custom exercises:", error)
      toast({
        title: "Error saving exercises",
        description: "Could not save your custom exercises.",
        variant: "destructive",
      })
    }
  }

  // Add a new custom exercise
  const handleAddExercise = () => {
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

    const updatedExercises = [...customExercises, newExercise.trim()]
    saveCustomExercises(updatedExercises)
    setNewExercise("")

    toast({
      title: "Exercise added",
      description: `"${newExercise.trim()}" has been added to your exercises.`,
    })
  }

  // Remove a custom exercise
  const handleRemoveExercise = (exercise: string) => {
    const updatedExercises = customExercises.filter((e) => e !== exercise)
    saveCustomExercises(updatedExercises)

    toast({
      title: "Exercise removed",
      description: `"${exercise}" has been removed from your exercises.`,
    })
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
            />
            <Button onClick={handleAddExercise}>Add</Button>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Your Custom Exercises</Label>
            {customExercises.length === 0 ? (
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
