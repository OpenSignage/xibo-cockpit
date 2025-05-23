"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILD_INFO = exports.VERSION = void 0;
// バージョン情報
exports.VERSION = '0.8.0';
// ビルド情報
exports.BUILD_INFO = {
    buildTime: new Date().toISOString(),
    buildHash: process.env.VITE_GIT_HASH || 'unknown',
    buildNumber: process.env.VITE_BUILD_NUMBER || 'unknown'
};
//# sourceMappingURL=version.js.map