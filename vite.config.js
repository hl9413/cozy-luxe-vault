import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // 关键：设置 base 路径
  base: './',
  
  // 关键：关闭 devtool 检查
  build: {
    sourcemap: false, // 可选，关闭 source map
  },
  
  // 可选：添加 server 配置
  server: {
    port: 5173, // 指定端口
    open: true, // 启动时自动打开浏览器
  },
  
  // 可选：添加 resolve 配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});