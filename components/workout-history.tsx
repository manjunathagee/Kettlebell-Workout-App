import { format } from "date-fns"
import { Dumbbell, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { WorkoutEntry } from "../data/workout-history"

interface WorkoutHistoryProps {
  workouts: WorkoutEntry[]
  showDate?: boolean
}

export function WorkoutHistory({ workouts, showDate = true }: WorkoutHistoryProps) {
  if (workouts.length === 0) {
    return <div className="text-center text-sm text-gray-500 py-8">No workout history available</div>
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {workouts.map((workout) => (
        <Card key={workout.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center border-b">
              <div className="bg-primary/10 p-3 sm:p-4 flex items-center justify-center">
                {workout.isBodyweight ? (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                ) : (
                  <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                )}
              </div>
              <div className="p-3 sm:p-4 flex-1">
                <div className="font-medium text-sm sm:text-base">{workout.exercise}</div>
                {showDate && (
                  <div className="text-xs sm:text-sm text-gray-500">{format(new Date(workout.date), "PPP p")}</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x text-center py-2">
              <div className="px-2">
                <div className="text-xs sm:text-sm text-gray-500">{workout.isBodyweight ? "Type" : "Weight"}</div>
                <div className="font-medium text-sm sm:text-base">
                  {workout.isBodyweight ? "Bodyweight" : `${workout.weight}kg`}
                </div>
              </div>
              <div className="px-2">
                <div className="text-xs sm:text-sm text-gray-500">Sets</div>
                <div className="font-medium text-sm sm:text-base">
                  {workout.completedSets}/{workout.sets}
                </div>
              </div>
              <div className="px-2">
                <div className="text-xs sm:text-sm text-gray-500">Reps</div>
                <div className="font-medium text-sm sm:text-base">{workout.reps}</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                {!workout.isBodyweight && (
                  <>
                    <span>Total lifted:</span>
                    <span className="font-medium">{workout.totalWeight.toLocaleString()}kg</span>
                  </>
                )}
                {workout.isBodyweight && (
                  <>
                    <span>Total reps:</span>
                    <span className="font-medium">{workout.reps * workout.completedSets}</span>
                  </>
                )}
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{Math.floor(workout.duration / 60)} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
