"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_CONFIG = exports.DEFAULT_SETTINGS = void 0;
exports.DEFAULT_SETTINGS = {
    endpoint: 'http://localhost:4111',
    agent: 'xibo',
    timezone: 'Asia/Tokyo',
    defaultAdmin: 'captain',
    defaultPassword: 'administrator',
    darkMode: true,
    language: 'ja'
};
// サーバーサイドでのみ使用する設定
exports.SERVER_CONFIG = {
    PORT: process.env.PORT || 3000
};
//# sourceMappingURL=default.js.map