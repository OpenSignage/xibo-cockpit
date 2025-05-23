import { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  endpoint: 'http://localhost:4111',
  agent: 'xibo',
  timezone: 'Asia/Tokyo',
  defaultAdmin: 'captain',
  defaultPassword: 'administrator',
  darkMode: true,
  language: 'ja'
};

// サーバーサイドでのみ使用する設定
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000
}; 