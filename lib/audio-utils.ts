// Function to play a notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create oscillator for first beep
    const oscillator1 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator1.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure sound
    oscillator1.type = "sine"
    oscillator1.frequency.value = 800 // Hz
    gainNode.gain.value = 0.5 // Volume

    // Play first beep
    oscillator1.start()

    // Stop after 200ms and play second beep
    setTimeout(() => {
      oscillator1.stop()

      // Play second beep after a short pause
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        oscillator2.connect(gainNode)
        oscillator2.type = "sine"
        oscillator2.frequency.value = 1000 // Higher pitch for second beep
        oscillator2.start()
        setTimeout(() => oscillator2.stop(), 200)
      }, 100)
    }, 200)
  } catch (error) {
    console.error("Error playing notification sound:", error)
  }
}
