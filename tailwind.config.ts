import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E3F2FD', // Azul claro
          DEFAULT: '#2196F3', // Azul padrão
          dark: '#1976D2', // Azul escuro
        },
      },
    },
  },
  plugins: [],
}
export default config




