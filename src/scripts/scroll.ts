import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function initScrollSystem(): Lenis | null {
  if (typeof window === 'undefined') return null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return null;
  }

  if (lenisInstance) {
    lenisInstance.destroy();
  }

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    syncTouch: false // Preserve native momentum on mobile
  });

  // Synchronize Lenis with ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time: number) => {
    lenisInstance?.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Global tone interpolation across sections
  setupToneInterpolation();

  // Heading reveal animations
  setupHeadingReveals();

  // Expose to window for UI controls (ChapterRail, presets, etc.)
  if (typeof window !== 'undefined') {
    (window as any).__lenis = lenisInstance;
  }

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

function setupToneInterpolation() {
  const root = document.documentElement;

  // Track sections marked with data-tone
  const toneSections = document.querySelectorAll<HTMLElement>('[data-tone]');
  if (toneSections.length === 0) return;

  toneSections.forEach((section) => {
    const bg = section.dataset.toneBg || '#0c0d0e';
    const text = section.dataset.toneText || '#ffffff';

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateTone(root, bg, text),
      onEnterBack: () => updateTone(root, bg, text)
    });
  });
}

function updateTone(root: HTMLElement, bg: string, text: string) {
  gsap.to(root, {
    '--sv-tone-bg': bg,
    '--sv-tone-text': text,
    duration: 0.8,
    ease: 'power2.out'
  });
}

function setupHeadingReveals() {
  const headings = document.querySelectorAll<HTMLElement>('.sv-reveal-heading');
  headings.forEach((h) => {
    gsap.fromTo(
      h,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: h,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}
