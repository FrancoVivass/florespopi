/** Original pentatonic music-box phrase. Playback requires a user gesture. */
export class Music {
  private context?: AudioContext; private master?: GainNode;
  private timer?: ReturnType<typeof setInterval>;
  private nextNote = 0; private step = 0;
  private readonly melody = [72, 76, 79, 83, 79, 76, 74, 79, 81, 79, 76, 74, 72, 67, 69, 71];
  async start(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext(); this.master = this.context.createGain();
      this.master.gain.value = .12; this.master.connect(this.context.destination);
    }
    await this.context.resume();
    this.nextNote = this.context.currentTime + .08; this.schedule();
    clearInterval(this.timer); this.timer = setInterval(() => this.schedule(), 100);
  }
  private schedule(): void {
    const ctx = this.context!;
    while (this.nextNote < ctx.currentTime + .25) {
      this.note(this.melody[this.step % this.melody.length], this.nextNote);
      if (this.step % 4 === 0) this.note([48, 53, 57, 55][Math.floor(this.step / 4) % 4], this.nextNote, .5);
      this.nextNote += .56; this.step++;
    }
  }
  private note(midi: number, at: number, volume = 1): void {
    const ctx = this.context!;
    for (const [multiple, strength] of [[1, .8], [2, .15], [3, .035]]) {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 440 * 2 ** ((midi - 69) / 12) * multiple;
      gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(strength * volume, at + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, at + 2.8);
      osc.connect(gain); gain.connect(this.master!); osc.start(at); osc.stop(at + 2.9);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    }
  }
  async stop(): Promise<void> { clearInterval(this.timer); if (this.context) await this.context.suspend(); }
  async destroy(): Promise<void> { clearInterval(this.timer); await this.context?.close(); }
}
