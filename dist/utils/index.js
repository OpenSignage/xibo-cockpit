"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocalStorage = exports.getLocalStorage = exports.createMessage = exports.createConversation = exports.getCurrentTimestamp = exports.generateId = void 0;
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
exports.generateId = generateId;
const getCurrentTimestamp = () => {
    return Date.now();
};
exports.getCurrentTimestamp = getCurrentTimestamp;
const createConversation = (title = '新しい会話') => {
    const now = new Date().toISOString();
    const metadata = {
        userId: 'captain',
        agentId: 'xibo',
        messageCount: 0,
        createdAt: now,
        lastUpdated: now
    };
    return {
        id: crypto.randomUUID(),
        title,
        messages: [],
        metadata
    };
};
exports.createConversation = createConversation;
const createMessage = (content, role) => {
    return {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date().toISOString()
    };
};
exports.createMessage = createMessage;
const getLocalStorage = (key, defaultValue) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    }
    catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};
exports.getLocalStorage = getLocalStorage;
const setLocalStorage = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error('Error writing to localStorage:', error);
    }
};
exports.setLocalStorage = setLocalStorage;
//# sourceMappingURL=index.js.map