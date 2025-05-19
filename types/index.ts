export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface UserSettings {
  endpoint: string;
  darkMode: boolean;
  language: 'ja' | 'en';
}

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: UserSettings;
} 