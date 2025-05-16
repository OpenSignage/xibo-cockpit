// クライアント設定インターフェース
export interface XiboClientConfig {
    baseUrl: string;
    retries?: number;
    backoffMs?: number;
    maxBackoffMs?: number;
    headers?: Record<string, string>;
}

// メッセージインターフェース
export interface Message {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

// 生成リクエストインターフェース
export interface GenerateRequest {
    messages: Message[];
    stream?: boolean;
    temperature?: number;
    maxTokens?: number;
}

// 生成レスポンスインターフェース
export interface GenerateResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
} 