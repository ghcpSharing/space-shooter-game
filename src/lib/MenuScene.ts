import * as Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  private startKey!: Phaser.Input.Keyboard.Key
  private highScore: number = 0

  constructor() {
    super({ key: 'MenuScene' })
  }

  preload() {
    // Create simple background
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIHWP8//8/AzYwiklkAQDeAgYBg+EvAAAAAAASUVORK5CYII=')
  }

  async create() {
    const { width, height } = this.cameras.main

    // Background
    const starfield = this.add.tileSprite(0, 0, width, height, 'star')
    starfield.setOrigin(0, 0)
    starfield.setTileScale(2, 2)

    // Title
    const title = this.add.text(width / 2, height / 3, 'SPACE SHOOTER', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Orbitron',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)

    // Load high score
    try {
      if (typeof window !== 'undefined' && window.spark) {
        const storedHighScore = await window.spark.kv.get<number>('highScore')
        this.highScore = storedHighScore || 0
      }
    } catch (error) {
      console.log('Could not load high score:', error)
    }

    // High score display
    const highScoreText = this.add.text(width / 2, height / 2, `High Score: ${this.highScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Orbitron'
    })
    highScoreText.setOrigin(0.5)

    // Instructions
    const instructions = this.add.text(width / 2, height / 2 + 60, 
      'Arrow Keys or WASD to Move\nSPACE to Shoot\n\nPress ENTER to Start', {
      fontSize: '18px',
      color: '#00ffff',
      fontFamily: 'Orbitron',
      align: 'center'
    })
    instructions.setOrigin(0.5)

    // Input
    this.startKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.startKey.on('down', () => {
      this.scene.start('GameScene')
    })

    // Animate starfield
    this.tweens.add({
      targets: starfield,
      tilePositionY: -height,
      duration: 10000,
      repeat: -1
    })
  }
}