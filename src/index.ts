import { XiboClient } from './xiboClient';
import { Message } from './types';

// 会話データの型定義
interface Conversation {
    id: string;
    title: string;
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[];
    createdAt: number;
}

// メモリスレッド型定義（Mastra API用）
interface MemoryThread {
    id: string;
    title: string;
    metadata?: any;
    resourceId?: string;
    createdAt: string;
    updatedAt: string;
}

// メモリメッセージ型定義（Mastra API用）
interface MemoryMessage {
    id: string;
    threadId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type: 'text';
    createdAt: string;
}

// アプリケーション設定型定義
interface AppConfig {
    serverUrl: string;
    displayMode: 'light' | 'dark';
    language: 'ja' | 'en';
    maxHistory: number;
}

// デフォルト設定
const DEFAULT_CONFIG: AppConfig = {
    serverUrl: 'http://localhost:4111',
    displayMode: 'light',
    language: 'ja',
    maxHistory: 20
};

// デバッグ用ログ関数
const debug = (message: string, data?: any) => {
    // 重要なメッセージのみコンソールに出力
    console.log(`[DEBUG] ${message}`, data || '');
    
    // 開発時のみUI表示（必要に応じてコメントアウト可能）
    /*
    if (document.getElementById('message-area')) {
        const debugEl = document.createElement('div');
        debugEl.className = 'system-message';
        debugEl.textContent = `[デバッグ] ${message} ${data ? JSON.stringify(data) : ''}`;
        document.getElementById('message-area')?.appendChild(debugEl);
        
        // 自動スクロール
        const messageArea = document.getElementById('message-area');
        if (messageArea) messageArea.scrollTop = messageArea.scrollHeight;
    }
    */
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    const sendMessageBtn = document.getElementById('send-message-btn') as HTMLButtonElement;
    const messageArea = document.getElementById('message-area') as HTMLDivElement;
    const newChatBtn = document.getElementById('new-chat-btn') as HTMLButtonElement;
    const chatHistoryContainer = document.getElementById('chat-history') as HTMLDivElement;
    
    // 設定を取得する
    let config = loadConfig();
    
    // 固定の設定値
    let baseUrl = config.serverUrl;
    const agentId = 'xibo';
    
    // APIエンドポイント設定（APIの仕様に合わせて調整）
    const API_ENDPOINTS = {
        DEFAULT: `/api/agents/${agentId}/generate`,  // デフォルトエンドポイント
        ALTERNATIVE: `/api/agents/${agentId}/stream`,  // 代替エンドポイント
        FALLBACK: `/api/agents/${agentId}/text-object`,  // フォールバックエンドポイント
        TITLE_GENERATE: `/api/agents/${agentId}/title`,  // タイトル生成エンドポイント
        // Mastra メモリAPI関連エンドポイント
        MEMORY_THREADS: `/api/memory/threads`,  // スレッド一覧取得
        MEMORY_THREAD: (threadId: string) => `/api/memory/threads/${threadId}`,  // 特定スレッド操作
        MEMORY_MESSAGES: (threadId: string) => `/api/memory/threads/${threadId}/messages`,  // スレッドのメッセージ
        MEMORY_STATUS: `/api/memory/status`  // メモリステータス
    };
    
    // 現在使用中のエンドポイント
    let currentEndpoint = API_ENDPOINTS.DEFAULT;
    
    // XiboClientとAgent
    let xiboClient: XiboClient | null = null;
    let agent: any = null;
    
    // 現在の会話ID
    let currentConversationId: string = '';
    
    // 会話履歴の保存・読み込み関数
    const conversationStorage = {
        // 会話リストを取得
        getConversations(): Conversation[] {
            const conversations = localStorage.getItem('xibo_conversations');
            return conversations ? JSON.parse(conversations) : [];
        },
        
        // 会話を保存
        saveConversation(conversation: Conversation): void {
            const conversations = this.getConversations();
            const existingIndex = conversations.findIndex(c => c.id === conversation.id);
            
            if (existingIndex !== -1) {
                conversations[existingIndex] = conversation;
            } else {
                conversations.push(conversation);
            }
            
            // 会話履歴の最大数を超えたら古い会話を削除
            const maxHistory = config.maxHistory || DEFAULT_CONFIG.maxHistory;
            if (conversations.length > maxHistory) {
                // 日付順にソート（新しい順）
                conversations.sort((a, b) => b.createdAt - a.createdAt);
                // 最大数を超えた分を削除
                conversations.splice(maxHistory);
            }
            
            localStorage.setItem('xibo_conversations', JSON.stringify(conversations));
            renderChatHistory();
        },
        
        // 会話を取得
        getConversation(id: string): Conversation | null {
            const conversations = this.getConversations();
            return conversations.find(c => c.id === id) || null;
        },
        
        // 会話を削除
        deleteConversation(id: string): void {
            const conversations = this.getConversations().filter(c => c.id !== id);
            localStorage.setItem('xibo_conversations', JSON.stringify(conversations));
            renderChatHistory();
        }
    };
    
    // 設定を読み込む関数
    function loadConfig(): AppConfig {
        const savedConfig = localStorage.getItem('xibo_config');
        let config = { ...DEFAULT_CONFIG };
        
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                config = { ...config, ...parsed };
            } catch (e) {
                debug('設定の読み込みに失敗しました', e);
            }
        }
        
        return config;
    }
    
    // 設定を保存する関数
    function saveConfig(newConfig: AppConfig): boolean {
        try {
            localStorage.setItem('xibo_config', JSON.stringify(newConfig));
            config = newConfig;
            baseUrl = newConfig.serverUrl;
            return true;
        } catch (e) {
            debug('設定の保存に失敗しました', e);
            return false;
        }
    }
    
    // サーバーからメモリスレッド（会話履歴）を取得する関数
    const fetchMemoryThreads = async (): Promise<MemoryThread[]> => {
        try {
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_THREADS}?agentId=${agentId}`);
            
            if (!response.ok) {
                throw new Error(`HTTPエラー ${response.status}`);
            }
            
            const data = await response.json();
            debug('サーバーから会話履歴を取得', data);
            return data.threads || [];
        } catch (error) {
            debug('会話履歴取得エラー', error);
            return [];
        }
    };
    
    // サーバーから特定のスレッドのメッセージを取得する関数
    const fetchThreadMessages = async (threadId: string): Promise<MemoryMessage[]> => {
        try {
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_MESSAGES(threadId)}`);
            
            if (!response.ok) {
                throw new Error(`HTTPエラー ${response.status}`);
            }
            
            const data = await response.json();
            debug(`スレッド「${threadId}」のメッセージを取得`, data);
            return data.messages || [];
        } catch (error) {
            debug('スレッドメッセージ取得エラー', error);
            return [];
        }
    };
    
    // サーバーで新しいメモリスレッドを作成する関数
    const createMemoryThread = async (title: string): Promise<MemoryThread | null> => {
        try {
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_THREADS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    agentId,
                    metadata: { source: 'xibo-cockpit' }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTPエラー ${response.status}`);
            }
            
            const data = await response.json();
            debug('新しいスレッドを作成', data);
            return data.thread || null;
        } catch (error) {
            debug('スレッド作成エラー', error);
            return null;
        }
    };
    
    // サーバーにメッセージを保存する関数
    const saveMessageToServer = async (message: { role: string, content: string }, threadId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_MESSAGES(threadId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{
                        role: message.role,
                        content: message.content,
                        type: 'text',
                        threadId,
                        id: `msg_${Date.now()}`,
                        createdAt: new Date().toISOString()
                    }],
                    agentId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTPエラー ${response.status}`);
            }
            
            const data = await response.json();
            debug('メッセージをサーバーに保存', data);
            return true;
        } catch (error) {
            debug('メッセージ保存エラー', error);
            return false;
        }
    };
    
    // ローカルストレージとサーバーを同期する関数
    const syncConversations = async () => {
        try {
            debug('会話履歴の同期処理を開始');
            
            // サーバーからスレッド一覧を取得
            const serverThreads = await fetchMemoryThreads();
            if (!serverThreads.length) {
                debug('サーバー上にスレッドがありません');
                return;
            }
            
            // ローカルストレージの会話履歴
            const localConversations = conversationStorage.getConversations();
            
            // サーバーのスレッドをローカルに同期
            for (const thread of serverThreads) {
                // 既存の会話を探す
                const existingConv = localConversations.find(c => c.id === thread.id);
                
                if (!existingConv) {
                    // サーバーからスレッドのメッセージを取得
                    const messages = await fetchThreadMessages(thread.id);
                    
                    // ローカルに新しい会話として追加
                    const newConversation: Conversation = {
                        id: thread.id,
                        title: thread.title,
                        messages: messages.map(m => ({
                            role: m.role as any,
                            content: m.content
                        })),
                        createdAt: new Date(thread.createdAt).getTime()
                    };
                    
                    conversationStorage.saveConversation(newConversation);
                    debug('サーバーからの会話を追加', thread.title);
                }
            }
            
            debug('会話履歴の同期が完了しました');
        } catch (error) {
            debug('会話履歴の同期エラー', error);
        }
    };
    
    // 会話履歴を表示する関数
    const renderChatHistory = () => {
        chatHistoryContainer.innerHTML = '';
        const conversations = conversationStorage.getConversations();
        
        // 日付順に並べ替え（新しい順）
        conversations.sort((a, b) => b.createdAt - a.createdAt);
        
        // 最大表示数に制限
        const maxHistory = config.maxHistory || DEFAULT_CONFIG.maxHistory;
        const displayedConversations = conversations.slice(0, maxHistory);
        
        if (displayedConversations.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'chat-item empty';
            emptyMessage.textContent = '会話履歴がありません';
            chatHistoryContainer.appendChild(emptyMessage);
            return;
        }
        
        // 履歴管理用のヘッダーを追加
        const historyHeader = document.createElement('div');
        historyHeader.className = 'history-header';
        
        const headerTitle = document.createElement('div');
        headerTitle.className = 'history-title';
        headerTitle.textContent = '会話履歴';
        
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'clear-all-btn';
        clearAllBtn.title = 'すべての履歴を削除';
        clearAllBtn.innerHTML = '<span>🗑️</span>';
        clearAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('すべての会話履歴を削除しますか？この操作は元に戻せません。')) {
                clearAllConversations();
            }
        });
        
        historyHeader.appendChild(headerTitle);
        historyHeader.appendChild(clearAllBtn);
        chatHistoryContainer.appendChild(historyHeader);
        
        // 会話履歴一覧を表示
        displayedConversations.forEach(conversation => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${conversation.id === currentConversationId ? 'active' : ''}`;
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'chat-title';
            titleSpan.textContent = conversation.title || '無題の会話';
            chatItem.appendChild(titleSpan);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-chat-btn';
            deleteBtn.title = 'この会話を削除';
            deleteBtn.innerHTML = '<span>×</span>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`「${conversation.title || '無題の会話'}」を削除しますか？`)) {
                    deleteConversation(conversation.id);
                }
            });
            
            chatItem.appendChild(deleteBtn);
            chatItem.dataset.id = conversation.id;
            
            chatItem.addEventListener('click', () => {
                loadConversation(conversation.id);
            });
            
            chatHistoryContainer.appendChild(chatItem);
        });
    };
    
    // 会話を読み込む関数
    const loadConversation = (conversationId: string) => {
        const conversation = conversationStorage.getConversation(conversationId);
        if (!conversation) return;
        
        currentConversationId = conversationId;
        
        // メッセージエリアをクリア
        messageArea.innerHTML = '';
        
        // 会話のメッセージを表示
        conversation.messages.forEach(msg => {
            addMessage(msg.content, msg.role as 'user' | 'assistant' | 'system', false);
        });
        
        // アクティブな会話項目のスタイルを更新
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-id') === conversationId) {
                item.classList.add('active');
            }
        });
    };
    
    // 新しい会話を作成する関数
    const createNewConversation = async () => {
        // まずローカルで会話IDを生成
        const localId = 'conv_' + Date.now();
        
        let threadId = localId;
        let title = '新しい会話';
        
        // サーバーにスレッドを作成
        try {
            const serverThread = await createMemoryThread(title);
            if (serverThread) {
                threadId = serverThread.id;
                title = serverThread.title;
                debug('サーバー上に新しいスレッドを作成', serverThread);
            }
        } catch (error) {
            debug('サーバースレッド作成エラー、ローカルIDを使用', error);
        }
        
        currentConversationId = threadId;
        
        const newConversation: Conversation = {
            id: threadId,
            title,
            messages: [],
            createdAt: Date.now()
        };
        
        conversationStorage.saveConversation(newConversation);
        
        // メッセージエリアをクリア
        messageArea.innerHTML = '';
        
        return threadId;
    };
    
    // タイトルを生成する関数
    const generateTitle = async (messages: { role: string, content: string }[]): Promise<string> => {
        if (!messages.length) return '新しい会話';
        
        try {
            // エージェントに会話タイトルを生成してもらう
            const titleResponse = await directApiRequest(
                `${baseUrl}${API_ENDPOINTS.TITLE_GENERATE}`,
                'POST',
                { messages }
            );
            
            if (titleResponse && titleResponse.title) {
                debug('エージェントからタイトル取得成功', titleResponse.title);
                return titleResponse.title;
            }
            
            if (titleResponse && titleResponse.text) {
                debug('エージェントからタイトル取得成功（text形式）', titleResponse.text);
                return titleResponse.text;
            }
            
            // 失敗した場合はデフォルトタイトル生成にフォールバック
            debug('エージェントからタイトルを取得できなかったため、デフォルトタイトルを使用');
            return defaultGenerateTitle(messages);
        } catch (error) {
            debug('タイトル生成エラー', error);
            return defaultGenerateTitle(messages);
        }
    };
    
    // デフォルトのタイトル生成関数（エージェントが失敗した場合のフォールバック）
    const defaultGenerateTitle = (messages: { role: string, content: string }[]): string => {
        // ユーザーの最初のメッセージをタイトルにする
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (firstUserMessage) {
            const title = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
            return title;
        }
        return '新しい会話';
    };
    
    // メッセージを表示する関数
    const addMessage = (text: string, role: 'user' | 'assistant' | 'system', shouldSave = true) => {
        if (!text || text.trim() === '') {
            return; // 空のメッセージは表示しない
        }
        
        const messageEl = document.createElement('div');
        
        if (role === 'system') {
            messageEl.className = 'system-message';
            messageEl.textContent = text;
        } else {
            messageEl.className = `message-bubble ${role}-message`;
            
            // マークダウンの可能性がある内容かチェック（windowオブジェクトのisMdContent関数を使用）
            const isMd = role === 'assistant' && typeof (window as any).isMdContent === 'function' 
                ? (window as any).isMdContent(text) 
                : false;
                
            if (isMd) {
                // markdownクラスを追加
                messageEl.classList.add('markdown-content');
                
                // renderMarkdown関数を使用（windowオブジェクトから）
                if (typeof (window as any).renderMarkdown === 'function') {
                    messageEl.innerHTML = (window as any).renderMarkdown(text);
                } else {
                    // レンダリング関数がない場合はテキストとして表示
                    messageEl.textContent = text;
                }
            } else {
                // 通常のテキストとして表示
                messageEl.textContent = text;
            }
        }
        
        messageArea.appendChild(messageEl);
        
        // 自動スクロール
        messageArea.scrollTop = messageArea.scrollHeight;
        
        // 会話を保存（システムメッセージは保存しない）
        if (shouldSave && role !== 'system') {
            saveMessageToConversation(text, role);
        }
    };
    
    // 会話にメッセージを保存
    const saveMessageToConversation = async (content: string, role: 'user' | 'assistant') => {
        // 会話IDがない場合は新規作成
        if (!currentConversationId) {
            currentConversationId = await createNewConversation();
        }
        
        const conversation = conversationStorage.getConversation(currentConversationId) || {
            id: currentConversationId,
            title: '新しい会話',
            messages: [],
            createdAt: Date.now()
        };
        
        // メッセージを追加
        conversation.messages.push({
            role,
            content
        });
        
        // サーバーにメッセージを保存
        try {
            await saveMessageToServer({ role, content }, currentConversationId);
        } catch (error) {
            debug('サーバーへのメッセージ保存エラー', error);
        }
        
        // タイトルが未設定または最初のユーザーメッセージの場合、タイトルを更新
        if ((conversation.title === '新しい会話' && role === 'user') || 
            (conversation.messages.length === 2 && conversation.messages[0].role === 'user')) {
            
            // エージェントにタイトルを問い合わせ
            const newTitle = await generateTitle(conversation.messages);
            conversation.title = newTitle;
            
            // サーバーのスレッドタイトルも更新
            try {
                const response = await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_THREAD(currentConversationId)}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: newTitle
                    })
                });
                
                if (!response.ok) {
                    debug('サーバースレッドタイトル更新エラー', await response.text());
                }
            } catch (error) {
                debug('サーバースレッドタイトル更新エラー', error);
            }
        }
        
        // 保存
        conversationStorage.saveConversation(conversation);
    };
    
    // エンドポイントを変更する関数
    const changeEndpoint = (newEndpoint: string) => {
        debug(`エンドポイント変更: ${newEndpoint}`);
        currentEndpoint = newEndpoint;
        return currentEndpoint;
    };
    
    // 直接APIにリクエストを送信する関数（代替手段）
    const directApiRequest = async (url: string, method: string, body: any): Promise<any> => {
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                debug('APIエラーレスポンス', { status: response.status, error: errorText });
                throw new Error(`HTTP エラー ${response.status}: ${errorText}`);
            }
            
            try {
                const data = await response.json();
                return data;
            } catch (e) {
                const text = await response.text();
                debug('JSONではないレスポンス', text);
                return { text };
            }
        } catch (error) {
            debug('APIリクエストエラー', error);
            throw error;
        }
    };
    
    // 自動接続・初期化
    const initialize = async () => {
        try {
            debug('初期化開始');
            addMessage('サーバーに接続中...', 'system');
            
            // クライアント初期化
            xiboClient = new XiboClient({ baseUrl });
            
            addMessage(`サーバー(${baseUrl})に接続しました`, 'system');
            addMessage(`エージェント「${agentId}」を取得中...`, 'system');
            
            // エージェント取得
            agent = xiboClient.getAgent(agentId);
            
            addMessage(`エージェント「${agentId}」を取得しました`, 'system');
            
            // サーバーからの会話履歴を同期
            addMessage('会話履歴を同期中...', 'system');
            await syncConversations();
            
            sendMessageBtn.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
            
            // 会話履歴を表示
            renderChatHistory();
            
            // 既存の会話がある場合は最新の会話を読み込む
            const conversations = conversationStorage.getConversations();
            if (conversations.length > 0) {
                // 最新の会話を取得（日付順に並べ替え）
                conversations.sort((a, b) => b.createdAt - a.createdAt);
                const latestConversation = conversations[0];
                
                debug('最新の会話を読み込みます', latestConversation.title);
                loadConversation(latestConversation.id);
                addMessage('前回の会話を復元しました', 'system');
            } else {
                // 会話がない場合は新規作成
                debug('会話履歴がないため、新しい会話を作成します');
                await createNewConversation();
                addMessage('新しい会話を開始しました', 'system');
            }
        } catch (error) {
            debug('初期化エラー', error);
            addMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`, 'system');
            sendMessageBtn.disabled = true;
            messageInput.disabled = true;
        }
    };
    
    // メッセージ送信関数
    const sendMessage = async (text: string) => {
        if (!agent || !xiboClient) {
            addMessage('エラー: エージェントが初期化されていません', 'system');
            return;
        }
        
        if (!text.trim()) return;
        
        // ユーザーメッセージを表示
        addMessage(text, 'user');
        
        try {
            // 送信ボタンを無効化
            sendMessageBtn.disabled = true;
            messageInput.disabled = true;
            
            // エージェントにメッセージを送信
            const generateRequest = {
                messages: [
                    {
                        role: "user",
                        content: text
                    }
                ]
            };
            
            // まず直接APIリクエストで試行
            try {
                const directResponse = await directApiRequest(
                    `${baseUrl}${currentEndpoint}`,
                    'POST',
                    generateRequest
                );
                
                if (directResponse && directResponse.text) {
                    addMessage(directResponse.text, 'assistant');
                } else {
                    throw new Error('応答のテキストフィールドがありません');
                }
            } catch (directError) {
                debug('APIリクエストエラー', directError);
                
                // 代替エンドポイントを試す
                try {
                    const altEndpoint = changeEndpoint(API_ENDPOINTS.ALTERNATIVE);
                    addMessage(`代替エンドポイントを試します...`, 'system');
                    
                    const altResponse = await directApiRequest(
                        `${baseUrl}${altEndpoint}`,
                        'POST',
                        generateRequest
                    );
                    
                    if (altResponse && altResponse.text) {
                        addMessage(altResponse.text, 'assistant');
                    } else {
                        // フォールバックを試す
                        const fallbackEndpoint = changeEndpoint(API_ENDPOINTS.FALLBACK);
                        addMessage(`フォールバックエンドポイントを試します...`, 'system');
                        
                        const fallbackResponse = await directApiRequest(
                            `${baseUrl}${fallbackEndpoint}`,
                            'POST',
                            generateRequest
                        );
                        
                        if (fallbackResponse && fallbackResponse.text) {
                            addMessage(fallbackResponse.text, 'assistant');
                        } else {
                            addMessage('すべてのAPIエンドポイントが応答しませんでした。サーバー設定を確認してください。', 'system');
                        }
                    }
                } catch (altError) {
                    debug('代替/フォールバックエンドポイントエラー', altError);
                    addMessage('すべてのAPIエンドポイントでエラーが発生しました。', 'system');
                    
                    // 通常のエージェントAPIでも試してみる
                    addMessage('通常のエージェントAPIを試します...', 'system');
                    try {
                        const response = await agent.generate(generateRequest);
                        
                        if (response && response.text) {
                            addMessage(response.text, 'assistant');
                        } else {
                            addMessage('エージェントからの応答が無効です', 'system');
                        }
                    } catch (agentError) {
                        debug('エージェントAPI呼び出しエラー', agentError);
                        addMessage(`エージェントAPI呼び出しエラー: ${agentError instanceof Error ? agentError.message : '不明なエラー'}`, 'system');
                    }
                }
            }
        } catch (error) {
            debug('メッセージ送信エラー', error);
            addMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`, 'system');
        } finally {
            // 送信ボタンを再度有効化
            sendMessageBtn.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
            
            // テキストエリアをクリアして高さをリセット
            messageInput.value = '';
            messageInput.style.height = 'auto';
        }
    };
    
    // 送信ボタンのイベントハンドラ
    sendMessageBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });
    
    // テキストエリアの自動リサイズ設定
    const setupTextareaAutoResize = () => {
        // IME入力中かを追跡するフラグ
        let isComposing = false;
        
        // IME入力開始イベント
        messageInput.addEventListener('compositionstart', function() {
            isComposing = true;
        });
        
        // IME入力終了イベント
        messageInput.addEventListener('compositionend', function() {
            isComposing = false;
        });
        
        // 入力に応じて高さをリセットして自動調整
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 120); // 最大5行程度（約120px）
            this.style.height = newHeight + 'px';
        });
    };

    // Enterキーでの送信
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // IME入力中はEnterキーでの送信を無効化
            const isComposing = e.isComposing || 'isComposing' in e;
            
            if (!e.shiftKey && !isComposing) {
                // Enterキーのみ: 送信
                (e as KeyboardEvent).preventDefault();
                sendMessageBtn.click();
            }
            // Shift+Enterは通常の改行として処理される（デフォルト動作）
        }
    });
    
    // 新規会話ボタンのイベントハンドラ
    newChatBtn.addEventListener('click', () => {
        createNewConversation();
    });
    
    // 初期状態の設定
    sendMessageBtn.disabled = true;
    messageInput.disabled = true;
    
    // テキストエリア設定を初期化
    setupTextareaAutoResize();
    
    // 自動接続・初期化を実行
    initialize();

    // すべての会話履歴を削除する関数
    const clearAllConversations = async () => {
        try {
            const conversations = conversationStorage.getConversations();
            
            // サーバー側の会話も削除
            for (const conversation of conversations) {
                try {
                    await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_THREAD(conversation.id)}`, {
                        method: 'DELETE'
                    });
                    debug(`サーバーからスレッド削除: ${conversation.id}`);
                } catch (error) {
                    debug(`サーバースレッド削除エラー: ${conversation.id}`, error);
                }
            }
            
            // ローカルストレージをクリア
            localStorage.removeItem('xibo_conversations');
            
            // 会話履歴を再描画
            renderChatHistory();
            
            // 現在の会話IDをリセット
            currentConversationId = '';
            
            // メッセージエリアをクリア
            messageArea.innerHTML = '';
            
            addMessage('すべての会話履歴を削除しました', 'system');
        } catch (error) {
            debug('会話履歴クリアエラー', error);
            addMessage('会話履歴の削除中にエラーが発生しました', 'system');
        }
    };

    // 特定の会話を削除する関数
    const deleteConversation = async (conversationId: string) => {
        try {
            // サーバー側のスレッドを削除
            try {
                await fetch(`${baseUrl}${API_ENDPOINTS.MEMORY_THREAD(conversationId)}`, {
                    method: 'DELETE'
                });
                debug(`サーバーからスレッド削除: ${conversationId}`);
            } catch (error) {
                debug(`サーバースレッド削除エラー: ${conversationId}`, error);
            }
            
            // ローカルストレージから削除
            conversationStorage.deleteConversation(conversationId);
            
            // 削除した会話が現在表示中の会話だった場合
            if (currentConversationId === conversationId) {
                currentConversationId = '';
                messageArea.innerHTML = '';
                
                // 他の会話があれば最初の会話を表示
                const conversations = conversationStorage.getConversations();
                if (conversations.length > 0) {
                    loadConversation(conversations[0].id);
                } else {
                    // 会話がなければ新しい会話を作成
                    await createNewConversation();
                }
            }
        } catch (error) {
            debug('会話削除エラー', error);
            addMessage(`会話の削除中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`, 'system');
        }
    };

    // 設定の変更を反映する関数
    const updateConfig = (newConfig: AppConfig) => {
        if (saveConfig(newConfig)) {
            // サーバー接続先が変更された場合は再接続
            if (newConfig.serverUrl !== baseUrl) {
                baseUrl = newConfig.serverUrl;
                // 既存の接続を閉じて再初期化
                xiboClient = null;
                agent = null;
                initialize();
            }
            
            // 表示モードの適用はHTML側で行います
            
            return true;
        }
        return false;
    };
    
    // グローバルに設定更新関数を公開（HTML側から呼び出せるようにする）
    (window as any).updateXiboConfig = updateConfig;
    (window as any).getXiboConfig = () => config;
}); 