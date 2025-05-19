"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Navbar_1 = __importDefault(require("./components/Navbar"));
const ChatArea_1 = __importDefault(require("./components/ChatArea"));
const SettingsModal_1 = __importDefault(require("./components/SettingsModal"));
const utils_1 = require("../utils");
const default_1 = require("../config/default");
const App = () => {
    // アプリケーションの状態
    const [appState, setAppState] = (0, react_1.useState)({
        conversations: [],
        currentConversationId: null,
        settings: default_1.DEFAULT_SETTINGS
    });
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    // LocalStorageから設定を読み込む
    (0, react_1.useEffect)(() => {
        const savedSettings = (0, utils_1.getLocalStorage)('settings', default_1.DEFAULT_SETTINGS);
        const savedConversations = (0, utils_1.getLocalStorage)('conversations', []);
        const currentId = (0, utils_1.getLocalStorage)('currentConversationId', null);
        setAppState({
            conversations: savedConversations,
            currentConversationId: currentId,
            settings: savedSettings
        });
        // ダークモードの設定を適用
        document.documentElement.classList.toggle('dark', savedSettings.darkMode);
    }, []);
    // 状態が変更されたらLocalStorageに保存
    (0, react_1.useEffect)(() => {
        (0, utils_1.setLocalStorage)('settings', appState.settings);
        (0, utils_1.setLocalStorage)('conversations', appState.conversations);
        (0, utils_1.setLocalStorage)('currentConversationId', appState.currentConversationId);
        // ダークモードの設定を適用
        document.documentElement.classList.toggle('dark', appState.settings.darkMode);
    }, [appState]);
    // 新しい会話を作成
    const handleNewConversation = () => {
        const newConversation = (0, utils_1.createNewConversation)();
        setAppState(prev => (Object.assign(Object.assign({}, prev), { conversations: [newConversation, ...prev.conversations], currentConversationId: newConversation.id })));
    };
    // 会話を選択
    const handleSelectConversation = (id) => {
        setAppState(prev => (Object.assign(Object.assign({}, prev), { currentConversationId: id })));
    };
    // 全ての会話を削除
    const handleDeleteAllConversations = () => {
        if (window.confirm('すべての会話を削除してもよろしいですか？')) {
            setAppState(prev => (Object.assign(Object.assign({}, prev), { conversations: [], currentConversationId: null })));
        }
    };
    // 設定を更新
    const handleUpdateSettings = (newSettings) => {
        setAppState(prev => (Object.assign(Object.assign({}, prev), { settings: newSettings })));
        setShowSettings(false);
    };
    // 現在の会話を取得
    const currentConversation = appState.currentConversationId
        ? appState.conversations.find(c => c.id === appState.currentConversationId) || null
        : null;
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)("div", { className: `flex h-screen bg-gray-50 ${appState.settings.darkMode ? 'dark' : ''}`, children: [(0, jsx_runtime_1.jsx)(Navbar_1.default, { conversations: appState.conversations, currentConversationId: appState.currentConversationId, onNewConversation: handleNewConversation, onSelectConversation: handleSelectConversation, onDeleteAllConversations: handleDeleteAllConversations, onOpenSettings: () => setShowSettings(true) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Routes, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(ChatArea_1.default, { conversation: currentConversation, settings: appState.settings, onUpdateConversation: (updatedConversation) => {
                                    setAppState(prev => (Object.assign(Object.assign({}, prev), { conversations: prev.conversations.map(c => c.id === updatedConversation.id ? updatedConversation : c) })));
                                } }) }) }) }), showSettings && ((0, jsx_runtime_1.jsx)(SettingsModal_1.default, { settings: appState.settings, onSave: handleUpdateSettings, onClose: () => setShowSettings(false) }))] }) }));
};
exports.default = App;
//# sourceMappingURL=App.js.map