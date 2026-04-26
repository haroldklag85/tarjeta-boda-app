class GlobalAudio {
  private static instance: HTMLAudioElement | null = null;
  private static initialized = false;

  static play() {
    if (typeof window === 'undefined') return;
    
    if (!this.instance) {
      // Initialize the audio instance
      this.instance = new Audio('/musica.mpeg');
      this.instance.loop = true; // Typically you want background music to loop
    }

    if (!this.initialized) {
      // Attempt to play
      this.instance.play().then(() => {
        this.initialized = true;
      }).catch((err) => {
        console.error("Audio playback failed (usually due to browser autoplay policies):", err);
      });
    }
  }

  static toggleMute() {
    if (this.instance) {
      this.instance.muted = !this.instance.muted;
      return this.instance.muted;
    }
    return false;
  }
  
  static isMuted() {
    return this.instance ? this.instance.muted : false;
  }
}

export default GlobalAudio;
