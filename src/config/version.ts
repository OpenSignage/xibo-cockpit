// バージョン情報
export const VERSION = '0.8.0';

// ビルド情報
export const BUILD_INFO = {
  buildTime: new Date().toISOString(),
  buildHash: process.env.VITE_GIT_HASH || 'unknown',
  buildNumber: process.env.VITE_BUILD_NUMBER || 'unknown'
}; 