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

  static createExplosion(scene: Phaser.Scene, x: number, y: number, color: string = '#ff6b35', scale: number = 1.0): void {
    // Main explosion burst
    const explosion = scene.add.particles(x, y, 'star', {
      speed: { min: 100 * scale, max: 250 * scale },
      scale: { start: 1 * scale, end: 0 },
      tint: Phaser.Display.Color.HexStringToColor(color).color,
      lifespan: 500 * scale,
      quantity: Math.floor(15 * scale)
    })

    // Secondary smaller particles
    const sparks = scene.add.particles(x, y, 'star', {
      speed: { min: 50 * scale, max: 150 * scale },
      scale: { start: 0.5 * scale, end: 0 },
      tint: 0xffffff,
      lifespan: 300 * scale,
      quantity: Math.floor(8 * scale)
    })

    // Ring expansion effect
    const ring = scene.add.circle(x, y, 5 * scale, Phaser.Display.Color.HexStringToColor(color).color, 0)
    ring.setStrokeStyle(3 * scale, Phaser.Display.Color.HexStringToColor(color).color)
    
    scene.tweens.add({
      targets: ring,
      radius: 40 * scale,
      alpha: 0,
      duration: 400 * scale,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    })

    // Additional effects for larger explosions (bosses)
    if (scale > 1.5) {
      // Multiple ring waves
      for (let i = 1; i <= 3; i++) {
        scene.time.delayedCall(i * 150, () => {
          const waveRing = scene.add.circle(x, y, 5, Phaser.Display.Color.HexStringToColor(color).color, 0)
          waveRing.setStrokeStyle(2, 0xffffff)
          
          scene.tweens.add({
            targets: waveRing,
            radius: 60 * scale,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => waveRing.destroy()
          })
        })
      }

      // Screen flash for massive explosions
      const flash = scene.add.rectangle(
        scene.cameras.main.centerX,
        scene.cameras.main.centerY,
        scene.cameras.main.width,
        scene.cameras.main.height,
        0xffffff,
        0.3
      )
      
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy()
      })
    }

    // Cleanup particles
    scene.time.delayedCall(600 * scale, () => {
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