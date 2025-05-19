export interface ConversationMetadata {
  userId: string;
  agentId: string;
  memoryId?: string;
  messageCount?: number;
  createdAt: string;
  lastUpdated: string;
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
  metadata?: {
    memoryId?: string;
  };
} 