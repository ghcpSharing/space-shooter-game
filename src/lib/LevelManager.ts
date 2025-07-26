import * as Phaser from 'phaser'
import { Enemy, Boss } from './gameObjects'

export interface LevelConfig {
  levelNumber: number
  enemyWaves: EnemyWave[]
  bossType?: string
  backgroundMusic?: string
  levelTitle: string
  bonusMultiplier: number
}

export interface EnemyWave {
  enemyType: 'fighter' | 'cruiser' | 'interceptor' | 'bomber'
  count: number
  spawnDelay: number
  enemyHealth: number
  enemySpeed: number
}

export class LevelManager {
  private scene: Phaser.Scene
  private currentLevel: number = 1
  private currentWave: number = 0
  private enemiesRemaining: number = 0
  private waveInProgress: boolean = false
  private bossActive: boolean = false
  private levelComplete: boolean = false
  private spawnTimer: number = 0
  private currentLevelConfig!: LevelConfig
  private levelText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createLevelUI()
    this.loadLevel(1)
  }

  private createLevelUI() {
    // Level display
    this.levelText = this.scene.add.text(
      this.scene.cameras.main.width - 20,
      20,
      'Level: 1',
      {
        fontSize: '24px',
        color: '#ffa502',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
    this.levelText.setOrigin(1, 0)

    // Wave progress display
    this.waveText = this.scene.add.text(
      this.scene.cameras.main.width - 20,
      50,
      'Wave: 1/3',
      {
        fontSize: '18px',
        color: '#4fd1c7',
        fontFamily: 'Orbitron',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
    this.waveText.setOrigin(1, 0)
  }

  private generateLevelConfig(levelNumber: number): LevelConfig {
    const isBossLevel = levelNumber % 5 === 0
    
    if (isBossLevel) {
      return this.createBossLevel(levelNumber)
    } else {
      return this.createRegularLevel(levelNumber)
    }
  }

  private createRegularLevel(levelNumber: number): LevelConfig {
    const difficulty = Math.floor((levelNumber - 1) / 3) + 1
    const baseHealth = Math.min(1 + Math.floor(levelNumber / 3), 5)
    const baseSpeed = Math.min(100 + (levelNumber * 10), 250)

    const waves: EnemyWave[] = []
    const waveCount = Math.min(3 + Math.floor(levelNumber / 4), 6)

    for (let i = 0; i < waveCount; i++) {
      const waveTypes: Array<'fighter' | 'cruiser' | 'interceptor' | 'bomber'> = ['fighter', 'cruiser', 'interceptor', 'bomber']
      const primaryType = waveTypes[Math.floor(Math.random() * waveTypes.length)]
      
      waves.push({
        enemyType: primaryType,
        count: Math.min(3 + Math.floor(levelNumber / 2) + i, 12),
        spawnDelay: Math.max(800 - (levelNumber * 20), 300),
        enemyHealth: baseHealth + (primaryType === 'cruiser' ? 1 : 0),
        enemySpeed: baseSpeed + (primaryType === 'interceptor' ? 50 : 0)
      })
    }

    return {
      levelNumber,
      enemyWaves: waves,
      levelTitle: `Sector ${levelNumber}`,
      bonusMultiplier: 1 + (levelNumber * 0.1)
    }
  }

  private createBossLevel(levelNumber: number): LevelConfig {
    const bossTypes = ['destroyer', 'interceptor', 'mothership', 'voidcommander']
    const bossIndex = Math.min(Math.floor((levelNumber - 5) / 5), bossTypes.length - 1)
    const bossType = bossTypes[bossIndex]

    // Add some regular enemies before the boss
    const preBossWaves: EnemyWave[] = [
      {
        enemyType: 'fighter',
        count: Math.min(5 + levelNumber, 15),
        spawnDelay: 600,
        enemyHealth: Math.min(2 + Math.floor(levelNumber / 5), 6),
        enemySpeed: 150 + (levelNumber * 5)
      }
    ]

    return {
      levelNumber,
      enemyWaves: preBossWaves,
      bossType,
      levelTitle: `Boss Sector ${levelNumber}`,
      bonusMultiplier: 2 + (levelNumber * 0.2)
    }
  }

  public loadLevel(levelNumber: number) {
    this.currentLevel = levelNumber
    this.currentWave = 0
    this.enemiesRemaining = 0
    this.waveInProgress = false
    this.bossActive = false
    this.levelComplete = false
    this.spawnTimer = 0

    this.currentLevelConfig = this.generateLevelConfig(levelNumber)
    this.updateLevelUI()
    
    // Show level start notification
    this.showLevelStart()
  }

  private showLevelStart() {
    const levelStartText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.currentLevelConfig.levelTitle,
      {
        fontSize: '48px',
        color: '#ffa502',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    )
    levelStartText.setOrigin(0.5)
    levelStartText.setAlpha(0)

    // Animate level start text
    this.scene.tweens.add({
      targets: levelStartText,
      alpha: 1,
      scale: 1.2,
      duration: 1000,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        levelStartText.destroy()
        this.startNextWave()
      }
    })

    // Screen flash for level start
    this.scene.cameras.main.flash(500, 255, 165, 2)
  }

  private updateLevelUI() {
    this.levelText.setText(`Level: ${this.currentLevel}`)
    
    if (this.currentLevelConfig.bossType) {
      this.waveText.setText('BOSS INCOMING!')
      this.waveText.setColor('#ff4757')
    } else {
      this.waveText.setText(`Wave: ${this.currentWave + 1}/${this.currentLevelConfig.enemyWaves.length}`)
      this.waveText.setColor('#4fd1c7')
    }
  }

  public update(time: number, delta: number) {
    if (this.levelComplete || this.bossActive) return

    // Check if current wave is complete
    if (this.waveInProgress && this.enemiesRemaining <= 0) {
      this.waveInProgress = false
      this.currentWave++

      if (this.currentWave >= this.currentLevelConfig.enemyWaves.length) {
        // All waves complete - check for boss or level completion
        if (this.currentLevelConfig.bossType) {
          this.spawnBoss()
        } else {
          this.completeLevel()
        }
      } else {
        // Start next wave after delay
        this.scene.time.delayedCall(2000, () => {
          this.startNextWave()
        })
      }
    }

    // Spawn enemies for current wave
    if (this.waveInProgress) {
      this.spawnTimer += delta
      const currentWave = this.currentLevelConfig.enemyWaves[this.currentWave]
      
      if (this.spawnTimer >= currentWave.spawnDelay) {
        this.spawnEnemy(currentWave)
        this.spawnTimer = 0
      }
    }
  }

  private startNextWave() {
    if (this.currentWave >= this.currentLevelConfig.enemyWaves.length) return

    this.waveInProgress = true
    const wave = this.currentLevelConfig.enemyWaves[this.currentWave]
    this.enemiesRemaining = wave.count
    this.spawnTimer = 0
    this.updateLevelUI()

    // Show wave start notification
    const waveText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 100,
      `Wave ${this.currentWave + 1}`,
      {
        fontSize: '32px',
        color: '#4fd1c7',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    )
    waveText.setOrigin(0.5)
    waveText.setAlpha(0)

    this.scene.tweens.add({
      targets: waveText,
      alpha: 1,
      y: waveText.y - 50,
      duration: 1000,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => waveText.destroy()
    })
  }

  private spawnEnemy(wave: EnemyWave) {
    if (this.enemiesRemaining <= 0) return

    const x = Phaser.Math.Between(50, this.scene.cameras.main.width - 50)
    const enemy = new Enemy(
      this.scene,
      x,
      -50,
      wave.enemySpeed,
      wave.enemyHealth,
      wave.enemyType
    )

    // Add enemy to scene groups (handled by GameScene)
    const gameScene = this.scene as any
    if (gameScene.enemies) {
      gameScene.enemies.add(enemy)
    }

    this.enemiesRemaining--
  }

  private spawnBoss() {
    this.bossActive = true
    this.updateLevelUI()

    // Show boss warning
    const bossWarning = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      'WARNING!\nBOSS APPROACHING',
      {
        fontSize: '40px',
        color: '#ff4757',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    )
    bossWarning.setOrigin(0.5)

    // Flashing warning animation
    this.scene.tweens.add({
      targets: bossWarning,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        bossWarning.destroy()
        
        // Spawn the boss
        const boss = new Boss(
          this.scene,
          this.scene.cameras.main.centerX,
          -100,
          this.currentLevelConfig.bossType!
        )

        // Add boss to scene groups (handled by GameScene)
        const gameScene = this.scene as any
        if (gameScene.bosses) {
          gameScene.bosses.add(boss)
        }
      }
    })

    // Red screen flash for boss warning
    this.scene.cameras.main.flash(1000, 255, 0, 0)
  }

  public onEnemyDestroyed() {
    // This is called by GameScene when an enemy is destroyed
  }

  public onBossDestroyed() {
    this.bossActive = false
    this.completeLevel()
  }

  private completeLevel() {
    this.levelComplete = true

    // Calculate level completion bonus
    const bonus = Math.floor(1000 * this.currentLevelConfig.bonusMultiplier)
    
    // Show level complete notification
    const completeText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 50,
      'LEVEL COMPLETE!',
      {
        fontSize: '42px',
        color: '#4fd1c7',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    )
    completeText.setOrigin(0.5)

    const bonusText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY + 10,
      `Bonus: ${bonus} points`,
      {
        fontSize: '24px',
        color: '#ffa502',
        fontFamily: 'Orbitron',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
    bonusText.setOrigin(0.5)

    const nextLevelText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY + 50,
      'Next level starting...',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Orbitron',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
    nextLevelText.setOrigin(0.5)

    // Add bonus to score (handled by GameScene)
    const gameScene = this.scene as any
    if (gameScene.addScore) {
      gameScene.addScore(bonus)
    }

    // Auto-advance to next level after delay
    this.scene.time.delayedCall(3000, () => {
      completeText.destroy()
      bonusText.destroy()
      nextLevelText.destroy()
      this.loadLevel(this.currentLevel + 1)
    })

    // Green screen flash for level complete
    this.scene.cameras.main.flash(500, 0, 255, 0)
  }

  public getCurrentLevel(): number {
    return this.currentLevel
  }

  public getLevelMultiplier(): number {
    return this.currentLevelConfig.bonusMultiplier
  }

  public isBossLevel(): boolean {
    return !!this.currentLevelConfig.bossType
  }

  public isLevelComplete(): boolean {
    return this.levelComplete
  }

  public destroy() {
    if (this.levelText) this.levelText.destroy()
    if (this.waveText) this.waveText.destroy()
  }
}