import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                mentions: resolve(__dirname, 'mentions-legales.html'),
                conditions: resolve(__dirname, 'conditions-utilisation.html'),
            },
        },
    },
})
