"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Dumbbell, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { WorkoutEntry } from "../data/workout-history"

interface WorkoutHistoryProps {
  workouts: WorkoutEntry[]
  showDate?: boolean
  itemsPerPage?: number
}

export function WorkoutHistory({ workouts, showDate = true, itemsPerPage = 5 }: WorkoutHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)

  if (workouts.length === 0) {
    return <div className="text-center text-sm text-gray-500 py-8">No workout history available</div>
  }

  // Calculate pagination
  const totalPages = Math.ceil(workouts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, workouts.length)
  const currentWorkouts = workouts.slice(startIndex, endIndex)

  // Handle page navigation
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {currentWorkouts.map((workout) => (
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {workouts.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-xs">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
