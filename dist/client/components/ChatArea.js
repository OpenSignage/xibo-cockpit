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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const utils_1 = require("../../utils");
const mastraService_1 = require("../../services/mastraService");
const ChatArea = ({ conversation, settings, onUpdateConversation }) => {
    const [input, setInput] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [streamedResponse, setStreamedResponse] = (0, react_1.useState)('');
    const endOfMessagesRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const mastraServiceRef = (0, react_1.useRef)(null);
    // Mastraサービスの初期化
    (0, react_1.useEffect)(() => {
        if (!mastraServiceRef.current || mastraServiceRef.current.endpoint !== settings.endpoint) {
            mastraServiceRef.current = new mastraService_1.MastraService(settings.endpoint);
            mastraServiceRef.current.initialize();
        }
    }, [settings.endpoint]);
    // メッセージが増えたら自動スクロール
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = endOfMessagesRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [conversation === null || conversation === void 0 ? void 0 : conversation.messages, streamedResponse]);
    // メッセージ送信処理
    const handleSendMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!input.trim() || !conversation || isLoading)
            return;
        // マークダウンのコード表記をエスケープしないようにそのまま送信
        const userMessage = (0, utils_1.createMessage)(input, 'user');
        // UIの更新とユーザーメッセージをConversationsに追加
        const updatedConversation = Object.assign(Object.assign({}, conversation), { messages: [...conversation.messages, userMessage], lastUpdated: Date.now() });
        onUpdateConversation(updatedConversation);
        setInput('');
        setIsLoading(true);
        setStreamedResponse('');
        try {
            if (!mastraServiceRef.current) {
                throw new Error('Mastra service not initialized');
            }
            // ストリーミング応答を受け取る
            yield mastraServiceRef.current.sendMessage(input, (content) => {
                setStreamedResponse(content);
            });
            // 完了したら会話履歴に追加
            const assistantMessage = (0, utils_1.createMessage)(streamedResponse, 'assistant');
            const finalConversation = Object.assign(Object.assign({}, updatedConversation), { messages: [...updatedConversation.messages, assistantMessage], lastUpdated: Date.now() });
            onUpdateConversation(finalConversation);
            setStreamedResponse('');
        }
        catch (error) {
            console.error('Failed to send message:', error);
            // エラーメッセージを表示
            const errorMessage = (0, utils_1.createMessage)('エラーが発生しました。接続設定を確認してください。', 'assistant');
            const errorConversation = Object.assign(Object.assign({}, updatedConversation), { messages: [...updatedConversation.messages, errorMessage], lastUpdated: Date.now() });
            onUpdateConversation(errorConversation);
        }
        finally {
            setIsLoading(false);
            // 入力欄にフォーカスを戻す
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    });
    // メッセージ表示コンポーネント
    const MessageComponent = ({ message }) => {
        const isUser = message.role === 'user';
        return ((0, jsx_runtime_1.jsxs)("div", { className: `mb-4 ${isUser ? 'pl-12' : 'pr-12'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `flex ${isUser ? 'justify-end' : 'justify-start'}`, children: (0, jsx_runtime_1.jsx)("div", { className: `max-w-3xl p-4 rounded-lg ${isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'}`, children: isUser ? ((0, jsx_runtime_1.jsx)("div", { children: message.content })) : ((0, jsx_runtime_1.jsx)("div", { className: "markdown-content", children: (0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default], components: {
                                    pre: ({ children }) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                    var _a;
                                                    // childrenの型情報が不明なため、安全な方法でコードを取得
                                                    const code = typeof children === 'string'
                                                        ? children
                                                        : (children && typeof children === 'object' && 'props' in children)
                                                            ? String(((_a = children.props) === null || _a === void 0 ? void 0 : _a.children) || '')
                                                            : '';
                                                    navigator.clipboard.writeText(code);
                                                }, className: "absolute top-2 right-2 bg-gray-700 text-white rounded px-2 py-1 text-xs", children: "\u30B3\u30D4\u30FC" }), (0, jsx_runtime_1.jsx)("pre", { className: "bg-gray-800 p-4 rounded-md overflow-x-auto text-white my-2", children: children })] }))
                                }, children: message.content }) })) }) }), (0, jsx_runtime_1.jsx)("div", { className: `text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`, children: new Date(message.timestamp).toLocaleTimeString() })] }));
    };
    // キー入力でのメッセージ送信
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800", children: !conversation ? ((0, jsx_runtime_1.jsx)("div", { className: "h-full flex items-center justify-center text-gray-500 dark:text-gray-400", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold mb-2", children: "Xibo Cockpit" }), (0, jsx_runtime_1.jsx)("p", { children: "\u5DE6\u5074\u306E\u30B5\u30A4\u30C9\u30D0\u30FC\u304B\u3089\u65B0\u898F\u4F1A\u8A71\u3092\u958B\u59CB\u3057\u3066\u304F\u3060\u3055\u3044" })] }) })) : ((0, jsx_runtime_1.jsxs)("div", { children: [conversation.messages.map((msg) => ((0, jsx_runtime_1.jsx)(MessageComponent, { message: msg }, msg.id))), streamedResponse && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 pr-12", children: (0, jsx_runtime_1.jsx)("div", { className: "flex justify-start", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-3xl p-4 rounded-lg bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white", children: (0, jsx_runtime_1.jsx)("div", { className: "markdown-content", children: (0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default], children: streamedResponse }) }) }) }) })), (0, jsx_runtime_1.jsx)("div", { ref: endOfMessagesRef })] })) }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-900", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("textarea", { ref: inputRef, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: handleKeyDown, placeholder: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...", className: "flex-1 p-2 border rounded-l dark:bg-gray-800 dark:text-white dark:border-gray-700", disabled: !conversation || isLoading, rows: 2 }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSendMessage, disabled: !conversation || isLoading || !input.trim(), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r transition disabled:opacity-50", children: isLoading ? '処理中...' : '送信' })] }) })] }));
};
exports.default = ChatArea;
//# sourceMappingURL=ChatArea.js.map