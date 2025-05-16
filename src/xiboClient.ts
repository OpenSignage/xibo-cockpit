import { XiboClientConfig, GenerateRequest, GenerateResponse } from './types';

// デバッグログ関数
const debug = (message: string, data?: any) => {
    console.log(`[XiboClient] ${message}`, data || '');
};

// XiboAgentクラスの型定義（実装はインポートしない）
export class XiboAgent {
    // このクラスへの参照のみ必要
    constructor(client: XiboClient, agentId: string) {}
    // 必要なメソッド定義を追加
    async generate(request: GenerateRequest): Promise<GenerateResponse> { return { text: '' }; }
    // 他のメソッドは省略
}

/**
 * Xibo Agent サーバーと通信するためのクライアントクラス
 */
export class XiboClient {
    private baseUrl: string;
    private retries: number;
    private backoffMs: number;
    private maxBackoffMs: number;
    private headers: Record<string, string>;
    
    /**
     * XiboClientのコンストラクタ
     * @param config クライアント設定
     */
    constructor(config: XiboClientConfig) {
        debug('XiboClient 初期化', config);
        this.baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
        this.retries = config.retries || 3;
        this.backoffMs = config.backoffMs || 300;
        this.maxBackoffMs = config.maxBackoffMs || 5000;
        this.headers = {
            'Content-Type': 'application/json',
            ...config.headers
        };
    }
    
    /**
     * 指定したIDのエージェントを取得する
     * @param agentId エージェントID
     * @returns エージェントオブジェクト
     */
    getAgent(agentId: string): XiboAgent {
        debug('getAgent 呼び出し', { agentId });
        
        if (!agentId) {
            debug('エージェントID不足エラー');
            throw new Error('エージェントIDが必要です');
        }
        
        // 実際のXiboAgentのインスタンス化は別ファイルで実装
        // ここでは型情報のみを提供
        return new XiboAgent(this, agentId);
    }
    
    /**
     * APIエンドポイントに対してリクエストを送信する
     * @param endpoint エンドポイントパス
     * @param method HTTPメソッド
     * @param body リクエストボディ
     * @returns レスポンスデータ
     */
    async makeRequest<T = any>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        debug('makeRequest 呼び出し', { url, method, body });

        let attempt = 0;
        let backoff = this.backoffMs;
        
        while (attempt < this.retries) {
            try {
                debug(`リクエスト試行 ${attempt + 1}/${this.retries}`, { url });
                
                const response = await fetch(url, {
                    method,
                    headers: this.headers,
                    body: body ? JSON.stringify(body) : undefined
                });
                
                debug('サーバーレスポンス', { 
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    ok: response.ok,
                    headers: Object.fromEntries([...response.headers])
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    debug('サーバーエラーレスポンス', { status: response.status, errorText });
                    throw new Error(`HTTP エラー ${response.status}: ${errorText}`);
                }
                
                // レスポンスがJSONかどうかを判断
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const jsonResponse = await response.json();
                    debug('JSONレスポンス受信', jsonResponse);
                    return jsonResponse as T;
                } else {
                    // JSONでない場合はテキストとして扱う
                    const textResponse = await response.text();
                    debug('テキストレスポンス受信', textResponse);
                    
                    // テキストを無理やりJSONに変換してみる (エラー処理のため)
                    try {
                        return { text: textResponse } as T;
                    } catch (parseError) {
                        debug('テキストをJSON変換できません', parseError);
                        throw new Error(`レスポンスをJSONに変換できません: ${textResponse}`);
                    }
                }
            } catch (error) {
                attempt++;
                debug(`リクエスト失敗 (${attempt}/${this.retries})`, error);
                
                if (attempt >= this.retries) {
                    debug('最大リトライ回数超過', { endpoint, method });
                    throw error;
                }
                
                // 指数バックオフによるリトライ
                debug(`${backoff}ms後にリトライ`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                backoff = Math.min(backoff * 2, this.maxBackoffMs);
            }
        }
        
        debug('最大リトライ回数到達', { endpoint, method });
        throw new Error('最大リトライ回数を超えました');
    }
} 