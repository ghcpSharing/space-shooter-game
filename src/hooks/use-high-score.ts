import { useKV } from '@github/spark/hooks'

export function useHighScore() {
  const [highScore, setHighScore] = useKV('highScore', 0)
  
  const updateHighScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore)
      return true // New high score achieved
    }
    return false
  }

  return {
    highScore,
    updateHighScore
  }
}