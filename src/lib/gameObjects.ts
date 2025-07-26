import * as Phaser from 'phaser'

export class Player extends Phaser.GameObjects.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd: any
  private speed: number = 300
  private lastFired: number = 0
  private fireRate: number = 100

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(40, 40)
    
    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.wasd = scene.input.keyboard!.addKeys('W,S,A,D')
    
    // Add subtle movement animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  update(time: number) {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-this.speed)
      this.setRotation(-0.1)
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(this.speed)
      this.setRotation(0.1)
    } else {
      this.setRotation(0)
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-this.speed)
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(this.speed)
    }
  }

  canFire(time: number): boolean {
    return time > this.lastFired + this.fireRate
  }

  setLastFired(time: number) {
    this.lastFired = time
  }
}

export class Enemy extends Phaser.GameObjects.Sprite {
  protected speed: number
  protected health: number
  protected maxHealth: number
  protected enemyType: string

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number = 150, health: number = 1, enemyType: string = 'fighter') {
    super(scene, x, y, 'enemy')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(30, 30)
    body.setVelocityY(speed)
    
    this.speed = speed
    this.health = health
    this.maxHealth = health
    this.enemyType = enemyType
    
    // Set tint based on enemy type
    this.setEnemyVisuals()
    
    // Add rotation animation to enemies
    scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    })
    
    // Add subtle pulsing effect
    scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private setEnemyVisuals() {
    switch (this.enemyType) {
      case 'fighter':
        this.setTint(0xff4757)
        this.setScale(0.7)
        break
      case 'cruiser':
        this.setTint(0xffa502)
        this.setScale(0.9)
        break
      case 'interceptor':
        this.setTint(0x3742fa)
        this.setScale(0.6)
        break
      case 'bomber':
        this.setTint(0x5f27cd)
        this.setScale(1.1)
        break
    }
  }

  takeDamage(damage: number = 1): boolean {
    this.health -= damage
    
    // Flash red when hit
    this.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      this.setEnemyVisuals()
    })
    
    return this.health <= 0
  }

  getPoints(): number {
    switch (this.enemyType) {
      case 'fighter': return 10
      case 'cruiser': return 25
      case 'interceptor': return 15
      case 'bomber': return 30
      default: return 10
    }
  }

  update() {
    if (this.y > this.scene.cameras.main.height + 50) {
      this.destroy()
    }
    
    // Special movement for interceptors
    if (this.enemyType === 'interceptor') {
      const body = this.body as Phaser.Physics.Arcade.Body
      body.setVelocityX(Math.sin(this.scene.time.now * 0.005) * 100)
    }
  }
}

export class Boss extends Phaser.GameObjects.Sprite {
  protected health: number
  protected maxHealth: number
  protected bossType: string
  protected phase: number = 1
  protected maxPhases: number
  protected attackTimer: number = 0
  protected attackCooldown: number = 2000
  protected isInvulnerable: boolean = false
  protected healthBar!: Phaser.GameObjects.Graphics
  private bullets!: Phaser.GameObjects.Group

  constructor(scene: Phaser.Scene, x: number, y: number, bossType: string = 'destroyer') {
    super(scene, x, y, 'enemy')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    this.bossType = bossType
    this.setBossStats()
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(80, 80)
    body.setVelocity(0, 50) // Slow entry
    
    this.setBossVisuals()
    this.createHealthBar()
    this.createEntryAnimation()
    
    // Create bullets group for boss attacks
    this.bullets = scene.add.group()
  }

  private setBossStats() {
    switch (this.bossType) {
      case 'destroyer':
        this.health = 50
        this.maxPhases = 2
        this.attackCooldown = 1500
        break
      case 'interceptor':
        this.health = 75
        this.maxPhases = 3
        this.attackCooldown = 1000
        break
      case 'mothership':
        this.health = 150
        this.maxPhases = 4
        this.attackCooldown = 2000
        break
      case 'voidcommander':
        this.health = 200
        this.maxPhases = 5
        this.attackCooldown = 800
        break
    }
    this.maxHealth = this.health
  }

  private setBossVisuals() {
    switch (this.bossType) {
      case 'destroyer':
        this.setTint(0xff3838)
        this.setScale(2.0)
        break
      case 'interceptor':
        this.setTint(0x3838ff)
        this.setScale(1.8)
        break
      case 'mothership':
        this.setTint(0x38ff38)
        this.setScale(2.5)
        break
      case 'voidcommander':
        this.setTint(0xff38ff)
        this.setScale(2.2)
        break
    }
    
    // Boss glow effect
    this.setAlpha(0.9)
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createHealthBar() {
    this.healthBar = this.scene.add.graphics()
    this.updateHealthBar()
  }

  private updateHealthBar() {
    const barWidth = 300
    const barHeight = 20
    const x = this.scene.cameras.main.centerX - barWidth / 2
    const y = 50
    
    this.healthBar.clear()
    
    // Background
    this.healthBar.fillStyle(0x000000, 0.8)
    this.healthBar.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4)
    
    // Health bar
    const healthPercent = this.health / this.maxHealth
    const healthColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffff00 : 0xff0000
    
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight)
    
    // Border
    this.healthBar.lineStyle(2, 0xffffff)
    this.healthBar.strokeRect(x, y, barWidth, barHeight)
    
