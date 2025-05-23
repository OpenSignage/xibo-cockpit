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
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AboutDialog_1 = require("./AboutDialog");
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-[100]", children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-96", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium mb-4", children: "\u4F1A\u8A71\u5C65\u6B74\u306E\u524A\u9664" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300 mb-4", children: "\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u305B\u307E\u305B\u3093\u3002\u672C\u5F53\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), (0, jsx_runtime_1.jsx)("button", { onClick: onConfirm, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700", children: "\u524A\u9664" })] })] })] }));
};
const Menu = ({ isOpen, onClose, onEditTitle, onDelete, position }) => {
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "menu-overlay", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "menu-container", style: { top: position.y, left: position.x }, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: onEditTitle, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-pen-to-square mr-2" }), "\u30BF\u30A4\u30C8\u30EB\u3092\u7DE8\u96C6"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: onDelete, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-trash-can mr-2" }), "\u524A\u9664"] })] })] }));
};
const SettingsMenu = ({ isOpen, onClose, onOpenSettings, position, onThemeChange, currentTheme, onDeleteAll, hasConversations, onAboutClick }) => {
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "menu-overlay", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "menu-container settings-menu", style: {
                    top: position.y,
                    left: position.x
                }, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                            onOpenSettings();
                            onClose();
                        }, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-sliders mr-2" }), "\u74B0\u5883\u8A2D\u5B9A"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: onClose, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-list-check mr-2" }), "\u8A73\u7D30\u8A2D\u5B9A"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: onClose, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-bug mr-2" }), "\u30ED\u30B0\u8868\u793A"] }), hasConversations && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                            onDeleteAll();
                            onClose();
                        }, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400 whitespace-nowrap", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-trash-can mr-2" }), "\u5168\u524A\u9664"] })), (0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                            onAboutClick();
                            onClose();
                        }, className: "w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-info mr-2" }), "About"] })] })] }));
};
const Navbar = ({ conversations, activeConversationId, onConversationSelect, onNewConversation, onDeleteConversation, onOpenSettings, onThemeChange, currentTheme, onDeleteConfirm, onDeleteAll }) => {
    const [menuState, setMenuState] = (0, react_1.useState)({
        isOpen: false,
        conversationId: null,
        position: { x: 0, y: 0 }
    });
    const [editingTitle, setEditingTitle] = (0, react_1.useState)({
        conversationId: null,
        title: ''
    });
    const [settingsMenuState, setSettingsMenuState] = (0, react_1.useState)({
        isOpen: false,
        position: { x: 0, y: 0 }
    });
    const [isAboutOpen, setIsAboutOpen] = (0, react_1.useState)(false);
    const inputRef = (0, react_1.useRef)(null);
    // 会話を日付順にソート
    const sortedConversations = [...conversations].sort((a, b) => {
        return new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime();
    });
    const formatDate = (date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diff = now.getTime() - messageDate.getTime();
        const diffMinutes = Math.floor(diff / (1000 * 60));
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        // 日付が変わっているかチェック
        const isDifferentDay = messageDate.getDate() !== now.getDate() ||
            messageDate.getMonth() !== now.getMonth() ||
            messageDate.getFullYear() !== now.getFullYear();
        if (isDifferentDay) {
            // 日付が異なる場合は年月日時分を表示
            return messageDate.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        // 同じ日の場合は相対時間を表示
        if (diffMinutes < 60) {
            return `${diffMinutes}分前`;
        }
        else if (diffHours < 24) {
            return `${diffHours}時間前`;
        }
        else {
            return messageDate.toLocaleString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };
    const handleMenuClick = (e, conversationId) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuState({
            isOpen: true,
            conversationId,
            position: { x: rect.left, y: rect.bottom }
        });
    };
    const handleEditTitle = (newTitle) => __awaiter(void 0, void 0, void 0, function* () {
        if (!editingTitle.conversationId)
            return;
        try {
            // TODO: PATCHリクエストを実装
            // const response = await fetch(`/api/conversations/${editingTitle.conversationId}`, {
            //   method: 'PATCH',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({ title: newTitle }),
            // });
            // if (!response.ok) throw new Error('Failed to update title');
            // 成功した場合の処理
            setEditingTitle({ conversationId: null, title: '' });
        }
        catch (error) {
            console.error('Error updating title:', error);
            // エラー処理
        }
    });
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleEditTitle(editingTitle.title);
        }
        else if (e.key === 'Escape') {
            setEditingTitle({ conversationId: null, title: '' });
        }
    };
    const handleSettingsClick = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setSettingsMenuState({
            isOpen: true,
            position: { x: rect.right, y: rect.top }
        });
    };
    const handleMenuClickAll = (action) => {
        switch (action) {
            case 'settings':
                onOpenSettings();
                break;
            case 'delete-all':
                onDeleteAll();
                break;
            case 'about':
                setIsAboutOpen(true);
                break;
        }
        setMenuState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false })));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "navbar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "navbar-header", children: [(0, jsx_runtime_1.jsx)("img", { src: "/images/logo.jpg", alt: "Xibo Cockpit Logo", className: "navbar-logo" }), (0, jsx_runtime_1.jsx)("h1", { className: "navbar-title", children: "Xibo Cockpit" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "navbar-new-chat", onClick: onNewConversation, children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-plus" }), "\u65B0\u3057\u3044\u4F1A\u8A71"] }), (0, jsx_runtime_1.jsx)("div", { className: "navbar-conversations", children: sortedConversations.map((conversation) => ((0, jsx_runtime_1.jsx)("div", { className: `navbar-conversation ${conversation.id === activeConversationId ? 'active' : ''}`, onClick: () => onConversationSelect(conversation.id), children: editingTitle.conversationId === conversation.id ? ((0, jsx_runtime_1.jsx)("input", { ref: inputRef, type: "text", value: editingTitle.title, onChange: (e) => setEditingTitle(prev => (Object.assign(Object.assign({}, prev), { title: e.target.value }))), onKeyDown: handleKeyDown, onBlur: () => handleEditTitle(editingTitle.title), className: "navbar-conversation-input" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "navbar-conversation-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "navbar-conversation-title", children: conversation.title }), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => handleMenuClick(e, conversation.id), className: "navbar-conversation-menu", children: (0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-ellipsis" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "navbar-conversation-date", children: formatDate(conversation.metadata.lastUpdated) })] })) }, conversation.id))) }), (0, jsx_runtime_1.jsx)("div", { className: "navbar-footer", children: (0, jsx_runtime_1.jsxs)("button", { onClick: handleSettingsClick, className: "navbar-settings", children: [(0, jsx_runtime_1.jsx)("i", { className: "fa-solid fa-gear" }), "\u8A2D\u5B9A"] }) }), (0, jsx_runtime_1.jsx)(Menu, { isOpen: menuState.isOpen, onClose: () => setMenuState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false }))), onEditTitle: () => {
                    const conversation = conversations.find(c => c.id === menuState.conversationId);
                    if (conversation) {
                        setEditingTitle({
                            conversationId: conversation.id,
                            title: conversation.title
                        });
                        setMenuState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false })));
                    }
                }, onDelete: () => {
                    if (menuState.conversationId) {
                        onDeleteConfirm(menuState.conversationId);
                        setMenuState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false })));
                    }
                }, position: menuState.position }), (0, jsx_runtime_1.jsx)(SettingsMenu, { isOpen: settingsMenuState.isOpen, onClose: () => setSettingsMenuState(prev => (Object.assign(Object.assign({}, prev), { isOpen: false }))), onOpenSettings: onOpenSettings, position: settingsMenuState.position, onThemeChange: onThemeChange, currentTheme: currentTheme, onDeleteAll: onDeleteAll, hasConversations: conversations.length > 0, onAboutClick: () => setIsAboutOpen(true) }), (0, jsx_runtime_1.jsx)(AboutDialog_1.AboutDialog, { isOpen: isAboutOpen, onClose: () => setIsAboutOpen(false) })] }));
};
exports.default = Navbar;
//# sourceMappingURL=Navbar.js.map