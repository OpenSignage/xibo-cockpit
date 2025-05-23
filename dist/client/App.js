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
const ChatArea_1 = require("./components/ChatArea");
const Navbar_1 = __importDefault(require("./components/Navbar"));
const SettingsDialog_1 = require("./components/SettingsDialog");
const mastraService_1 = require("../services/mastraService");
const default_1 = require("../config/default");
const DeleteConfirmDialog_1 = __importDefault(require("./components/DeleteConfirmDialog"));
const App = () => {
    const [mastraService] = (0, react_1.useState)(() => new mastraService_1.MastraService(default_1.DEFAULT_SETTINGS.endpoint));
    const [conversations, setConversations] = (0, react_1.useState)([]);
    const [currentConversationId, setCurrentConversationId] = (0, react_1.useState)(null);
    const [settings, setSettings] = (0, react_1.useState)(default_1.DEFAULT_SETTINGS);
    const [isSettingsOpen, setIsSettingsOpen] = (0, react_1.useState)(false);
    const [deleteConfirmState, setDeleteConfirmState] = (0, react_1.useState)({
        isOpen: false,
        conversationId: null
    });
    const initRef = (0, react_1.useRef)(false);
    const isMountedRef = (0, react_1.useRef)(true);
    const [currentTheme, setCurrentTheme] = (0, react_1.useState)(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });
    // コンポーネントのマウント状態を管理
    (0, react_1.useEffect)(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    (0, react_1.useEffect)(() => {
        // テーマの変更をHTML要素に適用
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(currentTheme);
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);
    // 会話の更新を監視する関数をメモ化
    const updateConversation = (0, react_1.useCallback)((conversationId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!isMountedRef.current)
            return;
        try {
            const conversation = yield mastraService.getConversationThread(conversationId);
            if (isMountedRef.current) {
                setConversations(prev => prev.map(conv => conv.id === conversation.id ? conversation : conv));
            }
        }
        catch (error) {
            console.error('Error updating conversation:', error);
        }
    }), []);
    // 会話の初期化
    (0, react_1.useEffect)(() => {
        if (initRef.current)
            return;
        initRef.current = true;
        const initializeConversations = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!isMountedRef.current)
                return;
            try {
                yield mastraService.initialize();
                const threads = yield mastraService.getConversationThreads();
                if (isMountedRef.current) {
                    console.log('Fetched conversations:', threads);
                    setConversations(threads);
                    if (threads.length > 0) {
                        setCurrentConversationId(threads[0].id);
                    }
                }
            }
            catch (error) {
                console.error('Error initializing conversations:', error);
            }
        });
        initializeConversations();
    }, []);
    const handleNewConversation = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!isMountedRef.current)
            return;
        console.log('Creating new conversation...');
        try {
            const newConversation = yield mastraService.createConversationThread();
            if (isMountedRef.current) {
                console.log('New conversation created:', newConversation);
                setConversations(prev => [...prev, newConversation]);
                setCurrentConversationId(newConversation.id);
            }
        }
        catch (error) {
            console.error('Error creating new conversation:', error);
        }
    });
    const handleDeleteConversation = (id) => __awaiter(void 0, void 0, void 0, function* () {
        if (!isMountedRef.current)
            return;
        console.log('Deleting conversation:', id);
        try {
            yield mastraService.deleteConversationThread(id);
            if (isMountedRef.current) {
                const updatedConversations = conversations.filter(conv => conv.id !== id);
                setConversations(updatedConversations);
                if (currentConversationId === id) {
                    setCurrentConversationId(updatedConversations.length > 0 ? updatedConversations[0].id : null);
                }
            }
        }
        catch (error) {
            console.error('Error deleting conversation:', error);
        }
    });
    const handleDeleteAll = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!isMountedRef.current)
            return;
        console.log('Deleting all conversations...');
        try {
            // 全てのスレッドを取得
            const threads = yield mastraService.getConversationThreads();
            // 各スレッドを削除
            for (const thread of threads) {
                yield mastraService.deleteConversationThread(thread.id);
            }
            if (isMountedRef.current) {
                setConversations([]);
                setCurrentConversationId(null);
            }
        }
        catch (error) {
            console.error('Error deleting all conversations:', error);
        }
    });
    const handleSettingsChange = (newSettings) => {
        if (!isMountedRef.current)
            return;
        console.log('Settings changed:', newSettings);
        setSettings(newSettings);
        mastraService.updateEndpoint(newSettings.endpoint);
        setIsSettingsOpen(false);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `app-container ${currentTheme === 'dark' ? 'dark' : ''}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "sidebar", children: (0, jsx_runtime_1.jsx)(Navbar_1.default, { conversations: conversations, activeConversationId: currentConversationId, onConversationSelect: setCurrentConversationId, onNewConversation: handleNewConversation, onDeleteConversation: handleDeleteConversation, onOpenSettings: () => setIsSettingsOpen(true), onThemeChange: setCurrentTheme, currentTheme: currentTheme, onDeleteConfirm: (conversationId) => {
                        setDeleteConfirmState({
                            isOpen: true,
                            conversationId
                        });
                    }, onDeleteAll: () => {
                        setDeleteConfirmState({
                            isOpen: true,
                            conversationId: null
                        });
                    } }) }), (0, jsx_runtime_1.jsx)("div", { className: "main-content", children: (0, jsx_runtime_1.jsx)(ChatArea_1.ChatArea, { mastraService: mastraService, conversationId: currentConversationId, settings: settings, onUpdateConversation: (updatedConversation) => {
                        if (isMountedRef.current) {
                            setConversations(prev => prev.map(conv => conv.id === updatedConversation.id ? updatedConversation : conv));
                        }
                    } }) }), (0, jsx_runtime_1.jsx)(SettingsDialog_1.SettingsDialog, { isOpen: isSettingsOpen, onClose: () => setIsSettingsOpen(false), settings: settings, onSettingsChange: handleSettingsChange, currentTheme: currentTheme, onThemeChange: setCurrentTheme }), (0, jsx_runtime_1.jsx)(DeleteConfirmDialog_1.default, { isOpen: deleteConfirmState.isOpen, onClose: () => setDeleteConfirmState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false }))), onConfirm: () => {
                    if (deleteConfirmState.conversationId) {
                        handleDeleteConversation(deleteConfirmState.conversationId);
                    }
                    else {
                        handleDeleteAll();
                    }
                    setDeleteConfirmState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false })));
                }, isDeleteAll: !deleteConfirmState.conversationId })] }));
};
exports.default = App;
//# sourceMappingURL=App.js.map