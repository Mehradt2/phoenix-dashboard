import{defineConfig}from'vite';import react from'@vitejs/plugin-react';
export default defineConfig({base:process.env.KP_BASE||'/phoenix-dashboard/',plugins:[react()],build:{outDir:'dist',sourcemap:false}});
