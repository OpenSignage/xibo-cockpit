export interface UserSettings {
  endpoint: string;
  darkMode: boolean;
  language: 'ja' | 'en';
}

export interface ConversationMetadata {
  lastUpdated: string;
  userId: string;
  agentId: string;
  messageCount: number;
  createdAt: string;
  memoryId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  metadata: ConversationMetadata;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// 会話関連の型定義は src/types/conversation.ts に移動しました 