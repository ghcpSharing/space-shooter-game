import * as Phaser from 'phaser'

export class SoundManager {
  private scene: Phaser.Scene
  private masterVolume: number = 0.3
  private sfxVolume: number = 0.7
  private musicVolume: number = 0.5
  private enabled: boolean = true // 启用音效
  private audioContext: AudioContext | null = null
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.initializeAudioContext()
  }

  /**
   * 初始化音频上下文
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('SoundManager: Web Audio API initialized successfully')
    } catch (error) {
      console.warn('SoundManager: Web Audio API not supported, disabling audio')
      this.enabled = false
    }
  }

  /**
   * 预加载所有音效文件
   */
  preloadSounds(): void {
    console.log('SoundManager: Ready to generate synthetic sounds')
  }

  /**
   * 初始化音效系统
   */
  initializeSounds(): void {
    if (!this.enabled || !this.audioContext) {
      console.log('SoundManager: Audio system disabled')
      return
    }

    // 恢复音频上下文（某些浏览器需要用户交互后才能播放音频）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('SoundManager: Audio context resumed')
      })
    }
    
    console.log('SoundManager: Audio system initialized and ready')
  }

  /**
   * 创建并播放激光射击音效
   */
  private createLaserSound(frequency: number, duration: number, volume: number = 0.5): void {
    if (!this.audioContext || !this.enabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    // 设置激光音效参数
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, this.audioContext.currentTime + duration)
    
    // 设置音量包络
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume * this.masterVolume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  /**
   * 创建并播放爆炸音效
   */
  private createExplosionSound(duration: number, volume: number = 0.6): void {
    if (!this.audioContext || !this.enabled) return

    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    // 生成爆炸音效（白噪声 + 低频震动）
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate
      const envelope = Math.exp(-t * 3) // 快速衰减
      const noise = (Math.random() - 0.5) * 2
      const rumble = Math.sin(2 * Math.PI * 60 * t) * 0.3
      data[i] = (noise + rumble) * envelope * volume * this.sfxVolume * this.masterVolume
    }
    
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    source.start()
  }

  /**
   * 创建并播放撞击音效
   */
  private createHitSound(): void {
    if (!this.audioContext || !this.enabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    // 高频短促的撞击声
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  /**
   * 播放玩家射击音效
   */
  playPlayerShoot(): void {
    this.createLaserSound(440, 0.15, 0.4) // 清脆的高频激光声
  }

  /**
   * 播放敌人射击音效
   */
  playEnemyShoot(): void {
    this.createLaserSound(220, 0.2, 0.3) // 低频敌人激光声
  }

  /**
   * 播放Boss射击音效
   */
  playBossShoot(): void {
    this.createLaserSound(180, 0.25, 0.5) // 更深沉的Boss激光声
  }

  /**
   * 播放爆炸音效
   */
  playExplosion(): void {
    this.createExplosionSound(0.4, 0.6)
  }

  /**
   * 播放Boss爆炸音效
   */
  playBossExplosion(): void {
    this.createExplosionSound(0.8, 0.8) // 更长更响的爆炸声
  }

  /**
   * 播放玩家受伤音效
   */
  playPlayerHit(): void {
    this.createExplosionSound(0.3, 0.5) // 较短的受伤音效
  }

  /**
   * 播放撞击音效
   */
  playHit(): void {
    this.createHitSound()
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 设置音效音量
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 设置音乐音量
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * 停止所有音效
   */
  stopAll(): void {
    // Web Audio API 的音效会自动停止，无需手动管理
    console.log('SoundManager: All sounds stopped')
  }

  /**
   * 销毁音效管理器
   */
  destroy(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    console.log('SoundManager destroyed')
  }
}