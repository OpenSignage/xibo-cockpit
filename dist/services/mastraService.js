"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastraService = void 0;
const client_js_1 = require("@mastra/client-js");
class MastraService {
    constructor(endpoint) {
        this.agentClient = null;
        this.memoryClient = null;
        this.userId = 'captain'; // 将来的にユーザー認証で置き換え
        this.initializationPromise = null;
        this.endpoint = endpoint;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // 初期化が進行中の場合は、そのPromiseを返す
            if (this.initializationPromise) {
                return this.initializationPromise;
            }
            // 新しい初期化処理を開始
            this.initializationPromise = this._initialize();
            return this.initializationPromise;
        });
    }
    _initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = new client_js_1.MastraClient({
                    baseUrl: this.endpoint
                });
                // 利用可能なエージェントの一覧を取得
                const agents = yield client.getAgents();
                console.log('Available agents:', Object.entries(agents).map(([id, agent]) => ({
                    id,
                    name: agent.name,
                    provider: agent.provider,
                    modelId: agent.modelId
                })));
                // IDが'xibo'のエージェントを取得
                const xiboAgentId = 'xibo';
                if (!agents[xiboAgentId]) {
                    throw new Error('xibo-agent not found');
                }
                this.agentClient = client.getAgent(xiboAgentId);
                this.memoryClient = client;
                console.log('Connected to xibo-agent at', this.endpoint);
                return true;
            }
            catch (error) {
                console.error('Failed to connect to xibo-agent:', error);
                this.agentClient = null;
                this.memoryClient = null;
                this.initializationPromise = null;
                return false;
            }
        });
    }
    updateEndpoint(endpoint) {
        this.endpoint = endpoint;
        this.agentClient = null;
        this.memoryClient = null;
        this.initializationPromise = null;
    }
    ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agentClient || !this.memoryClient) {
                yield this.initialize();
            }
            if (!this.agentClient || !this.memoryClient) {
                throw new Error('Failed to connect to xibo-agent');
            }
        });
    }
    sendMessage(message, onStreamUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            try {
                let fullResponse = '';
                console.log('Sending message to agent:', { message });
                // streamモードで通信
                const response = yield this.agentClient.stream({
                    messages: [{ role: 'user', content: message }],
                    threadId: 'xibo',
                    resourceId: this.userId
                });
                console.log('Stream response received');
                // ストリームデータを処理
                yield response.processDataStream({
                    onTextPart: (text) => {
                        fullResponse += text; // テキストを累積的に追加
                        console.log('Stream text part received:', { text });
                        onStreamUpdate(fullResponse); // 累積されたテキストを送信
                    },
                    onErrorPart: (error) => {
                        console.error('Stream error:', error);
                        throw error;
                    }
                });
                console.log('Final response:', { fullResponse });
                return fullResponse;
            }
            catch (error) {
                console.error('Error sending message to xibo-agent:', error);
                throw error;
            }
        });
    }
    // 会話スレッドの取得
    getConversationThreads() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                console.log('Getting conversation threads...');
                const threads = yield this.memoryClient.getMemoryThreads({
                    resourceId: this.userId,
                    agentId: 'xibo'
                });
                console.log('Raw threads from API:', threads);
                const mappedThreads = yield Promise.all(threads.map((thread) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    console.log('Processing thread:', thread);
                    const threadDetails = yield this.memoryClient.getMemoryThread(thread.id, 'xibo').get();
                    console.log('Thread details:', threadDetails);
                    const messages = threadDetails.messages || [];
                    const lastMessage = messages[messages.length - 1];
                    const metadata = {
                        userId: this.userId,
                        agentId: 'xibo',
                        memoryId: thread.id,
                        messageCount: messages.length,
                        createdAt: ((_a = threadDetails.metadata) === null || _a === void 0 ? void 0 : _a.createdAt) || new Date().toISOString(),
                        lastUpdated: ((_b = threadDetails.metadata) === null || _b === void 0 ? void 0 : _b.lastUpdated) || new Date().toISOString()
                    };
                    const conversation = {
                        id: thread.id,
                        title: threadDetails.title || ((_c = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) === null || _c === void 0 ? void 0 : _c.slice(0, 30)) || '新しい会話',
                        messages: messages.map((msg) => ({
                            id: msg.id,
                            role: msg.role,
                            content: msg.content,
                            timestamp: msg.createdAt
                        })),
                        metadata
                    };
                    console.log('Mapped conversation:', conversation);
                    return conversation;
                })));
                console.log('Final mapped threads:', mappedThreads);
                return mappedThreads;
            }
            catch (error) {
                console.error('Error getting conversation threads:', error);
                throw error;
            }
        });
    }
    // 新しい会話スレッドの作成
    createConversationThread() {
        return __awaiter(this, arguments, void 0, function* (title = '新しい会話') {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                console.log('Creating new conversation thread with title:', title);
                const thread = yield this.memoryClient.createMemoryThread({
                    title,
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        messageCount: 0,
                        userId: this.userId
                    },
                    resourceId: this.userId,
                    agentId: 'xibo'
                });
                console.log('Created thread from API:', thread);
                const metadata = {
                    userId: this.userId,
                    agentId: 'xibo',
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
            }
            catch (error) {
                console.error('Error creating conversation thread:', error);
                throw error;
            }
        });
    }
    // 会話スレッドの削除
    deleteConversationThread(threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                console.log('Deleting conversation thread:', threadId);
                const thread = this.memoryClient.getMemoryThread(threadId, 'xibo');
                yield thread.delete();
                console.log('Successfully deleted thread:', threadId);
            }
            catch (error) {
                console.error('Error deleting conversation thread:', error);
                throw error;
            }
        });
    }
    // メッセージの保存
    saveMessage(threadId, message, onTitleUpdated) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                const timestamp = new Date().toISOString();
                console.log('Saving message:', { threadId, message, timestamp });
                // メッセージを保存
                const savedMessage = yield this.memoryClient.saveMessageToMemory({
                    messages: [{
                            role: message.role,
                            content: message.content,
                            id: message.id,
                            threadId: threadId,
                            createdAt: timestamp,
                            type: 'text'
                        }],
                    agentId: 'xibo'
                });
                console.log('Message saved successfully:', { savedMessage });
                // スレッドの詳細を取得して新しいタイトルを確認
                const thread = this.memoryClient.getMemoryThread(threadId, 'xibo');
                const details = yield thread.get();
                console.log('Thread details after save:', details);
                // タイトルが更新されている場合は、コールバックを呼び出す
                if (details.title && details.title !== '新しい会話' && onTitleUpdated) {
                    console.log('Thread title updated:', details.title);
                    onTitleUpdated(details.title);
                }
            }
            catch (error) {
                console.error('Error saving message:', error);
                throw error;
            }
        });
    }
    // スレッドのタイトルを更新
    updateThreadTitle(threadId, title) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                const thread = this.memoryClient.getMemoryThread(threadId, 'xibo');
                const updated = yield thread.update({
                    title,
                    metadata: { status: "active" },
                    resourceId: this.userId
                });
                console.log('Updated thread:', updated);
            }
            catch (error) {
                console.error('Error updating thread title:', error);
                throw error;
            }
        });
    }
    // スレッドのメッセージ履歴を取得
    getThreadMessages(threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                console.log('Getting messages for thread:', threadId);
                // 直接APIを呼び出してメッセージを取得
                const response = yield fetch(`${this.endpoint}/api/memory/threads/${threadId}/messages?agentId=xibo`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.statusText}`);
                }
                const data = yield response.json();
                console.log('Retrieved messages:', data);
                // messages配列を取得
                const messages = data.messages || [];
                if (!Array.isArray(messages) || messages.length === 0) {
                    console.warn('No messages found in thread');
                    return [];
                }
                return messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.createdAt,
                    metadata: {
                        memoryId: threadId
                    }
                }));
            }
            catch (error) {
                console.error('Error getting thread messages:', error);
                throw error;
            }
        });
    }
    getConversationThread(threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log('Getting conversation thread:', threadId);
            try {
                const thread = yield this.memoryClient.getMemoryThread(threadId, 'xibo');
                console.log('Thread object:', thread);
                const details = yield thread.get();
                console.log('Raw thread data:', details);
                // メッセージを直接取得
                const messages = yield this.getThreadMessages(threadId);
                console.log('Retrieved messages:', messages);
                const conversation = {
                    id: details.id,
                    title: details.title || '新しい会話',
                    messages: messages,
                    metadata: {
                        userId: this.userId,
                        agentId: 'xibo',
                        memoryId: details.id,
                        messageCount: messages.length,
                        createdAt: ((_a = details.metadata) === null || _a === void 0 ? void 0 : _a.createdAt) || new Date().toISOString(),
                        lastUpdated: ((_b = details.metadata) === null || _b === void 0 ? void 0 : _b.lastUpdated) || new Date().toISOString()
                    }
                };
                console.log('Mapped conversation:', conversation);
                return conversation;
            }
            catch (error) {
                console.error('Error getting conversation thread:', error);
                throw error;
            }
        });
    }
    // アシスタントの応答を生成
    generateResponse(content, threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.memoryClient) {
                yield this.initialize();
            }
            try {
                const response = yield this.memoryClient.generateResponse({
                    agentId: 'xibo',
                    threadId,
                    message: content
                });
                return response;
            }
            catch (error) {
                console.error('Error generating response:', error);
                throw error;
            }
        });
    }
}
exports.MastraService = MastraService;
//# sourceMappingURL=mastraService.js.map