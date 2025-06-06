import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['src/**/*.{vue,html,jsx,tsx, js}'],
    exclude: ['node_modules', '.git'],
  },
  theme: {
    extend: {},
  },
})
