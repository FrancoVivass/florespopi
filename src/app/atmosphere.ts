import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
type Spark = { x: number; y: number; vx: number; vy: number; size: number; life: number; age: number; phase: number };
@Component({
  selector: 'app-atmosphere', standalone: true,
  template: '<canvas #canvas aria-hidden="true"></canvas>',
  styles: [':host{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}canvas{width:100%;height:100%;display:block}']
})
export class Atmosphere implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() paused = false;
  private particles: Spark[] = [];
  private frame = 0; private width = 0; private height = 0; private lastTime = 0;
  private context: CanvasRenderingContext2D | null = null;
  private observer?: ResizeObserver;
  constructor(private zone: NgZone) {}
  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.canvas.nativeElement); this.resize();
    this.zone.runOutsideAngular(() => { this.frame = requestAnimationFrame(time => this.draw(time)); });
  }
  private resize(): void {
    const el = this.canvas.nativeElement; const box = el.getBoundingClientRect();
    this.width = box.width; this.height = box.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    el.width = Math.round(this.width * ratio); el.height = Math.round(this.height * ratio);
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  burst(large = false): void { if (!this.paused) for (let i = 0; i < (large ? 100 : 30); i++) this.add(true); }
  private add(burst = false): void {
    const angle = Math.random() * Math.PI * 2, speed = 25 + Math.random() * 75;
    this.particles.push({
      x: burst ? this.width * (this.width < 620 ? .5 : .73) : Math.random() * this.width,
      y: burst ? this.height * .48 : Math.random() * this.height,
      vx: burst ? Math.cos(angle) * speed : (Math.random() - .5) * 10,
      vy: burst ? Math.sin(angle) * speed - 25 : -8 - Math.random() * 12,
      size: .6 + Math.random() * 2.2, life: burst ? 3 + Math.random() * 3 : 8 + Math.random() * 8,
      age: 0, phase: Math.random() * 8
    });
  }
  private draw(time: number): void {
    const delta = Math.min((time - this.lastTime) / 1000, .04); this.lastTime = time;
    const ctx = this.context;
    if (ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      if (!this.paused && !document.hidden) {
        if (this.particles.length < 45 && Math.random() < delta * 12) this.add();
        this.particles = this.particles.filter(p => p.age < p.life);
        for (const p of this.particles) {
          p.age += delta; p.x += p.vx * delta; p.y += p.vy * delta;
          const fade = Math.min(p.age * 2, 1, (p.life - p.age) / 2);
          ctx.globalAlpha = Math.max(0, fade * (.3 + .25 * Math.sin(time * .0018 + p.phase)));
          ctx.fillStyle = '#ffe39a'; ctx.shadowColor = '#ffd15a'; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(p.x + Math.sin(time * .0005 + p.phase) * 12, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
    }
    this.frame = requestAnimationFrame(next => this.draw(next));
  }
  ngOnDestroy(): void { cancelAnimationFrame(this.frame); this.observer?.disconnect(); }
}
