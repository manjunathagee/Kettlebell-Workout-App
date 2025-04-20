// Base64 encoded short notification sound
export const NOTIFICATION_SOUND_BASE64 =
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAGUACFhYWFhYWFhYWFhYWFhYWFhYWFvb29vb29vb29vb29vb29vb29vb3T09PT09PT09PT09PT09PT09PT0/////////////////////8AAAA8TEFNRTMuMTAwBEgAAAAAAAAAABUgJAMGQQABmgAABlAiznawAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="

// Function to play a notification sound
export const playNotificationSound = () => {
  try {
    // Try to use the base64 encoded sound
    const audio = new Audio(NOTIFICATION_SOUND_BASE64)
    audio.volume = 0.5
    audio.play().catch((error) => {
      console.error("Error playing base64 notification sound:", error)
      playFallbackBeep()
    })
  } catch (error) {
    console.error("Error creating audio from base64:", error)
    playFallbackBeep()
  }
}

// Fallback beep sound using Web Audio API
export const playFallbackBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sine"
    oscillator.frequency.value = 800
    gainNode.gain.value = 0.3

    oscillator.start()

    // Stop after 200ms
    setTimeout(() => {
      oscillator.stop()
      // Play a second beep after a short pause
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        oscillator2.connect(gainNode)
        oscillator2.type = "sine"
        oscillator2.frequency.value = 1000
        oscillator2.start()
        setTimeout(() => oscillator2.stop(), 200)
      }, 200)
    }, 200)
  } catch (error) {
    console.error("Error playing fallback beep:", error)
  }
}
