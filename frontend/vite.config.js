import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { lucideIcons } from 'frappe-ui/vite'
import * as LucideIcons from 'lucide-static'

const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

/**
 * esbuild plugin that resolves ~icons/lucide/* during the optimizeDeps pre-bundling phase.
 * Vite plugins (like lucideIcons()) only run at serve/transform time — esbuild pre-bundler
 * runs separately and needs its own resolver for these virtual imports.
 */
function lucideIconsEsbuildPlugin() {
  const icons = buildIconMap()
  return {
    name: 'lucide-icons-esbuild',
    setup(build) {
      build.onResolve({ filter: /^~icons\/lucide\// }, (args) => ({
        path: args.path,
        namespace: 'lucide-virtual',
      }))
      build.onLoad({ filter: /.*/, namespace: 'lucide-virtual' }, (args) => {
        const iconName = args.path.replace('~icons/lucide/', '')
        const svg = icons[iconName]
        const innerHTML = svg
          ? (svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1]?.replace(/>\s+</g, '><').trim() ?? ''
          : ''
        return {
          contents: `
import { h } from 'vue'
export default {
  inheritAttrs: false,
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24', height: '24', viewBox: '0 0 24 24',
      fill: 'none', stroke: 'currentColor',
      'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      ...this.$attrs,
      innerHTML: ${JSON.stringify(innerHTML)},
    })
  }
}`,
          loader: 'js',
        }
      })
    },
  }
}

function buildIconMap() {
  const icons = {}
  for (const [key, svg] of Object.entries(LucideIcons)) {
    if (key === 'default' || typeof svg !== 'string') continue
    const fixed = svg.replace(/stroke-width="2"/g, 'stroke-width="1.5"')
    // camelCase → dash-case
    const dash = key.replace(/[A-Z0-9]/g, (m) => '-' + m.toLowerCase()).replace(/^-/, '')
    icons[key] = fixed
    icons[dash] = fixed
  }
  return icons
}

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ...lucideIcons(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        display: 'standalone',
        name: 'CRM',
        short_name: 'CRM',
        start_url: '/',
        description: 'Modern & 100% Open-source CRM — works with any backend.',
        icons: [
          { src: '/manifest/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/manifest/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/manifest/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/manifest/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
    dedupe: ['vue', 'vue-router', 'frappe-ui', 'dompurify'],
  },

  optimizeDeps: {
    include: [
      'feather-icons',
      'prosemirror-state',
      'prosemirror-view',
      'lowlight',
      'interactjs',
      'highlight.js/lib/core',
    ],
    esbuildOptions: {
      plugins: [lucideIconsEsbuildPlugin()],
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },

  server: {
    proxy: {
      '/api': { target: backendUrl, changeOrigin: true },
      '/assets': { target: backendUrl, changeOrigin: true },
    },
  },
})
