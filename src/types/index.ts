import { Conversation, Message, ConversationMetadata } from './conversation';

export type { Conversation, Message, ConversationMetadata };

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