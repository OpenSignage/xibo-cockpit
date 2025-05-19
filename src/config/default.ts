import { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  endpoint: 'http://localhost:4111',
  darkMode: true,
  language: 'ja'
};

// サーバーサイドでのみ使用する設定
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000
}; 