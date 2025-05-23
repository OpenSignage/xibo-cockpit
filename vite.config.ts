import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Git情報を取得する関数
function getGitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    return { hash };
  } catch (error) {
    console.warn('Git情報の取得に失敗しました:', error);
    return { hash: 'unknown' };
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_GIT_HASH': JSON.stringify(getGitInfo().hash),
    'process.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    'process.env.VITE_BUILD_NUMBER': JSON.stringify(process.env.BUILD_NUMBER || 'unknown')
  }
}); 