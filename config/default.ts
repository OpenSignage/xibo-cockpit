import { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  endpoint: 'http://localhost:4111',
  darkMode: true,
  language: 'ja'
};

export const PORT = process.env.PORT || 3000; 