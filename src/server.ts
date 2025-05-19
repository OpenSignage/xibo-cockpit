import express, { Request, Response } from 'express';
import path from 'path';
import { SERVER_CONFIG } from './config/default';

const app = express();

// JSON解析のための設定
app.use(express.json());

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../dist')));

// APIエンドポイント
// これは後でクライアントサイドのJSだけで処理する可能性があるので
// 一旦コメントアウトしておきます
// app.post('/api/chat', async (req: Request, res: Response) => {
//   // 実装
// });

// すべてのルートをクライアントアプリにリダイレクト
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../assets/index.html'));
});

// サーバーの起動
app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server running on port ${SERVER_CONFIG.PORT}`);
}); 