"use client"

import { Switch } from "@/components/ui/switch"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dumbbell, Clock, RotateCcw, Play, Pause, SkipForward, X, Plus, User, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { WorkoutHistory } from "./components/workout-history"
import { WorkoutStats } from "./components/workout-stats"
import { WorkoutCalendar } from "./components/workout-calendar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { calculateStatistics } from "./lib/data/workout-types"
import type { WorkoutEntry } from "./lib/data/workout-types"
import { useToast } from "@/components/ui/use-toast"
import { PWARegister } from "./components/pwa-register"
import { DataExport } from "./components/data-export"
import { CircularProgress } from "./components/circular-progress"
import { CustomExerciseDialog } from "./components/custom-exercise-dialog"
import { useTheme } from "next-themes"
import { useAuth } from "./lib/auth/auth-context"
import { workoutService } from "./lib/data/workout-service"
import { AuthForm } from "./components/auth/auth-form"
import { UserProfile } from "./components/auth/user-profile"
import { getSupabase } from "./lib/supabase"
import { localStorageService } from "./lib/data/local-storage-service"

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
  "Clean and Press", // Added Clean and Press
]

// Rest time increment options
const REST_TIME_INCREMENTS = [10, 30, 60]

export default function KettlebellTracker() {
  // Add isBodyweight state
  const [isBodyweight, setIsBodyweight] = useState(false)
  const [weight, setWeight] = useState(24)
  const [reps, setReps] = useState(10)
  const [sets, setSets] = useState(3)
  const [delay, setDelay] = useState(60)
  const [exercise, setExercise] = useState("Swing")
  const [customExercises, setCustomExercises] = useState<string[]>([])

  // Workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(delay)
  const [isPaused, setIsPaused] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)

  // Workout history state
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>([])
  const [workoutStats, setWorkoutStats] = useState(calculateStatistics([]))
  const [isLoading, setIsLoading] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState("history")

  // Online status state
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Audio context for sound
  const audioContextRef = useRef<AudioContext | null>(null)

  const { toast } = useToast()
  const { setTheme, theme } = useTheme()
  const { user, isLoading: isAuthLoading } = useAuth()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Play notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      // Create AudioContext on demand (to comply with browser autoplay policies)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const context = audioContextRef.current

      // Create a double beep sound
      const createBeep = (frequency: number, startTime: number, duration: number) => {
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(context.destination)

        oscillator.type = "sine"
        oscillator.frequency.value = frequency
        gainNode.gain.value = 0.3

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)

        // Add a quick fade out to avoid clicks
        gainNode.gain.setValueAtTime(0.3, startTime + duration - 0.05)
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration)
      }

      // Current time in the audio context
      const now = context.currentTime

      // Create two beeps with different frequencies
      createBeep(800, now, 0.2)
      createBeep(1000, now + 0.3, 0.2)
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }

  // Function to handle offline mode for non-authenticated users
  const handleOfflineMode = () => {
    // If user is not authenticated and we're offline, load data from local storage
    if (!user && !isOnline) {
      const localWorkouts = localStorageService.getWorkouts()
      setWorkoutHistory(localWorkouts)
      setWorkoutStats(calculateStatistics(localWorkouts))

      const localExercises = localStorageService.getCustomExercises()
      setCustomExercises(localExercises)

      toast({
        title: "Offline Mode",
        description: "You're using the app in offline mode with local data",
      })
    }
  }

  // Load workout history from Supabase when user is authenticated
  useEffect(() => {
    const loadWorkoutHistory = async () => {
      if (!user && !isOnline) {
        handleOfflineMode()
        setIsLoading(false)
        return
      }

      if (!user) {
        setWorkoutHistory([])
        setWorkoutStats(calculateStatistics([]))
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        console.log("Loading workout history for user:", user.id)
        const workouts = await workoutService.getWorkouts()
        console.log("Loaded workouts:", workouts)
        setWorkoutHistory(workouts)
        setWorkoutStats(calculateStatistics(workouts))
      } catch (error) {
        console.error("Error loading workout data:", error)
        toast({
          title: "Error loading data",
          description: "Could not load your workout data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading) {
      loadWorkoutHistory()
    }
  }, [user, isAuthLoading, toast, isOnline])

  // Save workout to Supabase
  const saveWorkout = async (workout: Omit<WorkoutEntry, "id">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your workout.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Saving workout:", workout)

      // First try to save the workout
      await workoutService.saveWorkout(workout)

      // Then reload all workouts regardless of the result
      const workouts = await workoutService.getWorkouts()
      console.log("Reloaded workouts:", workouts)
      setWorkoutHistory(workouts)
      setWorkoutStats(calculateStatistics(workouts))

      toast({
        title: "Workout saved!",
        description: `Completed ${workout.completedSets} sets of ${workout.exercise}`,
      })
    } catch (error) {
      console.error("Error saving workout:", error)
      toast({
        title: "Error saving workout",
        description: "Could not save your workout. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Clear all workout data
  const clearWorkoutData = async () => {
    if (confirm("Are you sure you want to clear all workout data? This cannot be undone.")) {
      setIsLoading(true)
      try {
        // Use the new clearAllData function that handles both local and server data
        await workoutService.clearAllData()

        setWorkoutHistory([])
        setWorkoutStats(calculateStatistics([]))

        toast({
          title: "Data cleared",
          description: "All workout data has been deleted",
        })
      } catch (error) {
        console.error("Error clearing workout data:", error)
        toast({
          title: "Error clearing data",
          description: "Could not clear your workout data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Import workout data
  const importWorkoutData = async (importedWorkouts: WorkoutEntry[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to import workout data.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Save each imported workout to Supabase
      for (const workout of importedWorkouts) {
        await workoutService.saveWorkout({
          date: workout.date,
          exercise: workout.exercise,
          weight: workout.weight,
          reps: workout.reps,
          sets: workout.sets,
          completedSets: workout.completedSets,
          totalWeight: workout.totalWeight,
          duration: workout.duration,
          isBodyweight: workout.isBodyweight,
        })
      }

      // Reload workouts from Supabase
      const workouts = await workoutService.getWorkouts()
      setWorkoutHistory(workouts)
      setWorkoutStats(calculateStatistics(workouts))

      toast({
        title: "Import successful",
        description: `Imported ${importedWorkouts.length} workouts`,
      })
    } catch (error) {
      console.error("Error importing workout data:", error)
      toast({
        title: "Error importing data",
        description: "Could not import your workout data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle custom exercises change - use a stable reference
  const handleCustomExercisesChange = useCallback((exercises: string[]) => {
    setCustomExercises(exercises)
  }, [])

  // Toggle light/dark mode
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Start the workout
  const startWorkout = () => {
    setIsWorkoutActive(true)
    setCurrentSet(1)
    setIsResting(false)
    setIsPaused(false)
    setWorkoutStartTime(new Date())
  }

  // End the workout
  const endWorkout = () => {
    setIsWorkoutActive(false)
    if (timerRef.current) clearInterval(timerRef.current)

    // Play notification sound when workout ends
    playNotificationSound()

    // Only save if at least one set was completed
    if (currentSet > 1 && workoutStartTime) {
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000)
      // If the workout is ending normally (not canceled early), count the current set as completed
      const completedSets = isResting ? currentSet - 1 : currentSet
      // Use 0 for weight if bodyweight exercise
      const actualWeight = isBodyweight ? 0 : weight
      // For bodyweight exercises, just count reps
      const totalWeight = isBodyweight ? 0 : actualWeight * reps * completedSets

      // Create workout entry
      const workout: Omit<WorkoutEntry, "id"> = {
        date: new Date().toISOString(),
        weight: actualWeight,
        reps,
        sets,
        completedSets,
        totalWeight,
        duration,
        exercise,
        isBodyweight,
      }

      // Save workout
      saveWorkout(workout)
    }
  }

  // Start rest period
  const startRest = () => {
    setIsResting(true)
    setTimeRemaining(delay)
    setIsPaused(false)
  }

  // Complete current set
  const completeSet = () => {
    if (currentSet < sets) {
      setCurrentSet((prev) => prev + 1)
      startRest()
    } else {
      // This is the last set, mark it as completed before ending
      endWorkout()
    }
  }

  // Skip rest period
  const skipRest = () => {
    setIsResting(false)
  }

  // Toggle pause
  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  // Add more rest time
  const addRestTime = (seconds: number) => {
    setTimeRemaining((prev) => prev + seconds)
    toast({
      title: `Added ${seconds} seconds`,
      description: "Rest time extended",
    })
  }

  // Handle rest timer
  useEffect(() => {
    if (isResting && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsResting(false)
            playNotificationSound() // Play sound when timer ends
            return delay
          }
          return prev - 1
        })
      }, 1000)
    } else if (isPaused && timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isResting, isPaused, delay])

  // Calculate progress percentage for rest timer
  const restProgress = isResting ? ((delay - timeRemaining) / delay) * 100 : 0

  // Combine default and custom exercises
  const allExercises = [...defaultExerciseTypes, ...customExercises]

  // Debug user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await getSupabase().auth.getSession()
      console.log("Auth session:", data.session, "Error:", error)

      if (data.session) {
        console.log("User is authenticated:", data.session.user.id)
      } else {
        console.log("User is not authenticated")
      }
    }

    checkAuth()
  }, [user])

  // Add this to the useEffect that handles online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = async () => {
      setIsOnline(true)
      toast({
        title: "You're back online",
        description: "Your data will sync automatically",
      })

      // Reload data from server when coming back online
      if (user) {
        try {
          const workouts = await workoutService.getWorkouts()
          setWorkoutHistory(workouts)
          setWorkoutStats(calculateStatistics(workouts))
        } catch (error) {
          console.error("Error syncing data:", error)
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're offline",
        description: "The app will continue to work with your saved data",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [user, toast])

  // If user is not authenticated, show auth form
  if (!isAuthLoading && !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">Kettlebell Tracker</h1>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to Kettlebell Tracker</h2>
              <p className="text-muted-foreground">Sign in or create an account to track your workouts in the cloud</p>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-2 sm:p-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Kettlebell Tracker</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <PWARegister />
          <DataExport workouts={workoutHistory} onImport={importWorkoutData} />
          <Button variant="ghost" size="icon" onClick={clearWorkoutData}>
            <RotateCcw className="h-5 w-5" />
          </Button>
          <UserProfile />
        </div>
      </div>

      {isWorkoutActive ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                {isResting ? "Rest Time" : `Set ${currentSet} of ${sets}`}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={endWorkout}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {isResting ? (
              <div className="space-y-4">
                {/* Circular progress for rest timer */}
                <div className="flex flex-col items-center justify-center">
                  <CircularProgress value={restProgress} size={200} strokeWidth={12} className="mb-2">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl sm:text-5xl font-bold">{timeRemaining}</div>
                      <div className="text-sm text-muted-foreground">seconds</div>
                    </div>
                  </CircularProgress>

                  {/* Add more rest time buttons */}
                  <div className="flex gap-2 mt-4">
                    {REST_TIME_INCREMENTS.map((seconds) => (
                      <Button
                        key={seconds}
                        variant="outline"
                        size="sm"
                        onClick={() => addRestTime(seconds)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-base sm:text-lg font-medium text-primary">{exercise}</span>
                  <div className="flex justify-center items-center gap-4">
                    {isBodyweight ? (
                      <User className="h-6 sm:h-8 w-6 sm:w-6 text-primary" />
                    ) : (
                      <>
                        <Dumbbell className="h-6 sm:h-8 w-6 sm:w-6 text-primary" />
                        <span className="text-2xl sm:text-3xl font-bold">{weight}kg</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-3 sm:py-4">
                  <div className="text-5xl sm:text-6xl font-bold mb-2">{reps}</div>
                  <div className="text-muted-foreground">reps</div>
                </div>

                <div className="flex justify-center gap-2">
                  {Array.from({ length: sets }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 sm:w-3 h-2 sm:h-3 rounded-full",
                        i + 1 < currentSet
                          ? "bg-primary"
                          : i + 1 === currentSet
                            ? "bg-primary animate-pulse"
                            : "bg-muted",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 p-4 sm:p-6">
            {isResting ? (
              <>
                {/* More prominent pause button */}
                <Button
                  variant={isPaused ? "default" : "destructive"}
                  className={cn("flex-1 text-base font-medium h-12", isPaused ? "" : "animate-pulse")}
                  onClick={togglePause}
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={skipRest}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip Rest
                </Button>
              </>
            ) : (
              <Button className="w-full" size="lg" onClick={completeSet}>
                Complete Set
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-center text-base sm:text-lg">Configure Workout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Exercise Type Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Exercise</h3>
                  </div>
                  <CustomExerciseDialog onExercisesChange={handleCustomExercisesChange} />
                </div>
                <Select value={exercise} onValueChange={setExercise}>
                  <SelectTrigger>
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
                  <h3 className="font-medium">Bodyweight Exercise</h3>
                </div>
                <Switch
                  checked={isBodyweight}
                  onCheckedChange={setIsBodyweight}
                  aria-label="Toggle bodyweight exercise"
                />
              </div>

              {/* Weight Selection - only show if not bodyweight */}
              {!isBodyweight && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Weight</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[12, 16, 24, 32, 40].map((w) => (
                      <Button
                        key={w}
                        variant={weight === w ? "default" : "outline"}
                        onClick={() => setWeight(w)}
                        className="h-10 sm:h-12"
                      >
                        {w}kg
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reps Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {reps}
                    </span>
                    <h3 className="font-medium">Reps</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">{reps} reps</span>
                </div>
                <Slider value={[reps]} min={1} max={30} step={1} onValueChange={(value) => setReps(value[0])} />
              </div>

              {/* Sets Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {sets}
                    </span>
                    <h3 className="font-medium">Sets</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">{sets} sets</span>
                </div>
                <Slider value={[sets]} min={1} max={10} step={1} onValueChange={(value) => setSets(value[0])} />
              </div>

              {/* Delay Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Rest Time</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">{delay} seconds</span>
                </div>
                <Slider value={[delay]} min={10} max={180} step={5} onValueChange={(value) => setDelay(value[0])} />
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6">
              <Button className="w-full" size="lg" onClick={startWorkout}>
                <Play className="mr-2 h-4 w-4" />
                Start Workout
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4 sm:mt-6 w-full max-w-md mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history" className="text-xs sm:text-sm">
                  History
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs sm:text-sm">
                  Stats
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs sm:text-sm">
                  Calendar
                </TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <WorkoutHistory workouts={workoutHistory} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="stats" className="mt-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <WorkoutStats stats={workoutStats} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="calendar" className="mt-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <WorkoutCalendar workouts={workoutHistory} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}
