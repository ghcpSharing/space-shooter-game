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
    // Get the appropriate sprite texture based on boss type
    const spriteKey = `boss${bossType.charAt(0).toUpperCase() + bossType.slice(1)}`
    super(scene, x, y, spriteKey)
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
        this.setScale(1.5)
        break
      case 'interceptor':
        this.setScale(1.3)
        break
      case 'mothership':
        this.setScale(1.8)
        break
      case 'voidcommander':
        this.setScale(1.4)
        break
    }
    
    // Boss glow effect - no tint needed as sprites have their own colors
    this.setAlpha(0.9)
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Add subtle rotation for dramatic effect
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    })
  }

  private createHealthBar() {
    this.healthBar = this.scene.add.graphics()
    this.updateHealthBar()
  }

  private updateHealthBar() {
    const barWidth = 350
    const barHeight = 25
    const x = this.scene.cameras.main.centerX - barWidth / 2
    const y = 40
    
    this.healthBar.clear()
    
    // Background with glow
    this.healthBar.fillStyle(0x000000, 0.9)
    this.healthBar.fillRect(x - 4, y - 4, barWidth + 8, barHeight + 8)
    this.healthBar.fillStyle(0x333333, 0.7)
    this.healthBar.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4)
    
    // Health bar with gradient effect
    const healthPercent = this.health / this.maxHealth
    let healthColor = 0x00ff00
    let glowColor = 0x00ff00
    
    if (healthPercent <= 0.25) {
      healthColor = 0xff0000
      glowColor = 0xff4444
    } else if (healthPercent <= 0.5) {
      healthColor = 0xffaa00
      glowColor = 0xffcc44
    } else if (healthPercent <= 0.75) {
      healthColor = 0xffff00
      glowColor = 0xffff44
    }
    
    // Animated health bar segments
    const segmentCount = 20
    const segmentWidth = (barWidth * healthPercent) / segmentCount
    
    for (let i = 0; i < segmentCount * healthPercent; i++) {
      const segmentX = x + (i * (barWidth / segmentCount))
      const alpha = 0.7 + (Math.sin(this.scene.time.now * 0.01 + i) * 0.3)
      this.healthBar.fillStyle(healthColor, alpha)
      this.healthBar.fillRect(segmentX, y, segmentWidth - 1, barHeight)
    }
    
    // Border with glow
    this.healthBar.lineStyle(3, glowColor, 0.8)
    this.healthBar.strokeRect(x, y, barWidth, barHeight)
    this.healthBar.lineStyle(1, 0xffffff)
    this.healthBar.strokeRect(x, y, barWidth, barHeight)
    
    // Phase indicator
    const phaseX = x + barWidth + 10
    this.healthBar.fillStyle(0xffffff)
    this.healthBar.fillRect(phaseX, y, 60, barHeight)
    this.healthBar.fillStyle(0x000000)
    
    // Boss name and phase
    if (!this.scene.children.getByName('bossNameText')) {
      const nameText = this.scene.add.text(
        this.scene.cameras.main.centerX,
        20,
        this.getBossName(),
        {
          fontSize: '28px',
          color: '#ff4757',
          fontFamily: 'Orbitron',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        }
      )
      nameText.setOrigin(0.5)
      nameText.setName('bossNameText')
      
      // Pulsing name effect
      this.scene.tweens.add({
        targets: nameText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }
    
    // Phase text
    const existingPhaseText = this.scene.children.getByName('bossPhaseText')
    if (existingPhaseText) {
      existingPhaseText.destroy()
    }
    
    const phaseText = this.scene.add.text(
      phaseX + 30,
      y + 12,
      `P${this.phase}`,
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Orbitron',
        fontStyle: 'bold'
      }
    )
    phaseText.setOrigin(0.5)
    phaseText.setName('bossPhaseText')
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
    
    // Make boss invisible initially
    this.setAlpha(0)
    
    // Dramatic entry sequence
    this.scene.cameras.main.shake(800, 0.03)
    this.scene.cameras.main.flash(1000, 128, 0, 128) // Dark purple flash
    
    // Scale up entry animation
    this.setScale(0.1)
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: this.getBaseScale(),
      scaleY: this.getBaseScale(),
      y: 150,
      duration: 2500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.isInvulnerable = false
        const body = this.body as Phaser.Physics.Arcade.Body
        body.setVelocity(0, 0)
        
        // Add warning pulse after entry
        this.scene.tweens.add({
          targets: this,
          scaleX: this.getBaseScale() * 1.1,
          scaleY: this.getBaseScale() * 1.1,
          duration: 500,
          yoyo: true,
          repeat: 2
        })
      }
    })
  }
  
  private getBaseScale(): number {
    switch (this.bossType) {
      case 'destroyer': return 1.5
      case 'interceptor': return 1.3
      case 'mothership': return 1.8
      case 'voidcommander': return 1.4
      default: return 1.5
    }
  }

  takeDamage(damage: number = 1): boolean {
    if (this.isInvulnerable) return false
    
    this.health -= damage
    this.updateHealthBar()
    
    // Flash white when hit - don't use tint to preserve sprite colors
    const originalAlpha = this.alpha
    this.setAlpha(1)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.setAlpha(originalAlpha)
      }
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
    this.scene.time.delayedCall(1500, () => {
      this.isInvulnerable = false
    })
    
    // Visual effect for phase change
    this.scene.cameras.main.flash(800, 255, 100, 100)
    this.scene.cameras.main.shake(300, 0.02)
    
    // Boss transformation effect
    this.scene.tweens.add({
      targets: this,
      scaleX: this.getBaseScale() * 1.3,
      scaleY: this.getBaseScale() * 1.3,
      alpha: 0.5,
      duration: 400,
      yoyo: true,
      onComplete: () => {
        this.setAlpha(0.9) // Return to normal alpha
      }
    })
    
    // Show phase change notification
    const phaseText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      `PHASE ${this.phase}!`,
      {
        fontSize: '48px',
        color: '#ff4757',
        fontFamily: 'Orbitron',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5
      }
    )
    phaseText.setOrigin(0.5)
    phaseText.setAlpha(0)
    
    this.scene.tweens.add({
      targets: phaseText,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => phaseText.destroy()
    })
    
    // Increase attack speed
    this.attackCooldown = Math.max(400, this.attackCooldown - 300)
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
    if (!this.bullets || !this.scene) return
    
    const bulletCount = 3 + this.phase
    const angleStep = Math.PI / (bulletCount + 1)
    const startAngle = Math.PI * 0.3
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = startAngle + (angleStep * i)
      const bullet = new Bullet(this.scene, this.x, this.y + 40, 'enemyBullet')
      bullet.setScale(1.2)
      bullet.setTint(0xff6b6b) // Red tint for destroyer bullets
      const speed = 200
      const body = bullet.body as Phaser.Physics.Arcade.Body
      body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
      this.bullets.add(bullet)
    }
  }

  private rapidFireAttack() {
    if (!this.bullets || !this.scene) return
    
    for (let i = 0; i < this.phase * 2; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        if (!this.bullets || !this.scene) return
        const bullet = new Bullet(this.scene, this.x, this.y + 40, 'enemyBullet')
        bullet.setScale(0.8)
        bullet.setTint(0x4dabf7) // Blue tint for interceptor bullets
        const body = bullet.body as Phaser.Physics.Arcade.Body
        body.setVelocity(0, 300) // Faster bullets
        this.bullets.add(bullet)
      })
    }
  }

  private missileBarrageAttack() {
    if (!this.bullets || !this.scene) return
    
    const missileCount = 2 + this.phase
    for (let i = 0; i < missileCount; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        if (!this.bullets || !this.scene) return
        const x = this.x + (i - missileCount/2) * 40
        const bullet = new Bullet(this.scene, x, this.y + 40, 'enemyBullet')
        bullet.setScale(1.8, 1.2)
        bullet.setTint(0x51cf66) // Green tint for mothership missiles
        const body = bullet.body as Phaser.Physics.Arcade.Body
        body.setVelocity(0, 250)
        this.bullets.add(bullet)
        
        // Add missile trail effect
        this.scene.tweens.add({
          targets: bullet,
          scaleX: 1.5,
          scaleY: 1.0,
          duration: 200,
          yoyo: true,
          repeat: -1
        })
      })
    }
  }

  private voidBeamAttack() {
    if (!this.bullets || !this.scene) return
    
    // Create a wide beam effect with void energy
    for (let i = -3; i <= 3; i++) {
      const bullet = new Bullet(this.scene, this.x + i * 15, this.y + 40, 'enemyBullet')
      bullet.setScale(1.5, 4)
      bullet.setTint(0xff38ff) // Purple void energy
      const body = bullet.body as Phaser.Physics.Arcade.Body
      body.setVelocity(0, 200)
      this.bullets.add(bullet)
      
      // Add void energy pulsing effect
      this.scene.tweens.add({
        targets: bullet,
        alpha: 0.6,
        duration: 100,
        yoyo: true,
        repeat: -1
      })
    }
    
    // Add screen shake for void beam
    this.scene.cameras.main.shake(200, 0.01)
  }

  destroy() {
    if (this.healthBar) {
      this.healthBar.destroy()
    }
    
    // Clean up bullets group
    if (this.bullets) {
      this.bullets.destroy(true) // destroyChildren = true
    }
    
    const nameText = this.scene.children.getByName('bossNameText')
    if (nameText) {
      nameText.destroy()
    }
    
    const phaseText = this.scene.children.getByName('bossPhaseText')
    if (phaseText) {
      phaseText.destroy()
    }
    
    super.destroy()
  }

  getBullets(): Phaser.GameObjects.Group {
    // Safety check to ensure bullets group exists
    if (!this.bullets || !this.scene || !this.scene.add) {
      // Return an empty group if bullets group is not available
      return { children: { entries: [] } } as Phaser.GameObjects.Group
    }
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