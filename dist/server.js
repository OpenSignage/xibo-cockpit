"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const default_1 = require("./config/default");
const app = (0, express_1.default)();
// JSON解析のための設定
app.use(express_1.default.json());
// 静的ファイルの提供
app.use(express_1.default.static(path_1.default.join(__dirname, '../assets')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
// APIエンドポイント
// これは後でクライアントサイドのJSだけで処理する可能性があるので
// 一旦コメントアウトしておきます
// app.post('/api/chat', async (req: Request, res: Response) => {
//   // 実装
// });
// すべてのルートをクライアントアプリにリダイレクト
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../assets/index.html'));
});
// サーバーの起動
app.listen(default_1.PORT, () => {
    console.log(`Server running on port ${default_1.PORT}`);
});
//# sourceMappingURL=server.js.map