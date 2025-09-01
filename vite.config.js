import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      'https://imeetserver2k25.onrender.com':'https://imeetserver2k25.onrender.com',
    }
  },
  plugins: [react()],
})
