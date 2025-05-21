import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/aggregator1/v1': {
        target: 'https://aggregator.walrus-testnet.walrus.space',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aggregator1/, ''),
      },
      '/aggregator2/v1': {
        target: 'https://wal-aggregator-testnet.staketab.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aggregator2/, ''),
      },
      '/aggregator3/v1': {
        target: 'https://walrus-testnet-aggregator.redundex.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aggregator3/, ''),
      },
      '/aggregator4/v1': {
        target: 'https://walrus-testnet-aggregator.nodes.guru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aggregator4/, ''),
      },
      '/aggregator5/v1': {
        target: 'https://aggregator.walrus.banansen.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aggregator5/, ''),
      },
      '/aggregator6/v1': {
        target: 'https://walrus-testnet-aggregator.everstake.one',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aggregator6/, ''),
      },
      '/publisher1/v1': {
        target: 'https://publisher.walrus-testnet.walrus.space',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/publisher1/, ''),
      },
      '/publisher2/v1': {
        target: 'https://wal-publisher-testnet.staketab.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/publisher2/, ''),
      },
    },
    cors: true
  }
})
