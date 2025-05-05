"use client"

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface WorkoutStatsProps {
  stats: {
    totalWeightLifted: number
    totalWorkouts: number
    avgWeightPerWorkout: number
    mostUsedWeight: number
    mostCommonExercise?: string
    workoutsByDay: { name: string; workouts: number }[]
    weightOverTime: { date: string; weight: number }[]
  }
}

export function WorkoutStats({ stats }: WorkoutStatsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Weight Lifted</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalWeightLifted.toLocaleString()}kg</div>
            <p className="text-xs text-muted-foreground">Across {stats.totalWorkouts} workouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Most Used Weight</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl sm:text-2xl font-bold">{stats.mostUsedWeight}kg</div>
            <p className="text-xs text-muted-foreground">Your preferred kettlebell</p>
          </CardContent>
        </Card>
      </div>

      {stats.mostCommonExercise && (
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Favorite Exercise</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl sm:text-2xl font-bold">{stats.mostCommonExercise}</div>
            <p className="text-xs text-muted-foreground">Your most performed exercise</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Weight Lifted Over Time</CardTitle>
          <CardDescription className="text-xs">Total weight lifted in recent workouts</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <ChartContainer
            config={{
              weight: {
                label: "Weight (kg)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[180px] sm:h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weightOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Workouts by Day</CardTitle>
          <CardDescription className="text-xs">Number of workouts per day of the week</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <ChartContainer
            config={{
              workouts: {
                label: "Workouts",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[180px] sm:h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.workoutsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="workouts" fill="var(--color-workouts)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
