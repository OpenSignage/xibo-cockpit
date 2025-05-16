# Xibo Cockpit

Xibo Cockpitは、Xibo Agent用のクライアントアプリケーションです。このクライアントを使用してXibo CMSデジタルサイネージシステムを制御・管理できます。

## 機能

- Xibo Agentサーバーへの接続
- エージェントとの対話
- メッセージの送信と応答の取得
- ストリーミングレスポンスのサポート

## 使い方

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build
```

### 設定

ブラウザでクライアントを開き、以下の設定を行ってください：

1. **接続設定**: Xibo AgentサーバーのURL（デフォルト: http://localhost:4111）を入力し、「接続」をクリック
2. **エージェント管理**: 使用するエージェントのIDを入力
3. **メッセージ送信**: エージェントに送信するメッセージを入力して「送信」をクリック

## 開発

このプロジェクトはTypeScriptで開発されており、Webpackを使用してビルドされます。

### プロジェクト構造

```
/
├── dist/            - ビルド済みファイル
│   ├── index.html   - メインHTMLファイル
│   └── bundle.js    - ビルド済みJavaScriptバンドル
├── src/             - ソースコード
│   ├── index.ts     - メインエントリーポイント
│   ├── xiboClient.ts - Xibo Clientクラス
│   └── xiboAgent.ts - Xibo Agentクラス
├── package.json     - NPM設定
└── tsconfig.json    - TypeScript設定
```

## ライセンス

ISC
