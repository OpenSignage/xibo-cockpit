import { Message, Conversation, ConversationMetadata } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getCurrentTimestamp = (): number => {
  return Date.now();
};

export const createConversation = (title: string = '新しい会話', agentId: string = 'xibo'): Conversation => {
  const now = new Date().toISOString();
  const metadata: ConversationMetadata = {
    userId: 'captain',
    agentId,
    messageCount: 0,
    createdAt: now,
    lastUpdated: now
  };

  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    metadata
  };
};

export const createMessage = (content: string, role: 'user' | 'assistant'): Message => {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString()
  };
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}; 