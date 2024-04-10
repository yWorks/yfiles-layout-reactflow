import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'

const base = process.env.BASE_PATH || 'dist'

// https://astro.build/config
export default defineConfig({
  base,
  build: {
    format: 'file'
  },
  integrations: [
    tailwind(), mdx()
  ],
  redirects: {
    '/': `/${base}/introduction/welcome`
  },
  vite: {
    server: {
      proxy: {
        '/playground-lib': 'http://nas-01.yworks.home/yfiles-for-html/'
      }
    }
  }

})
