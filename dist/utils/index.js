"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocalStorage = exports.getLocalStorage = exports.createMessage = exports.createNewConversation = exports.getCurrentTimestamp = exports.generateId = void 0;
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
exports.generateId = generateId;
const getCurrentTimestamp = () => {
    return Date.now();
};
exports.getCurrentTimestamp = getCurrentTimestamp;
const createNewConversation = () => {
    return {
        id: (0, exports.generateId)(),
        title: '新しい会話',
        messages: [],
        lastUpdated: (0, exports.getCurrentTimestamp)()
    };
};
exports.createNewConversation = createNewConversation;
const createMessage = (content, role) => {
    return {
        id: (0, exports.generateId)(),
        role,
        content,
        timestamp: (0, exports.getCurrentTimestamp)()
    };
};
exports.createMessage = createMessage;
const getLocalStorage = (key, defaultValue) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }
    catch (error) {
        console.error('LocalStorage error:', error);
        return defaultValue;
    }
};
exports.getLocalStorage = getLocalStorage;
const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error('LocalStorage error:', error);
    }
};
exports.setLocalStorage = setLocalStorage;
//# sourceMappingURL=index.js.map