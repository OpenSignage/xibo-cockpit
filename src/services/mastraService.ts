import { MastraClient } from '@mastra/client-js';
import { Conversation, Message, ConversationMetadata } from '../types';

// 一時的にanyを使用
declare const AgentClient: any;

export class MastraService {
  private agentClient: any = null;
  private memoryClient: any = null;
  public endpoint: string;
  private agentId: string;
  private resourceId: string;
  private initializationPromise: Promise<boolean> | null = null;

  constructor(endpoint: string, agentId: string, resourceId: string = 'captain') {
    this.endpoint = endpoint;
    this.agentId = agentId;
    this.resourceId = resourceId;
  }

  async initialize() {
    // 初期化が進行中の場合は、そのPromiseを返す
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // 新しい初期化処理を開始
    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<boolean> {
    try {
      const client = new MastraClient({
        baseUrl: this.endpoint
      });

      // エージェントクライアントの初期化
      this.agentClient = client.getAgent(this.agentId);
      this.memoryClient = client;
      
      console.log(`Initialized connection to ${this.agentId} at ${this.endpoint}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize agent client:', error);
      this.agentClient = null;
      this.memoryClient = null;
      this.initializationPromise = null;
      throw error;
    }
  }

  updateEndpoint(endpoint: string) {
    this.endpoint = endpoint;
    this.agentClient = null;
    this.memoryClient = null;
    this.initializationPromise = null;
  }

  updateSettings(settings: { agentId?: string; resourceId?: string }) {
    let needsReinitialize = false;

    if (settings.agentId && settings.agentId !== this.agentId) {
      this.agentId = settings.agentId;
      needsReinitialize = true;
    }
    
    if (settings.resourceId && settings.resourceId !== this.resourceId) {
      this.resourceId = settings.resourceId;
      needsReinitialize = true;
    }

    if (needsReinitialize) {
      this.agentClient = null;
      this.memoryClient = null;
      this.initializationPromise = null;
      
      // 設定変更後は明示的に初期化を要求
      this.initialize().catch(error => {
        console.error('Failed to initialize after settings update:', error);
        throw error; // エラーを上位に伝播させる
      });
    }
  }

  private async ensureInitialized() {
    if (!this.agentClient || !this.memoryClient) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error(`Failed to connect to agent: ${this.agentId}`);
      }
    }
  }

  async sendMessage(message: string, onStreamUpdate: (content: string) => void, threadId?: string): Promise<string> {
    await this.ensureInitialized();

    try {
      let fullResponse = '';
      console.log('Sending message to agent:', { message, threadId });
      
      // streamモードで通信
      const response = await this.agentClient.stream({
        messages: [{ role: 'user', content: message }],
        threadId: threadId || this.agentId,  // threadIdが指定されていない場合はagentIdを使用
        resourceId: this.resourceId
      });
      console.log('Stream response received');

      // ストリームデータを処理
      await response.processDataStream({
        onTextPart: (text: string) => {
          fullResponse += text;  // テキストを累積的に追加
          console.log('Stream text part received:', { text });
          onStreamUpdate(fullResponse);  // 累積されたテキストを送信
        },
        onErrorPart: (error: Error) => {
          console.error('Stream error:', error);
          throw error;
        }
      });
      
      console.log('Final response:', { fullResponse });
      return fullResponse;
    } catch (error) {
      console.error('Error sending message to agent:', error);
      throw error;
    }
  }

  // 会話スレッドの取得
  async getConversationThreads(): Promise<Conversation[]> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      console.log('Getting conversation threads...');
      const threads = await this.memoryClient.getMemoryThreads({
        resourceId: this.resourceId,
        agentId: this.agentId
      });
      console.log('Raw threads from API:', threads);

      const mappedThreads = await Promise.all(threads.map(async (thread: any) => {
        console.log('Processing thread:', thread);
        const threadDetails = await this.memoryClient.getMemoryThread(thread.id, this.agentId).get();
        console.log('Thread details:', threadDetails);
        
        const messages = threadDetails.messages || [];
        const lastMessage = messages[messages.length - 1];
        
        const metadata: ConversationMetadata = {
          userId: this.resourceId,
          agentId: this.agentId,
          memoryId: thread.id,
          messageCount: messages.length,
          createdAt: threadDetails.metadata?.createdAt || new Date().toISOString(),
          lastUpdated: threadDetails.metadata?.lastUpdated || new Date().toISOString()
        };

        const conversation = {
          id: thread.id,
          title: threadDetails.title || lastMessage?.content?.slice(0, 30) || '新しい会話',
          messages: messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt
          })),
          metadata
        };
        console.log('Mapped conversation:', conversation);
        return conversation;
      }));

      console.log('Final mapped threads:', mappedThreads);
      return mappedThreads;
    } catch (error) {
      console.error('Error getting conversation threads:', error);
      throw error;
    }
  }

  // 新しい会話スレッドの作成
  async createConversationThread(title: string = '新しい会話'): Promise<Conversation> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      console.log('Creating new conversation thread with title:', title);
      const thread = await this.memoryClient.createMemoryThread({
        title,
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          messageCount: 0,
          userId: this.resourceId,
          agentId: this.agentId
        },
        resourceId: this.resourceId,
        agentId: this.agentId
      });
      console.log('Created thread from API:', thread);

      const metadata: ConversationMetadata = {
        userId: this.resourceId,
        agentId: this.agentId,
        memoryId: thread.id,
        messageCount: 0,
        createdAt: thread.metadata.createdAt,
        lastUpdated: thread.metadata.lastUpdated
      };

      const conversation = {
        id: thread.id,
        title: thread.title,
        messages: [],
        metadata
      };
      console.log('Created conversation object:', conversation);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation thread:', error);
      throw error;
    }
  }

  // 会話スレッドの削除
  async deleteConversationThread(threadId: string): Promise<void> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      console.log('Deleting conversation thread:', threadId);
      const thread = this.memoryClient.getMemoryThread(threadId, this.agentId);
      await thread.delete();
      console.log('Successfully deleted thread:', threadId);
    } catch (error) {
      console.error('Error deleting conversation thread:', error);
      throw error;
    }
  }

  // メッセージの保存
  async saveMessage(threadId: string, message: Message, onTitleUpdated?: (newTitle: string) => void): Promise<void> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      const timestamp = new Date().toISOString();
      console.log('Saving message:', { threadId, message, timestamp });
      
      // メッセージを保存
      const savedMessage = await this.memoryClient.saveMessageToMemory({
        messages: [{
          role: message.role,
          content: message.content,
          id: message.id,
          threadId: threadId,
          createdAt: timestamp,
          type: 'text'
        }],
        agentId: this.agentId
      });

      console.log('Message saved successfully:', { savedMessage });

      // スレッドの詳細を取得して新しいタイトルを確認
      const thread = this.memoryClient.getMemoryThread(threadId, this.agentId);
      const details = await thread.get();
      console.log('Thread details after save:', details);

      // タイトルが更新されている場合は、コールバックを呼び出す
      if (details.title && details.title !== '新しい会話' && onTitleUpdated) {
        console.log('Thread title updated:', details.title);
        onTitleUpdated(details.title);
      }
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // スレッドのタイトルを更新
  async updateThreadTitle(threadId: string, title: string): Promise<void> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      const thread = this.memoryClient.getMemoryThread(threadId, this.agentId);
      const updated = await thread.update({
        title,
        metadata: { status: "active" },
        resourceId: this.resourceId
      });
      console.log('Updated thread:', updated);
    } catch (error) {
      console.error('Error updating thread title:', error);
      throw error;
    }
  }

  // スレッドのメッセージ履歴を取得
  async getThreadMessages(threadId: string): Promise<Message[]> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      console.log('Getting messages for thread:', threadId);
      
      // 直接APIを呼び出してメッセージを取得
      const response = await fetch(`${this.endpoint}/api/memory/threads/${threadId}/messages?agentId=${this.agentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Retrieved messages:', data);

      // messages配列を取得
      const messages = data.messages || [];
      if (!Array.isArray(messages) || messages.length === 0) {
        console.warn('No messages found in thread');
        return [];
      }

      return messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        metadata: {
          memoryId: threadId
        }
      }));
    } catch (error) {
      console.error('Error getting thread messages:', error);
      throw error;
    }
  }

