import { Component, ElementRef, HostListener, OnDestroy, ViewChild, signal } from '@angular/core';
import { Atmosphere } from './atmosphere';
import { Music } from './music';

const MESSAGE = 'Ya que no te regalaron las flores amarillas, acá están las mías para vos, Popi.\n\nGracias por todo lo que traés a mi vida: por las risas, por tu compañía y por hacer más lindos incluso los días más simples. Aunque estas flores no sean físicas, te las merecés igual, y mucho.\n\nQuería regalarte este pedacito de primavera para recordarte lo especial que sos. Ojalá cada vez que las veas te saquen una sonrisa y te acuerdes de que hay alguien que se alegra muchísimo de tenerte en su vida.\n\nGracias por ser vos. Estas flores son tuyas, hoy y todas las veces que quieras volver a hacerlas florecer.';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Atmosphere],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  @ViewChild('letterDialog') letterDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild(Atmosphere) atmosphere!: Atmosphere;
  readonly gift = signal({ to: 'Popi', from: 'Fran', message: MESSAGE });
  readonly stage = signal(0);
  readonly growing = signal(false);
  readonly complete = signal(false);
  readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  readonly paused = signal(this.reducedMotion.matches);
  readonly sound = signal(false);
  readonly soundBusy = signal(false);
  readonly imageLoaded = signal(false);
  readonly imageFailed = signal(false);
  readonly notice = signal('');
  readonly flowers = [
    { x: 37, y: 28, w: 58, h: 38, name: 'Un poquito de luz.' },
    { x: 79, y: 38, w: 45, h: 32, name: 'Una razón para sonreír.' },
    { x: 31, y: 56, w: 43, h: 30, name: 'Un deseo bonito.' },
    { x: 62, y: 48, w: 39, h: 27, name: 'Un abrazo, aunque sea a la distancia.' },
    { x: 16, y: 45, w: 29, h: 25, name: 'Un día lleno de cosas lindas.' },
    { x: 65, y: 14, w: 34, h: 24, name: 'Y todo mi cariño, para vos.' }
  ];
  private music = new Music();
  private noticeTimer?: ReturnType<typeof setTimeout>;
  private sequenceTimer?: ReturnType<typeof setTimeout>;
  private motionChanged = (event: MediaQueryListEvent) => this.paused.set(event.matches);

  constructor() {
    this.reducedMotion.addEventListener('change', this.motionChanged);
  }

  bloom(): void {
    if (this.growing() || !this.imageLoaded()) return;
    clearTimeout(this.sequenceTimer);
    this.stage.set(0); this.complete.set(false); this.growing.set(true);
    const next = () => {
      this.stage.update(value => value + 1);
      this.atmosphere.burst();
      if (this.stage() < 6) this.sequenceTimer = setTimeout(next, this.paused() ? 300 : 1250);
      else this.sequenceTimer = setTimeout(() => {
        this.complete.set(true); this.growing.set(false); this.atmosphere.burst(true);
      }, this.paused() ? 200 : 1400);
    };
    this.sequenceTimer = setTimeout(next, 220);
  }

  toggleMotion(): void { this.paused.update(value => !value); }
  openLetter(): void { this.letterDialog.nativeElement.showModal(); }
  closeOutside(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  }
  async toggleSound(): Promise<void> {
    if (this.soundBusy()) return;
    this.soundBusy.set(true);
    try {
      if (this.sound()) { await this.music.stop(); this.sound.set(false); }
      else { await this.music.start(); this.sound.set(true); }
    } catch { this.notify('Este navegador no pudo activar la música.'); this.sound.set(false); }
    finally { this.soundBusy.set(false); }
  }
  @HostListener('document:visibilitychange') onVisibility(): void {
    if (document.hidden && this.sound()) { void this.music.stop(); this.sound.set(false); }
  }
  notify(message: string): void {
    clearTimeout(this.noticeTimer); this.notice.set(message);
    this.noticeTimer = setTimeout(() => this.notice.set(''), 5000);
  }
  ngOnDestroy(): void {
    clearTimeout(this.noticeTimer); clearTimeout(this.sequenceTimer);
    this.reducedMotion.removeEventListener('change', this.motionChanged);
    void this.music.destroy();
  }
}
