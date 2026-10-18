// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://Kaustobh.github.io',
  base: '/Silvatide-Cottage',
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('three')) return 'three';
            if (id.includes('gsap')) return 'gsap';
            if (id.includes('lenis')) return 'lenis';
          }
        }
      }
    }
  }
});
