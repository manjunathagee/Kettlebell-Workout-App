// Define workout history data structure
export interface WorkoutEntry {
  id: string
  date: string
  weight: number
  reps: number
  sets: number
  completedSets: number
  totalWeight: number
  duration: number // in seconds
  exercise: string
  isBodyweight?: boolean
}

// Calculate statistics from workout history
export const calculateStatistics = (history: WorkoutEntry[]) => {
  // Total weight lifted
  const totalWeightLifted = history.reduce((sum, entry) => sum + entry.totalWeight, 0)

  // Total workouts
  const totalWorkouts = history.length

  // Average weight per workout
  const avgWeightPerWorkout = totalWorkouts > 0 ? totalWeightLifted / totalWorkouts : 0

  // Most used weight (excluding bodyweight exercises)
  const weightCounts = history
    .filter((entry) => !entry.isBodyweight && entry.weight > 0)
    .reduce(
      (counts, entry) => {
        counts[entry.weight] = (counts[entry.weight] || 0) + 1
        return counts
      },
      {} as Record<number, number>,
    )

  const mostUsedWeight = Object.entries(weightCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0

  // Workouts by day of week
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const workoutsByDay = history.reduce((days, entry) => {
    const day = new Date(entry.date).getDay()
    days[day] = (days[day] || 0) + 1
    return days
  }, Array(7).fill(0))

  const workoutsByDayData = dayNames.map((name, index) => ({
    name,
    workouts: workoutsByDay[index],
  }))

  // Weight lifted over time (last 7 entries)
  const recentWorkouts = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7)

  const weightOverTime = recentWorkouts.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    weight: entry.totalWeight,
  }))

  // Most common exercise
  const exerciseCounts = history.reduce(
    (counts, entry) => {
      counts[entry.exercise] = (counts[entry.exercise] || 0) + 1
      return counts
    },
    {} as Record<string, number>,
  )

  const mostCommonExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

  // Count bodyweight exercises
  const bodyweightCount = history.filter((entry) => entry.isBodyweight).length

  return {
    totalWeightLifted,
    totalWorkouts,
    avgWeightPerWorkout,
    mostUsedWeight: Number(mostUsedWeight),
    mostCommonExercise,
    workoutsByDay: workoutsByDayData,
    weightOverTime,
    bodyweightCount,
  }
}
