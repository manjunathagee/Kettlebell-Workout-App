"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Wifi, WifiOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function PWARegister() {
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "You're back online",
        description: "Your data will sync automatically",
      })
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
  }, [])

  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("Service Worker registration failed: ", registrationError)
          })
      })
    }

    // Handle PWA install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e)
      setIsInstallable(true)
    })
  }, [])

  const handleInstallClick = () => {
    if (!installPrompt) return

    // Show the install prompt
    installPrompt.prompt()

    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
        setIsInstallable(false)
      } else {
        console.log("User dismissed the install prompt")
      }
      setInstallPrompt(null)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <div className="flex items-center text-xs text-amber-600 gap-1">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      )}
      {isOnline && (
        <div className="flex items-center text-xs text-green-600 gap-1">
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </div>
      )}
      {isInstallable && (
        <Button variant="outline" size="sm" className="text-xs" onClick={handleInstallClick}>
          <Download className="h-3 w-3 mr-1" />
          Install App
        </Button>
      )}
    </div>
  )
}
