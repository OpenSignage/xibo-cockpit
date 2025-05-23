import { Conversation, Message, ConversationMetadata } from '../src/types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const createNewConversation = (): Conversation => {
  const now = getCurrentTimestamp();
  const metadata: ConversationMetadata = {
    lastUpdated: now,
    userId: 'default',
    agentId: 'default',
    messageCount: 0,
    createdAt: now
  };

  return {
    id: generateId(),
    title: '新しい会話',
    messages: [],
    metadata
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