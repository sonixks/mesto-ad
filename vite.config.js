import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true //автоматически открывает браузер при запуске dev-сервера
  },
  base: './', //относительный путь для корректной работы GitHub Pages
});