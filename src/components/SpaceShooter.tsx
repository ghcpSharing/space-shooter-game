import React, { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser'
import { MenuScene } from '../lib/MenuScene'
import { GameScene } from '../lib/GameScene'
import { useIsMobile } from '../hooks/use-mobile'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface SpaceShooterProps {
  width?: number
  height?: number
}

const SpaceShooter: React.FC<SpaceShooterProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const isMobile = useIsMobile()
  const [gameStarted, setGameStarted] = useState(false)

  // Adjust dimensions for mobile
  const gameWidth = isMobile ? Math.min(window.innerWidth - 32, 400) : width
  const gameHeight = isMobile ? Math.min(window.innerHeight - 200, 600) : height

  useEffect(() => {
    if (!gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameWidth,
      height: gameHeight,
      parent: gameRef.current,
      backgroundColor: '#0a0a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MenuScene, GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    phaserGameRef.current = new Phaser.Game(config)

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [gameWidth, gameHeight])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="mb-6 text-center">
        <h1 className="game-title text-4xl md:text-6xl text-primary mb-2">
          SPACE SHOOTER
        </h1>
        <p className="text-muted-foreground">
          Defend Earth from alien invaders!
        </p>
      </div>

      <Card className="p-4 mb-4">
        <div 
          ref={gameRef}
          className="border-2 border-primary/50 rounded-lg shadow-2xl bg-black"
          style={{ 
            maxWidth: '100%',
            maxHeight: '70vh'
          }}
        />
      </Card>

      {/* Mobile Touch Controls */}
      {isMobile && (
        <Card className="p-4 w-full max-w-md">
          <h3 className="game-ui text-lg mb-3 text-center">Touch Controls</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div></div>
            <Button variant="outline" size="lg" disabled>↑</Button>
            <div></div>
            <Button variant="outline" size="lg" disabled>←</Button>
            <Button variant="outline" size="lg" disabled>↓</Button>
            <Button variant="outline" size="lg" disabled>→</Button>
          </div>
          <Button className="w-full" size="lg" variant="default" disabled>
            🚀 FIRE
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Touch controls are visual only. Use on-screen keyboard for actual gameplay.
          </p>
        </Card>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center max-w-md">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>🎮 <strong>Controls:</strong></p>
          <p>Arrow Keys or WASD to move</p>
          <p>SPACE to shoot • ENTER to start • R to restart</p>
          <p>🎯 Destroy enemies to earn points!</p>
          <p>💚 You have 3 lives - don't let enemies hit you!</p>
        </div>
      </div>
    </div>
  )
}

export default SpaceShooter
