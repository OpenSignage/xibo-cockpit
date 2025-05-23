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
exports.ChatArea = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const uuid_1 = require("uuid");
const ChatArea = ({ mastraService, conversationId, settings, onUpdateConversation }) => {
    const [input, setInput] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [streamedResponse, setStreamedResponse] = (0, react_1.useState)('');
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const [currentConversation, setCurrentConversation] = (0, react_1.useState)(null);
    const endOfMessagesRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const isMountedRef = (0, react_1.useRef)(true);
    // 入力エリアの高さを自動調整
    const adjustTextareaHeight = () => {
        const textarea = inputRef.current;
        if (!textarea)
            return;
        // 一度高さをリセット
        textarea.style.height = '40px';
        // 新しい高さを計算
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
    };
    // 入力内容が変更されたときに高さを調整
    (0, react_1.useEffect)(() => {
        adjustTextareaHeight();
    }, [input]);
    // コンポーネントのマウント状態を管理
    (0, react_1.useEffect)(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    // 会話データの取得
    (0, react_1.useEffect)(() => {
        let isCurrentRequest = true;
        let abortController = new AbortController();
        const fetchConversation = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!conversationId || !isMountedRef.current) {
                setCurrentConversation(null);
                setStreamedResponse('');
                return;
            }
            try {
                const conversation = yield mastraService.getConversationThread(conversationId);
                if (isCurrentRequest && isMountedRef.current) {
                    setCurrentConversation(conversation);
                    setStreamedResponse('');
                }
            }
            catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                console.error('Error fetching conversation:', error);
                if (isCurrentRequest && isMountedRef.current) {
                    setCurrentConversation(null);
                    setStreamedResponse('');
                }
            }
        });
        fetchConversation();
        return () => {
            isCurrentRequest = false;
            abortController.abort();
        };
    }, [conversationId, mastraService]);
    // メッセージが増えたら自動スクロール
    (0, react_1.useEffect)(() => {
        var _a;
        if (isMountedRef.current) {
            (_a = endOfMessagesRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentConversation === null || currentConversation === void 0 ? void 0 : currentConversation.messages, streamedResponse]);
    // メッセージ送信処理
    const handleSendMessage = (content) => __awaiter(void 0, void 0, void 0, function* () {
        if (!content.trim() || !currentConversation || !isMountedRef.current)
            return;
        const abortController = new AbortController();
        const signal = abortController.signal;
        try {
            setIsLoading(true);
            const userMessage = {
                id: (0, uuid_1.v4)(),
                role: 'user',
                content: content,
                timestamp: new Date().toISOString()
            };
            // ユーザーメッセージを保存
            yield mastraService.saveMessage(currentConversation.id, userMessage, (newTitle) => {
                // タイトルが更新された場合、会話を更新
                const updatedConversation = Object.assign(Object.assign({}, currentConversation), { title: newTitle });
                setCurrentConversation(updatedConversation);
                onUpdateConversation(updatedConversation);
            });
            if (!isMountedRef.current || signal.aborted)
                return;
            // 会話を更新
            const updatedConversation = Object.assign(Object.assign({}, currentConversation), { messages: [...currentConversation.messages, userMessage] });
            setCurrentConversation(updatedConversation);
            onUpdateConversation(updatedConversation);
            // アシスタントの応答を生成（ストリーミング）
            let fullResponse = '';
            setStreamedResponse('');
            const response = yield mastraService.sendMessage(content, (text) => {
                if (isMountedRef.current && !signal.aborted) {
                    fullResponse = text;
                    setStreamedResponse(text);
                }
            });
            if (!isMountedRef.current || signal.aborted)
                return;
            const assistantMessage = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString()
            };
            // アシスタントのメッセージを保存
            yield mastraService.saveMessage(currentConversation.id, assistantMessage, (newTitle) => {
                // タイトルが更新された場合、会話を更新
                const updatedConversation = Object.assign(Object.assign({}, currentConversation), { title: newTitle });
                setCurrentConversation(updatedConversation);
                onUpdateConversation(updatedConversation);
            });
            if (!isMountedRef.current || signal.aborted)
                return;
            // 会話を更新
            const finalConversation = Object.assign(Object.assign({}, updatedConversation), { messages: [...updatedConversation.messages, assistantMessage] });
            setCurrentConversation(finalConversation);
            onUpdateConversation(finalConversation);
            setInput('');
            setStreamedResponse('');
            // テキストエリアの高さをリセット
            if (inputRef.current) {
                inputRef.current.style.height = '40px';
            }
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            console.error('Error sending message:', error);
        }
        finally {
            if (isMountedRef.current && !signal.aborted) {
                setIsLoading(false);
            }
        }
        return () => {
            abortController.abort();
        };
    });
    // メッセージ表示コンポーネント
    const MessageComponent = ({ message }) => {
        const content = Array.isArray(message.content)
            ? message.content.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n')
            : message.content;
        const [isCollapsed, setIsCollapsed] = (0, react_1.useState)(false);
        const [showCopied, setShowCopied] = (0, react_1.useState)(false);
        const contentRef = (0, react_1.useRef)(null);
        const [shouldShowCollapse, setShouldShowCollapse] = (0, react_1.useState)(false);
        // コンテンツの高さをチェックして折りたたみボタンの表示を決定
        (0, react_1.useEffect)(() => {
            const checkContentHeight = () => {
                if (contentRef.current && message.role === 'assistant') {
                    const lineHeight = 20; // 1行あたりの高さ（px）
                    const maxLines = 20; // 折りたたみ時の最大行数
                    const maxHeight = lineHeight * maxLines;
                    // コンテンツの実際の高さを取得
                    const contentHeight = contentRef.current.scrollHeight;
                    setShouldShowCollapse(contentHeight > maxHeight);
                }
            };
            // 初回チェック
            checkContentHeight();
            // コンテンツが変更されたときに再チェック
            const observer = new ResizeObserver(checkContentHeight);
            if (contentRef.current) {
                observer.observe(contentRef.current);
            }
            return () => {
                observer.disconnect();
            };
        }, [message.role, content]);
        const handleCopy = () => {
            navigator.clipboard.writeText(content);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        };
        const handleCopyToInput = () => {
            if (inputRef.current) {
                inputRef.current.value = content;
                setInput(content);
                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.style.height = '40px';
                        const scrollHeight = inputRef.current.scrollHeight;
                        inputRef.current.style.height = `${scrollHeight}px`;
                    }
                }, 0);
                inputRef.current.focus();
            }
        };
        const toggleCollapse = () => {
            setIsCollapsed(!isCollapsed);
        };
        return ((0, jsx_runtime_1.jsxs)("div", { className: `message-container ${message.role}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `message-flex ${message.role}`, children: (0, jsx_runtime_1.jsx)("div", { className: `message-content ${message.role}`, children: message.role === 'user' ? ((0, jsx_runtime_1.jsx)("div", { className: "whitespace-pre-wrap", children: content })) : ((0, jsx_runtime_1.jsx)("div", { className: "relative", children: (0, jsx_runtime_1.jsx)("div", { ref: contentRef, className: "markdown-content overflow-x-auto", style: {
                                    maxHeight: isCollapsed ? '400px' : 'none',
                                    overflowY: isCollapsed ? 'auto' : 'visible',
                                    transition: 'max-height 0.3s ease-in-out'
                                }, children: (0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default], components: {
                                        pre: ({ children }) => {
                                            var _a;
                                            // 言語を取得（```の後の文字列）
                                            let language = 'unknown';
                                            if (children && typeof children === 'object' && 'props' in children) {
                                                const className = ((_a = children.props) === null || _a === void 0 ? void 0 : _a.className) || '';
                                                const match = className.match(/language-(\w+)/);
                                                if (match) {
                                                    language = match[1];
                                                }
                                            }
                                            return ((0, jsx_runtime_1.jsxs)("div", { className: "code-block", children: [(0, jsx_runtime_1.jsxs)("div", { className: "code-block-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "code-block-language", children: language }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                                    var _a;
                                                                    const code = typeof children === 'string'
                                                                        ? children
                                                                        : (children && typeof children === 'object' && 'props' in children)
                                                                            ? String(((_a = children.props) === null || _a === void 0 ? void 0 : _a.children) || '')
                                                                            : '';
                                                                    navigator.clipboard.writeText(code);
                                                                }, className: "code-block-copy", title: "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC", children: (0, jsx_runtime_1.jsx)("i", { className: "fa-regular fa-copy" }) })] }), (0, jsx_runtime_1.jsx)("pre", { className: "code-block-content", children: children })] }));
                                        },
                                        table: ({ children }) => ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsx)("table", { className: "min-w-full border-collapse", style: { border: '1px solid var(--border-color)' }, children: children }) })),
                                        img: ({ src, alt }) => ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsx)("img", { src: src, alt: alt, className: "max-w-full h-auto" }) }))
                                    }, children: content }) }) })) }) }), message.role === 'assistant' ? ((0, jsx_runtime_1.jsxs)("div", { className: "message-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "message-timestamp", children: new Date(message.timestamp).toLocaleString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) }), (0, jsx_runtime_1.jsxs)("div", { className: "message-actions", children: [shouldShowCollapse && ((0, jsx_runtime_1.jsx)("button", { onClick: toggleCollapse, className: "message-collapse", title: isCollapsed ? '展開する' : '折りたたむ', children: (0, jsx_runtime_1.jsx)("i", { className: `fa-solid fa-angles-${isCollapsed ? 'down' : 'up'}` }) })), (0, jsx_runtime_1.jsx)("button", { onClick: handleCopy, className: "message-copy", title: "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC", children: (0, jsx_runtime_1.jsx)("i", { className: "fa-regular fa-copy" }) }), showCopied && ((0, jsx_runtime_1.jsx)("div", { className: "copy-tooltip", children: "Copied!" }))] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "message-header", children: (0, jsx_runtime_1.jsxs)("div", { className: "message-actions", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleCopy, className: "message-copy", title: "\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC", children: (0, jsx_runtime_1.jsx)("i", { className: "fa-regular fa-copy" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCopyToInput, className: "message-copy", title: "\u5165\u529B\u6B04\u306B\u30B3\u30D4\u30FC", children: (0, jsx_runtime_1.jsx)("i", { className: "fa-regular fa-keyboard" }) })] }) }))] }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "chat-area", children: [(0, jsx_runtime_1.jsxs)("div", { className: "chat-messages", children: [!currentConversation ? ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("img", { src: "/images/logo.jpg", alt: "Xibo Cockpit Logo", className: "empty-state-logo" }), (0, jsx_runtime_1.jsx)("p", { children: "\u65B0\u3057\u3044\u4F1A\u8A71\u30DC\u30BF\u30F3\u3092\u62BC\u3057\u3066\u4F1A\u8A71\u3092\u958B\u59CB\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [currentConversation.messages.map((message) => ((0, jsx_runtime_1.jsx)(MessageComponent, { message: message }, message.id))), streamedResponse && ((0, jsx_runtime_1.jsx)("div", { className: `message-container assistant`, children: (0, jsx_runtime_1.jsx)("div", { className: `message-flex assistant`, children: (0, jsx_runtime_1.jsx)("div", { className: `message-content assistant`, children: (0, jsx_runtime_1.jsx)("div", { className: "relative", children: (0, jsx_runtime_1.jsx)("div", { className: "markdown-content overflow-x-auto", children: (0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default], children: streamedResponse }) }) }) }) }) }))] })), (0, jsx_runtime_1.jsx)("div", { ref: endOfMessagesRef })] }), (0, jsx_runtime_1.jsxs)("div", { className: "chat-input-area", children: [(0, jsx_runtime_1.jsx)("textarea", { ref: inputRef, value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                                e.preventDefault();
                                handleSendMessage(input);
                            }
                        }, onCompositionStart: () => setIsComposing(true), onCompositionEnd: () => setIsComposing(false), placeholder: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...", className: "chat-textarea", disabled: isLoading }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSendMessage(input), disabled: !input.trim() || isLoading, className: "send-button", children: isLoading ? '処理中...' : '送信' })] })] }));
};
exports.ChatArea = ChatArea;
//# sourceMappingURL=ChatArea.js.map