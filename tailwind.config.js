/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./types/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'warm-canvas': 'var(--color-warm-canvas)',
        'stone-surface': 'var(--color-stone-surface)',
        'graphite': 'var(--color-graphite)',
        'charcoal-primary': 'var(--color-charcoal-primary)',
        'midnight': 'var(--color-midnight)',
        'obsidian': 'var(--color-obsidian)',
        'ash': 'var(--color-ash)',
        'fog': 'var(--color-fog)',
        'smoke': 'var(--color-smoke)',
        'pepper': 'var(--color-pepper)',
        'ember-orange': 'var(--color-ember-orange)',
        'meadow-green': 'var(--color-meadow-green)',
        'sky-blue': 'var(--color-sky-blue)',
        'sunburst-yellow': 'var(--color-sunburst-yellow)',
        'deep-amber': 'var(--color-deep-amber)',
        'ocean-blue': 'var(--color-ocean-blue)',
        'ice-blue': 'var(--color-ice-blue)',
        'spearmint': 'var(--color-spearmint)',
        'flamingo': 'var(--color-flamingo)',
        'violet-pop': 'var(--color-violet-pop)',
        'coral-red': 'var(--color-coral-red)',
        'valid-green': 'var(--color-valid-green)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Family', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption': 'var(--text-caption)',
        'body': 'var(--text-body)',
        'heading-sm': 'var(--text-heading-sm)',
        'heading': 'var(--text-heading)',
        'heading-lg': 'var(--text-heading-lg)',
        'display': 'var(--text-display)',
      },
    },
  },
};
