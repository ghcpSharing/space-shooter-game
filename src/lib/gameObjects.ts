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
    body.setSize(32, 32)
    
    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.wasd = scene.input.keyboard!.addKeys('W,S,A,D')
  }

  update(time: number) {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-this.speed)
    }
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(this.speed)
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
    body.setSize(32, 32)
    body.setVelocityY(speed)
    
    this.speed = speed
  }

  update() {
    if (this.y > this.scene.cameras.main.height + 50) {
      this.destroy()
    }
  }
}

export class Bullet extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(8, 16)
    body.setVelocityY(-400)
  }

  update() {
    if (this.y < -50) {
      this.destroy()
    }
  }
}