export interface UserSettings {
  endpoint: string;
  agent: string;
  timezone: string;
  defaultAdmin: string;
  defaultPassword: string;
  darkMode: boolean;
  language: string;
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

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: UserSettings;
} 