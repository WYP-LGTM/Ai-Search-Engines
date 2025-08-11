import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 百度AI图像识别API代理
      '/api/baidu': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu/, '/rest/2.0/image-classify/v1'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // 添加百度AI的Access Token
            const accessToken = '24.90170d8087e172f77ae2299f47001dd3.2592000.1757509413.282335-119747291';
            
            // 添加access_token参数到URL
            const url = new URL(proxyReq.path, 'https://aip.baidubce.com');
            url.searchParams.set('access_token', accessToken);
            proxyReq.path = url.pathname + url.search;
            
            console.log('代理请求URL:', proxyReq.path);
          });
        }
      }
    }
  }
})
