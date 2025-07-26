import * as Phaser from 'phaser'

export class ParticleEffects {
  static createEngineTrail(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Particles.ParticleEmitter {
    return scene.add.particles(x, y, 'star', {
      speed: { min: 20, max: 40 },
      scale: { start: 0.3, end: 0 },
      tint: [0x22d3ee, 0x4fd1c7, 0x06b6d4],
      lifespan: 200,
      frequency: 50,
      quantity: 2,
      follow: scene.children.getByName('player') as Phaser.GameObjects.GameObject
    })
  }

  static createExplosion(scene: Phaser.Scene, x: number, y: number, color: string = '#ff6b35'): void {
    // Main explosion burst
    const explosion = scene.add.particles(x, y, 'star', {
      speed: { min: 100, max: 250 },
      scale: { start: 1, end: 0 },
      tint: Phaser.Display.Color.HexStringToColor(color).color,
      lifespan: 500,
      quantity: 15
    })

    // Secondary smaller particles
    const sparks = scene.add.particles(x, y, 'star', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      tint: 0xffffff,
      lifespan: 300,
      quantity: 8
    })

    // Ring expansion effect
    const ring = scene.add.circle(x, y, 5, Phaser.Display.Color.HexStringToColor(color).color, 0)
    ring.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(color).color)
    
    scene.tweens.add({
      targets: ring,
      radius: 40,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    })

    // Cleanup particles
    scene.time.delayedCall(600, () => {
      explosion.destroy()
      sparks.destroy()
    })
  }

  static createPowerUpEffect(scene: Phaser.Scene, x: number, y: number): void {
    const effect = scene.add.particles(x, y, 'star', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.8, end: 0 },
      tint: [0xfbbf24, 0xf59e0b, 0xeab308],
      lifespan: 800,
      quantity: 10,
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 20) }
    })

    scene.time.delayedCall(1000, () => effect.destroy())
  }

  static createStarfield(scene: Phaser.Scene): Phaser.GameObjects.Group {
    const stars = scene.add.group()
    
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, scene.cameras.main.width)
      const y = Phaser.Math.Between(0, scene.cameras.main.height)
      const size = Phaser.Math.FloatBetween(0.5, 2)
      const alpha = Phaser.Math.FloatBetween(0.3, 1)
      
      const star = scene.add.circle(x, y, size, 0xffffff, alpha)
      
      // Twinkling animation
      scene.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      })
      
      stars.add(star)
    }
    
    return stars
  }
}