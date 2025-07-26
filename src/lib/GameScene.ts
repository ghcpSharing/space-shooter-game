import * as Phaser from 'phaser'
import { Player, Enemy, Bullet } from '../lib/gameObjects'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private bullets!: Phaser.GameObjects.Group
  private enemies!: Phaser.GameObjects.Group
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private lives: number = 3
  private livesText!: Phaser.GameObjects.Text
  private gameOver: boolean = false
  private spaceKey!: Phaser.Input.Keyboard.Key
  private enemySpawnTimer: number = 0
  private enemySpawnDelay: number = 1000
  private explosions!: Phaser.GameObjects.Group
  private starfield!: Phaser.GameObjects.TileSprite

  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // Create simple colored rectangles as sprites
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA8ElEQVRYhe2WMQ6DMAxFX0OvwMpIR9YO7J3YmTqxMnVgZeTKXAFOQRMcJ05ChdSRflrHfv/ZcWzAsiypGEQkAWBrrQXnnKOqUkpp6//bACJqjDGttfbe3wNorZW1VgD4jgHnXFlVVWWM8VQUReWcez4A4IfWun9FREqp2Zroz0Frrbe+ADMzA8Cj4pK1dj//vSucc4cA8DZGax0553rnXOecu8a2lFK+AGJra+tWfd8/lFJtSqmdw15rfdkl+JttV0rZzSwi0jrnWufc1Tm3VVUVOeeKp6qqDhEJAOCciIaIaLDWCgC0DdN3X7zUx31cJEeyfQAbZD6XfcgRzAAAAABJRU5ErkJggg==')
    
    this.load.image('enemy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA6klEQVRYhe2WQQ6CMBBFXyOeQVfGJW5dufKMrlyZxI1L3XgGPYOegDegJzA2Y9u0P6VMCZrwk0nTmffpn5m2A4Cqqj4gTdNMnHNzEflW1/dJVVVf7/1ERLTX2hZCiL5pmmnbth8A4Hcv+c8FRHQCAJY/LgIgB4BVYzKb9swMEUkB4KQVVVXd4zjuuq47MMYVAC5KqbFSaj8MA8MYc1BK7WOMxyiKzjHGBwCMLcuaGGP6SimllCoEALttkc8FnPctIipjzFpEZkqpCyKqKKVWxtj3ZIx5dF13i6IoHMdxZoy5vvNFPBcA4AdACOEBAK21s/f+AdwOj9r0TtgAAAAASUVORK5CYII=')
    
    this.load.image('bullet', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAQCAYAAAArij59AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAARklEQVQYlYVQQQoAIAgLfV//eX8VBcLiQnATpZSEw/8fEREAICJqrQ0AqCpVdR8zs7u7qiozs7tXVZlZIvKcczf/cCHE4QGWvBULhPAh2QAAAABJRU5ErkJggg==')
    
    // Create starfield background
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIHWP8//8/AzYwiklkAQDeAgYBg+EvAAAAAAASUVORK5CYII=')
  }

  create() {
    const { width, height } = this.cameras.main

    // Create scrolling starfield
    this.starfield = this.add.tileSprite(0, 0, width, height, 'star')
    this.starfield.setOrigin(0, 0)
    this.starfield.setTileScale(2, 2)

    // Create player
    this.player = new Player(this, width / 2, height - 80)
    this.player.setTint(0x00ff00) // Green tint

    // Create groups
    this.bullets = this.add.group()
    this.enemies = this.add.group()
    this.explosions = this.add.group()

    // Input
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Orbitron'
    })

    this.livesText = this.add.text(16, 50, 'Lives: 3', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Orbitron'
    })

    // Collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this)
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this)
  }

  update(time: number, delta: number) {
    if (this.gameOver) return

    // Scroll starfield
    this.starfield.tilePositionY -= 1

    // Update player
    this.player.update(time)

    // Handle shooting
    if (this.spaceKey.isDown && this.player.canFire(time)) {
      this.fireBullet()
      this.player.setLastFired(time)
    }

    // Update bullets
    this.bullets.children.entries.forEach((bullet) => {
      (bullet as Bullet).update()
    })

    // Update enemies
    this.enemies.children.entries.forEach((enemy) => {
      (enemy as Enemy).update()
    })

    // Spawn enemies
    this.enemySpawnTimer += delta
    if (this.enemySpawnTimer > this.enemySpawnDelay) {
      this.spawnEnemy()
      this.enemySpawnTimer = 0
      
      // Increase difficulty over time
      if (this.enemySpawnDelay > 300) {
        this.enemySpawnDelay -= 5
      }
    }
  }

  private fireBullet() {
    const bullet = new Bullet(this, this.player.x, this.player.y - 20)
    bullet.setTint(0x00ffff) // Cyan tint
    this.bullets.add(bullet)
  }

  private spawnEnemy() {
    const x = Phaser.Math.Between(50, this.cameras.main.width - 50)
    const speed = Phaser.Math.Between(100, 200)
    const enemy = new Enemy(this, x, -50, speed)
    enemy.setTint(0xff4400) // Orange-red tint
    this.enemies.add(enemy)
  }

  private bulletHitEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    // Create explosion effect
    this.createExplosion(enemy.x, enemy.y)
    
    // Destroy objects
    bullet.destroy()
    enemy.destroy()
    
    // Update score
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)
    
    // Store high score
    this.storeHighScore()
  }

  private playerHitEnemy(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    // Create explosion effect
    this.createExplosion(enemy.x, enemy.y)
    
    // Destroy enemy
    enemy.destroy()
    
    // Lose a life
    this.lives--
    this.livesText.setText('Lives: ' + this.lives)
    
    if (this.lives <= 0) {
      this.endGame()
    }
  }

  private createExplosion(x: number, y: number) {
    // Simple explosion effect using particles
    const explosion = this.add.particles(x, y, 'star', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      tint: 0xff6600,
      lifespan: 300,
      quantity: 8
    })
    
    // Remove after animation
    this.time.delayedCall(300, () => {
      explosion.destroy()
    })
  }

  private endGame() {
    this.gameOver = true
    
    // Game over text
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'GAME OVER',
      {
        fontSize: '48px',
        color: '#ff4400',
        fontFamily: 'Orbitron'
      }
    )
    gameOverText.setOrigin(0.5)
    
    // Final score
    const finalScoreText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 10,
      `Final Score: ${this.score}`,
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Orbitron'
      }
    )
    finalScoreText.setOrigin(0.5)
    
    // Restart instruction
    const restartText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 60,
      'Press R to Restart',
      {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'Orbitron'
      }
    )
    restartText.setOrigin(0.5)
    
    // Add restart functionality
    const rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    rKey.on('down', () => {
      this.scene.restart()
    })
  }

  private storeHighScore() {
    // Use Spark's KV storage to persist high score
    if (typeof window !== 'undefined' && window.spark) {
      window.spark.kv.get<number>('highScore').then(highScore => {
        if (!highScore || this.score > highScore) {
          window.spark.kv.set('highScore', this.score)
        }
      })
    }
  }
}