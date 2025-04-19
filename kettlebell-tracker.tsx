"use client"

import { useState, useEffect, useRef } from "react"
import { Dumbbell, Clock, RotateCcw, Play, Pause, SkipForward, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { WorkoutHistory } from "./components/workout-history"
import { WorkoutStats } from "./components/workout-stats"
import { WorkoutCalendar } from "./components/workout-calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type WorkoutEntry, calculateStatistics } from "./data/workout-history"

// Available exercise types
const exerciseTypes = [
  "Swing",
  "Clean",
  "Press",
  "Snatch",
  "Goblet Squat",
  "Turkish Get-Up",
  "Deadlift",
  "Row",
  "Lunge",
]

// LocalStorage key
const STORAGE_KEY = "kettlebell-tracker-data"

export default function KettlebellTracker() {
  const [weight, setWeight] = useState(24)
  const [reps, setReps] = useState(10)
  const [sets, setSets] = useState(3)
  const [delay, setDelay] = useState(60)
  const [exercise, setExercise] = useState("Swing")

  // Workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(delay)
  const [isPaused, setIsPaused] = useState(false)

  // Workout history state
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>([])
  const [workoutStats, setWorkoutStats] = useState(calculateStatistics([]))

  // Tab state
  const [activeTab, setActiveTab] = useState("history")

  const timerRef = useRef(null)

  // Load workout history from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as WorkoutEntry[]
        setWorkoutHistory(parsedData)
        setWorkoutStats(calculateStatistics(parsedData))
      } catch (error) {
        console.error("Error loading workout data:", error)
      }
    }
  }, [])

  // Save workout to localStorage
  const saveWorkout = (workout: WorkoutEntry) => {
    const updatedHistory = [workout, ...workoutHistory]
    setWorkoutHistory(updatedHistory)

    // Update stats
    const updatedStats = calculateStatistics(updatedHistory)
    setWorkoutStats(updatedStats)

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  }

  // Clear all workout data
  const clearWorkoutData = () => {
    if (confirm("Are you sure you want to clear all workout data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY)
      setWorkoutHistory([])
      setWorkoutStats(calculateStatistics([]))
    }
  }

  // Start the workout
  const startWorkout = () => {
    setIsWorkoutActive(true)
    setCurrentSet(1)
    setIsResting(false)
    setIsPaused(false)
  }

  // End the workout
  const endWorkout = () => {
    setIsWorkoutActive(false)
    clearInterval(timerRef.current)

    // Only save if at least one set was completed
    if (currentSet > 1) {
      const completedSets = currentSet - 1
      const totalWeight = weight * reps * completedSets
      const duration = completedSets * reps * 3 + (completedSets - 1) * delay // Rough estimate

      // Create workout entry
      const workout: WorkoutEntry = {
        id: `workout-${Date.now()}`,
        date: new Date().toISOString(),
        weight,
        reps,
        sets,
        completedSets,
        totalWeight,
        duration,
        exercise,
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

  // Handle rest timer
  useEffect(() => {
    if (isResting && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsResting(false)
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Kettlebell Tracker</h1>
        <Button variant="ghost" size="icon" onClick={clearWorkoutData}>
          <RotateCcw className="h-5 w-5" />
        </Button>
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
                <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                  <div className="text-4xl sm:text-5xl font-bold mb-2">{timeRemaining}</div>
                  <div className="text-gray-500">seconds remaining</div>
                </div>
                <Progress value={restProgress} className="h-2" />
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-base sm:text-lg font-medium text-primary">{exercise}</span>
                  <div className="flex justify-center items-center gap-4">
                    <Dumbbell className="h-6 sm:h-8 w-6 sm:w-8 text-primary" />
                    <span className="text-2xl sm:text-3xl font-bold">{weight}kg</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-3 sm:py-4">
                  <div className="text-5xl sm:text-6xl font-bold mb-2">{reps}</div>
                  <div className="text-gray-500">reps</div>
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
                            : "bg-gray-200",
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
                <Button variant="outline" className="flex-1" onClick={togglePause}>
                  {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
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
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Exercise</h3>
                </div>
                <Select value={exercise} onValueChange={setExercise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Weight</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[12, 24, 32, 40].map((w) => (
                    <Button
                      key={w}
                      variant={weight === w ? "default" : "outline"}
                      onClick={() => setWeight(w)}
                      className={cn("h-10 sm:h-12", weight === w && "bg-primary text-primary-foreground")}
                    >
                      {w}kg
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reps Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {reps}
                    </span>
                    <h3 className="font-medium">Reps</h3>
                  </div>
                  <span className="text-sm text-gray-500">{reps} reps</span>
                </div>
                <Slider value={[reps]} min={1} max={30} step={1} onValueChange={(value) => setReps(value[0])} />
              </div>

              {/* Sets Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {sets}
                    </span>
                    <h3 className="font-medium">Sets</h3>
                  </div>
                  <span className="text-sm text-gray-500">{sets} sets</span>
                </div>
                <Slider value={[sets]} min={1} max={10} step={1} onValueChange={(value) => setSets(value[0])} />
              </div>

              {/* Delay Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium">Rest Time</h3>
                  </div>
                  <span className="text-sm text-gray-500">{delay} seconds</span>
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
                    <WorkoutHistory workouts={workoutHistory} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="stats" className="mt-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <WorkoutStats stats={workoutStats} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="calendar" className="mt-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <WorkoutCalendar workouts={workoutHistory} />
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