  async getConversationThread(threadId: string): Promise<Conversation> {
    console.log('Getting conversation thread:', threadId);
    try {
      const thread = await this.memoryClient.getMemoryThread(threadId, this.agentId);
      console.log('Thread object:', thread);
      const details = await thread.get();
      console.log('Raw thread data:', details);

      // メッセージを直接取得
      const messages = await this.getThreadMessages(threadId);
      console.log('Retrieved messages:', messages);

      const conversation: Conversation = {
        id: details.id,
        title: details.title || '新しい会話',
        messages: messages,
        metadata: {
          userId: this.resourceId,
          agentId: this.agentId,
          memoryId: details.id,
          messageCount: messages.length,
          createdAt: details.metadata?.createdAt || new Date().toISOString(),
          lastUpdated: details.metadata?.lastUpdated || new Date().toISOString()
        }
      };

      console.log('Mapped conversation:', conversation);
      return conversation;
    } catch (error) {
      console.error('Error getting conversation thread:', error);
      throw error;
    }
  }

  // アシスタントの応答を生成
  async generateResponse(content: string, threadId: string): Promise<string> {
    if (!this.memoryClient) {
      await this.initialize();
    }

    try {
      const response = await this.memoryClient.generateResponse({
        agentId: this.agentId,
        threadId,
        message: content
      });

      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
} 