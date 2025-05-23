// バージョン情報
export const VERSION = '0.8.0';

// ビルド情報
export const BUILD_INFO = {
  buildTime: process.env.VITE_BUILD_TIME || new Date().toISOString()
}; 