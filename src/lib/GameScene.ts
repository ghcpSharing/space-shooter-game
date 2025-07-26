import * as Phaser from 'phaser'
import { Player, Enemy, Bullet, Boss } from '../lib/gameObjects'
import { ParticleEffects } from '../lib/ParticleEffects'
import { LevelManager } from '../lib/LevelManager'
import playerShipSvg from '../assets/images/player-ship.svg'
import enemyShipSvg from '../assets/images/enemy-ship.svg'
import playerBulletSvg from '../assets/images/player-bullet.svg'
import enemyBulletSvg from '../assets/images/enemy-bullet.svg'
import spaceBackgroundSvg from '../assets/images/space-background.svg'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private bullets!: Phaser.GameObjects.Group
  private enemies!: Phaser.GameObjects.Group
  private bosses!: Phaser.GameObjects.Group
  private enemyBullets!: Phaser.GameObjects.Group
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private lives: number = 3
  private livesText!: Phaser.GameObjects.Text
  private gameOver: boolean = false
  private spaceKey!: Phaser.Input.Keyboard.Key
  private explosions!: Phaser.GameObjects.Group
  private background!: Phaser.GameObjects.Image
  private stars!: Phaser.GameObjects.Group
  private levelManager!: LevelManager

  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // Load SVG assets
    this.load.image('player', playerShipSvg)
    this.load.image('enemy', enemyShipSvg)
    this.load.image('playerBullet', playerBulletSvg)
    this.load.image('enemyBullet', enemyBulletSvg)
    this.load.image('spaceBackground', spaceBackgroundSvg)
    
    // Create simple star texture for particles
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQIHWP8//8/AzYwiklkAQDiAwMDA+MjAAQBABAJ8FsAAAAASUVORK5CYII=')
  }

  create() {
    const { width, height } = this.cameras.main

    // Create beautiful space background
    this.background = this.add.image(width / 2, height / 2, 'spaceBackground')
    this.background.setDisplaySize(width, height)

    // Add animated stars
    this.createAnimatedStars()

    // Create player
    this.player = new Player(this, width / 2, height - 80)
    this.player.setScale(0.8) // Scale down the SVG

    // Create groups
    this.bullets = this.add.group()
    this.enemies = this.add.group()
    this.bosses = this.add.group()
    this.enemyBullets = this.add.group()
    this.explosions = this.add.group()

    // Input
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Enhanced UI with better styling
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      color: '#22d3ee',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      stroke: '#0891b2',
      strokeThickness: 2
    })

    this.livesText = this.add.text(20, 60, 'Lives: 3', {
      fontSize: '28px',
      color: '#4fd1c7',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      stroke: '#0f766e',
      strokeThickness: 2
    })

    // Initialize level manager
    this.levelManager = new LevelManager(this)

    // Enhanced collision system
    this.setupCollisions()
  }

  private setupCollisions() {
    // Player bullets vs enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this)
    
    // Player bullets vs bosses
    this.physics.add.overlap(this.bullets, this.bosses, this.bulletHitBoss, undefined, this)
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this)
    
    // Player vs bosses
    this.physics.add.overlap(this.player, this.bosses, this.playerHitBoss, undefined, this)
    
    // Player vs enemy bullets
    this.physics.add.overlap(this.player, this.enemyBullets, this.playerHitEnemyBullet, undefined, this)
  }

  update(time: number, delta: number) {
    if (this.gameOver) return

    // Animate background
    this.animateBackground()

    // Update level manager
    this.levelManager.update(time, delta)

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

    this.enemyBullets.children.entries.forEach((bullet) => {
      (bullet as Bullet).update()
    })

    // Update enemies
    this.enemies.children.entries.forEach((enemy) => {
      (enemy as Enemy).update()
    })

    // Update bosses and their bullet groups
    this.bosses.children.entries.forEach((boss) => {
      const bossObj = boss as Boss
      bossObj.update(time)
      
      // Add boss bullets to the enemy bullets group for collision detection
      const bossBullets = bossObj.getBullets()
      bossBullets.children.entries.forEach((bullet) => {
        if (!this.enemyBullets.contains(bullet)) {
          this.enemyBullets.add(bullet)
        }
      })
    })
  }

  private createAnimatedStars() {
    this.stars = ParticleEffects.createStarfield(this)
  }

  private animateBackground() {
    // Slowly rotate the background for a dynamic space feel
    this.background.rotation += 0.0005
    
    // Move stars slowly
    this.stars.children.entries.forEach((star) => {
      star.y += 0.5
      if (star.y > this.cameras.main.height + 10) {
        star.y = -10
        star.x = Phaser.Math.Between(0, this.cameras.main.width)
      }
    })
  }

  private fireBullet() {
    const bullet = new Bullet(this, this.player.x, this.player.y - 30, 'playerBullet')
    bullet.setScale(0.6)
    this.bullets.add(bullet)
  }

  private bulletHitEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const enemyObj = enemy as Enemy
    const destroyed = enemyObj.takeDamage(1)
    
    if (destroyed) {
      // Create enhanced explosion effect
      this.createExplosion(enemy.x, enemy.y, '#ff6b35')
      
      // Screen shake for impact
      this.cameras.main.shake(100, 0.01)
      
      // Update score with level multiplier
      const basePoints = enemyObj.getPoints()
      const bonusPoints = Math.floor(basePoints * this.levelManager.getLevelMultiplier())
      this.addScore(bonusPoints)
      
      // Remove enemy
      enemy.destroy()
    }
    
    // Always destroy bullet
    bullet.destroy()
  }

  private bulletHitBoss(bullet: Phaser.GameObjects.GameObject, boss: Phaser.GameObjects.GameObject) {
    const bossObj = boss as Boss
    const destroyed = bossObj.takeDamage(1)
    
    if (destroyed) {
      // Create massive explosion effect
      this.createExplosion(boss.x, boss.y, '#ff6b35', 2.0)
      
      // Strong screen shake for boss destruction
      this.cameras.main.shake(300, 0.03)
      
      // Massive score bonus for boss
      const basePoints = bossObj.getPoints()
      const bonusPoints = Math.floor(basePoints * this.levelManager.getLevelMultiplier())
      this.addScore(bonusPoints)
      
      // Notify level manager
      this.levelManager.onBossDestroyed()
      
      // Remove boss
      boss.destroy()
    } else {
      // Smaller impact effect for boss hit
      this.createExplosion(boss.x, boss.y, '#ffffff', 0.5)
      this.cameras.main.shake(50, 0.005)
    }
    
    // Always destroy bullet
    bullet.destroy()
  }

  private playerHitEnemy(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    this.playerTakeDamage(enemy.x, enemy.y)
    enemy.destroy()
  }

  private playerHitBoss(player: Phaser.GameObjects.GameObject, boss: Phaser.GameObjects.GameObject) {
    this.playerTakeDamage(boss.x, boss.y)
    // Boss doesn't get destroyed by collision
  }

  private playerHitEnemyBullet(player: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
    this.playerTakeDamage(bullet.x, bullet.y)
    bullet.destroy()
  }

  private playerTakeDamage(impactX: number, impactY: number) {
    // Create explosion effect at impact point
    this.createExplosion(impactX, impactY, '#ff4757')
    
    // Strong screen shake for player hit
    this.cameras.main.shake(200, 0.02)
    
    // Lose a life
    this.lives--
    this.livesText.setText('Lives: ' + this.lives)
    
    // Brief invulnerability
    this.player.setAlpha(0.5)
    this.scene.tweens.add({
      targets: this.player,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    })
    
    if (this.lives <= 0) {
      this.endGame()
    }
  }

  public addScore(points: number) {
    this.score += points
    this.scoreText.setText('Score: ' + this.score)
    this.storeHighScore()
  }

  private createExplosion(x: number, y: number, color: string = '#ff6b35', scale: number = 1.0) {
    ParticleEffects.createExplosion(this, x, y, color, scale)
  }

  private endGame() {
    this.gameOver = true
    
    // Clean up level manager
    this.levelManager.destroy()
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    )
    
    // Game over text with glow effect
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 80,
      'GAME OVER',
      {
        fontSize: '56px',
        color: '#ff4757',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#c44569',
        strokeThickness: 4
      }
    )
    gameOverText.setOrigin(0.5)
    
    // Level reached
    const levelText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 30,
      `Level Reached: ${this.levelManager.getCurrentLevel()}`,
      {
        fontSize: '28px',
        color: '#ffa502',
        fontFamily: 'Orbitron',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
    levelText.setOrigin(0.5)
    
    // Final score
    const finalScoreText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 20,
      `Final Score: ${this.score}`,
      {
        fontSize: '36px',
        color: '#22d3ee',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#0891b2',
        strokeThickness: 2
      }
    )
    finalScoreText.setOrigin(0.5)
    
    // Restart instruction
    const restartText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 80,
      'Press R to Restart',
      {
        fontSize: '24px',
        color: '#4fd1c7',
        fontFamily: 'Orbitron',
        stroke: '#0f766e',
        strokeThickness: 2
      }
    )
    restartText.setOrigin(0.5)
    
    // Pulsing animation for restart text
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    })
    
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