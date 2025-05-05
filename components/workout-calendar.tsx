"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getMonth,
  getYear,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import type { WorkoutEntry } from "../data/workout-history"

interface WorkoutCalendarProps {
  workouts: WorkoutEntry[]
}

export function WorkoutCalendar({ workouts }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "year">("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  // Get days in current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get workouts for current month
  const workoutsInMonth = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date)
    return getMonth(workoutDate) === getMonth(currentDate) && getYear(workoutDate) === getYear(currentDate)
  })

  // Count workouts per day in current month
  const workoutsByDay = daysInMonth.map((day) => {
    const dayWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return isSameDay(workoutDate, day)
    })

    return {
      date: day,
      count: dayWorkouts.length,
      totalWeight: dayWorkouts.reduce((sum, workout) => sum + workout.totalWeight, 0),
      workouts: dayWorkouts,
    }
  })

  // Get monthly data for yearly view
  const monthlyData = Array.from({ length: 12 }).map((_, monthIndex) => {
    const monthWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return getMonth(workoutDate) === monthIndex && getYear(workoutDate) === getYear(currentDate)
    })

    return {
      month: format(new Date(getYear(currentDate), monthIndex, 1), "MMM"),
      count: monthWorkouts.length,
      totalWeight: monthWorkouts.reduce((sum, workout) => sum + workout.totalWeight, 0),
    }
  })

  // Calculate yearly stats
  const totalWorkoutsThisYear = monthlyData.reduce((sum, month) => sum + month.count, 0)
  const averageWorkoutsPerMonth = totalWorkoutsThisYear / 12

  // Calculate monthly stats
  const totalWorkoutsThisMonth = workoutsInMonth.length
  const averageWorkoutsPerWeek = totalWorkoutsThisMonth / 4 // Approximate

  // Handle day click
  const handleDayClick = (day: Date, dayWorkouts: WorkoutEntry[]) => {
    if (dayWorkouts.length > 0) {
      setSelectedDate(day)
      setIsDialogOpen(true)
    }
  }

  // Get workouts for selected date
  const selectedDateWorkouts = selectedDate
    ? workouts.filter((workout) => {
        const workoutDate = new Date(workout.date)
        return isSameDay(workoutDate, selectedDate)
      })
    : []

  return (
    <div className="space-y-4">
      <Tabs defaultValue="month" onValueChange={(value) => setView(value as "month" | "year")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="month" className="text-xs sm:text-sm">
            Month
          </TabsTrigger>
          <TabsTrigger value="year" className="text-xs sm:text-sm">
            Year
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-base sm:text-lg font-medium">{format(currentDate, "MMMM yyyy")}</h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}

            {Array.from({ length: getDay(monthStart) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 sm:h-12 rounded-md" />
            ))}

            {workoutsByDay.map((day, i) => (
              <div
                key={i}
                className={`h-8 sm:h-12 rounded-md flex flex-col items-center justify-center text-xs sm:text-sm border 
                  ${day.count > 0 ? "bg-primary/10 border-primary/20 cursor-pointer hover:bg-primary/20" : "border-gray-200"}
                `}
                onClick={() => handleDayClick(day.date, day.workouts)}
              >
                <span className="font-medium">{format(day.date, "d")}</span>
                {day.count > 0 && <span className="text-xs text-primary font-medium">{day.count}</span>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-xs sm:text-sm font-medium">Workouts This Month</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-xl sm:text-2xl font-bold">{totalWorkoutsThisMonth}</div>
                <p className="text-xs text-muted-foreground">~{averageWorkoutsPerWeek.toFixed(1)} per week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Weight</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-xl sm:text-2xl font-bold">
                  {workoutsInMonth.reduce((sum, workout) => sum + workout.totalWeight, 0).toLocaleString()}kg
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="year" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setCurrentDate(new Date(getYear(currentDate) - 1, 0, 1))}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              {getYear(currentDate) - 1}
            </Button>
            <h2 className="text-base sm:text-lg font-medium">{getYear(currentDate)}</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setCurrentDate(new Date(getYear(currentDate) + 1, 0, 1))}
            >
              {getYear(currentDate) + 1}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <ChartContainer
            config={{
              workouts: {
                label: "Workouts",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[180px] sm:h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Workouts" fill="var(--color-workouts)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-xs sm:text-sm font-medium">Workouts This Year</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-xl sm:text-2xl font-bold">{totalWorkoutsThisYear}</div>
                <p className="text-xs text-muted-foreground">~{averageWorkoutsPerMonth.toFixed(1)} per month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Weight</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-xl sm:text-2xl font-bold">
                  {monthlyData.reduce((sum, month) => sum + month.totalWeight, 0).toLocaleString()}kg
                </div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog to show workouts for selected date */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Workouts on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            {selectedDateWorkouts.map((workout) => (
              <Card key={workout.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-3 sm:p-4 flex items-center justify-between border-b">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{workout.exercise}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{format(new Date(workout.date), "p")}</div>
                    </div>
                    {workout.isBodyweight ? (
                      <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Bodyweight</div>
                    ) : (
                      <div className="text-sm sm:text-base font-semibold">{workout.weight}kg</div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 divide-x text-center py-2">
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
                    <div className="px-2">
                      <div className="text-xs sm:text-sm text-gray-500">Total</div>
                      <div className="font-medium text-sm sm:text-base">
                        {workout.isBodyweight
                          ? `${workout.reps * workout.completedSets} reps`
                          : `${workout.totalWeight}kg`}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{Math.floor(workout.duration / 60)} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get day of week (0-6)
function getDay(date: Date): number {
  return date.getDay()
}
