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
  private speed: number

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number = 150) {
    super(scene, x, y, 'enemy')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(30, 30)
    body.setVelocityY(speed)
    
    this.speed = speed
    
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

  update() {
    if (this.y > this.scene.cameras.main.height + 50) {
      this.destroy()
    }
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