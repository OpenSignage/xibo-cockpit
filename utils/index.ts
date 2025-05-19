import { Conversation, Message } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getCurrentTimestamp = (): number => {
  return Date.now();
};

export const createNewConversation = (): Conversation => {
  return {
    id: generateId(),
    title: '新しい会話',
    messages: [],
    lastUpdated: getCurrentTimestamp()
  };
};

export const createMessage = (content: string, role: 'user' | 'assistant'): Message => {
  return {
    id: generateId(),
    role,
    content,
    timestamp: getCurrentTimestamp()
  };
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('LocalStorage error:', error);
    return defaultValue;
  }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
}; 