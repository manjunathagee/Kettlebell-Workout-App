"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import type { WorkoutEntry } from "../data/workout-history"

interface DataExportProps {
  workouts: WorkoutEntry[]
  onImport: (workouts: WorkoutEntry[]) => void
}

export function DataExport({ workouts, onImport }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    try {
      // Create a JSON blob
      const data = JSON.stringify(workouts, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create a download link and trigger it
      const a = document.createElement("a")
      a.href = url
      a.download = `kettlebell-tracker-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your workout data has been exported",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "Could not export your workout data",
        variant: "destructive",
      })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content) as WorkoutEntry[]

        // Validate the imported data
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid data format")
        }

        // Check if each item has the required fields
        const isValid = importedData.every(
          (item) =>
            item.id &&
            item.date &&
            typeof item.weight === "number" &&
            typeof item.reps === "number" &&
            typeof item.sets === "number",
        )

        if (!isValid) {
          throw new Error("Invalid workout data format")
        }

        onImport(importedData)
        setIsOpen(false)
        toast({
          title: "Import successful",
          description: `Imported ${importedData.length} workouts`,
        })
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: "Could not import workout data. Invalid format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} title="Export Data">
        <Download className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" title="Import Data">
            <Upload className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Workout Data</DialogTitle>
            <DialogDescription>Upload a previously exported workout data file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Workout Data File</Label>
              <Input id="file" type="file" accept=".json" onChange={handleImport} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
