import * as Phaser from 'phaser'
import spaceBackgroundSvg from '../assets/images/space-background.svg'

export class MenuScene extends Phaser.Scene {
  private startKey!: Phaser.Input.Keyboard.Key
  private highScore: number = 0

  constructor() {
    super({ key: 'MenuScene' })
  }

  preload() {
    // Load space background
    this.load.image('spaceBackground', spaceBackgroundSvg)
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQIHWP8//8/AzYwiklkAQDiAwMDA+MjAAQBABAJ8FsAAAAASUVORK5CYII=')
  }

  async create() {
    const { width, height } = this.cameras.main

    // Beautiful space background
    const background = this.add.image(width / 2, height / 2, 'spaceBackground')
    background.setDisplaySize(width, height)

    // Add floating particles for atmosphere
    this.add.particles(width / 2, height / 2, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 10, max: 30 },
      scale: { min: 0.3, max: 1 },
      alpha: { min: 0.3, max: 0.8 },
      lifespan: { min: 3000, max: 6000 },
      frequency: 200
    })

    // Enhanced title with glow effect
    const title = this.add.text(width / 2, height / 3, 'SPACE SHOOTER', {
      fontSize: '64px',
      color: '#22d3ee',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      stroke: '#0891b2',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
    
    // Add pulsing glow animation to title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Load high score
    try {
      if (typeof window !== 'undefined' && window.spark) {
        const storedHighScore = await window.spark.kv.get<number>('highScore')
        this.highScore = storedHighScore || 0
      }
    } catch (error) {
      console.log('Could not load high score:', error)
    }

    // Enhanced high score display
    const highScoreText = this.add.text(width / 2, height / 2, `High Score: ${this.highScore}`, {
      fontSize: '32px',
      color: '#fbbf24',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      stroke: '#f59e0b',
      strokeThickness: 2
    })
    highScoreText.setOrigin(0.5)

    // Enhanced instructions with better styling
    const instructions = this.add.text(width / 2, height / 2 + 80, 
      'Arrow Keys or WASD to Move\nSPACE to Shoot\n\nPress ENTER to Start', {
      fontSize: '20px',
      color: '#4fd1c7',
      fontFamily: 'Orbitron',
      align: 'center',
      stroke: '#0f766e',
      strokeThickness: 1
    })
    instructions.setOrigin(0.5)
    
    // Blinking animation for start instruction
    const startHint = this.add.text(width / 2, height / 2 + 160, 'PRESS ENTER', {
      fontSize: '24px',
      color: '#ff6b35',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      stroke: '#e55039',
      strokeThickness: 2
    })
    startHint.setOrigin(0.5)
    
    this.tweens.add({
      targets: startHint,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    })

    // Input
    this.startKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.startKey.on('down', () => {
      this.scene.start('GameScene')
    })

    // Animate background rotation
    this.tweens.add({
      targets: background,
      rotation: Math.PI * 2,
      duration: 60000,
      repeat: -1,
      ease: 'Linear'
    })
  }
}