    // Boss name
    if (!this.scene.children.getByName('bossNameText')) {
      const nameText = this.scene.add.text(
        this.scene.cameras.main.centerX,
        30,
        this.getBossName(),
        {
          fontSize: '24px',
          color: '#ff4757',
          fontFamily: 'Orbitron',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        }
      )
      nameText.setOrigin(0.5)
      nameText.setName('bossNameText')
    }
  }

  private getBossName(): string {
    switch (this.bossType) {
      case 'destroyer': return 'VOID DESTROYER'
      case 'interceptor': return 'SHADOW INTERCEPTOR'
      case 'mothership': return 'ALIEN MOTHERSHIP'
      case 'voidcommander': return 'VOID COMMANDER'
      default: return 'UNKNOWN BOSS'
    }
  }

  private createEntryAnimation() {
    this.isInvulnerable = true
    
    // Entry animation
    this.scene.tweens.add({
      targets: this,
      y: 150,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.isInvulnerable = false
        const body = this.body as Phaser.Physics.Arcade.Body
        body.setVelocity(0, 0)
      }
    })
    
    // Screen shake for dramatic entry
    this.scene.cameras.main.shake(500, 0.02)
  }

  takeDamage(damage: number = 1): boolean {
    if (this.isInvulnerable) return false
    
    this.health -= damage
    this.updateHealthBar()
    
    // Flash white when hit
    this.setTint(0xffffff)
    this.scene.time.delayedCall(100, () => {
      this.setBossVisuals()
    })
    
    // Check for phase transition
    const newPhase = this.maxPhases - Math.floor((this.health / this.maxHealth) * this.maxPhases) + 1
    if (newPhase > this.phase && newPhase <= this.maxPhases) {
      this.phase = newPhase
      this.onPhaseChange()
    }
    
    return this.health <= 0
  }

  private onPhaseChange() {
    // Brief invulnerability during phase change
    this.isInvulnerable = true
    this.scene.time.delayedCall(1000, () => {
      this.isInvulnerable = false
    })
    
    // Visual effect for phase change
    this.scene.cameras.main.flash(500, 255, 255, 255)
    
    // Increase attack speed
    this.attackCooldown = Math.max(500, this.attackCooldown - 200)
  }

  getPoints(): number {
    switch (this.bossType) {
      case 'destroyer': return 500
      case 'interceptor': return 750
      case 'mothership': return 1000
      case 'voidcommander': return 2000
      default: return 500
    }
  }

  update(time: number) {
    // Boss AI behavior based on type and phase
    this.attackTimer += this.scene.game.loop.delta
    
    if (this.attackTimer >= this.attackCooldown && !this.isInvulnerable) {
      this.performAttack()
      this.attackTimer = 0
    }
    
    // Boss movement patterns
    this.updateMovement(time)
  }

  private updateMovement(time: number) {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    switch (this.bossType) {
      case 'destroyer':
        // Side to side movement
        body.setVelocityX(Math.sin(time * 0.001) * 100)
        break
      case 'interceptor':
        // Erratic movement that gets faster in higher phases
        const speed = 80 + (this.phase * 20)
        body.setVelocityX(Math.sin(time * 0.003) * speed)
        body.setVelocityY(Math.cos(time * 0.002) * 30 + 20)
        break
      case 'mothership':
        // Slow, menacing movement
        body.setVelocityX(Math.sin(time * 0.0005) * 50)
        break
      case 'voidcommander':
        // Complex pattern movement
        body.setVelocityX(Math.sin(time * 0.002) * 120)
        body.setVelocityY(Math.sin(time * 0.001) * 40 + 30)
        break
    }
  }

  private performAttack() {
    switch (this.bossType) {
      case 'destroyer':
        this.spreadShotAttack()
        break
      case 'interceptor':
        this.rapidFireAttack()
        break
      case 'mothership':
        this.missileBarrageAttack()
        break
      case 'voidcommander':
        this.voidBeamAttack()
        break
    }
  }

  private spreadShotAttack() {
    const bulletCount = 3 + this.phase
    const angleStep = Math.PI / (bulletCount + 1)
    const startAngle = Math.PI * 0.3
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = startAngle + (angleStep * i)
      const bullet = new Bullet(this.scene, this.x, this.y + 40, 'enemyBullet')
      const speed = 200
      const body = bullet.body as Phaser.Physics.Arcade.Body
      body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
      this.bullets.add(bullet)
    }
  }

  private rapidFireAttack() {
    for (let i = 0; i < this.phase; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const bullet = new Bullet(this.scene, this.x, this.y + 40, 'enemyBullet')
        this.bullets.add(bullet)
      })
    }
  }

  private missileBarrageAttack() {
    const missileCount = 2 + this.phase
    for (let i = 0; i < missileCount; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const x = this.x + (i - missileCount/2) * 30
        const bullet = new Bullet(this.scene, x, this.y + 40, 'enemyBullet')
        bullet.setScale(1.5)
        bullet.setTint(0xff6b35)
        this.bullets.add(bullet)
      })
    }
  }

  private voidBeamAttack() {
    // Create a wide beam effect
    for (let i = -2; i <= 2; i++) {
      const bullet = new Bullet(this.scene, this.x + i * 20, this.y + 40, 'enemyBullet')
      bullet.setScale(2, 3)
      bullet.setTint(0xff38ff)
      this.bullets.add(bullet)
    }
  }

  destroy() {
    if (this.healthBar) {
      this.healthBar.destroy()
    }
    
    const nameText = this.scene.children.getByName('bossNameText')
    if (nameText) {
      nameText.destroy()
    }
    
    super.destroy()
  }

  getBullets(): Phaser.GameObjects.Group {
    return this.bullets
  }
}

export class Bullet extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'playerBullet') {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(6, 12)
    body.setVelocityY(-500)
    
    // Add glow effect for bullets
    this.setTint(texture === 'playerBullet' ? 0x22d3ee : 0xff4757)
  }

  update() {
    if (this.y < -50) {
      this.destroy()
    }
  }
}