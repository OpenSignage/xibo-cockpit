import { GenerateRequest, GenerateResponse } from './types';
import { XiboClient } from './xiboClient';

// デバッグログ関数
const debug = (message: string, data?: any) => {
    console.log(`[XiboAgent] ${message}`, data || '');
};

// メッセージインターフェース
export interface Message {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

/**
 * Xibo Agentとのインタラクションを管理するクラス
 */
export class XiboAgent {
    private client: XiboClient;
    private agentId: string;
    
    /**
     * XiboAgentのコンストラクタ
     * @param client XiboClientインスタンス
     * @param agentId エージェントID
     */
    constructor(client: XiboClient, agentId: string) {
        this.client = client;
        this.agentId = agentId;
        debug('XiboAgent インスタンス作成', { agentId });
    }
    
    /**
     * エージェントからレスポンスを生成する
     * @param request 生成リクエスト
     * @returns 生成レスポンス
     */
    async generate(request: GenerateRequest): Promise<GenerateResponse> {
        const endpoint = `/agents/${this.agentId}/generate`;
        const fullUrl = `${this.client['baseUrl']}${endpoint}`;
        debug('generate 呼び出し', { endpoint, fullUrl, request });
        
        try {
            debug('リクエスト送信開始');
            // 実際のリクエストを送信
            const response = await this.client.makeRequest<GenerateResponse>(endpoint, 'POST', request);
            debug('レスポンス受信成功', response);
            return response;
            
            // テスト用コードはコメントアウト
            /*
            debug('テストモード：ダミーレスポンスを使用');
            
            // APIが応答しないため、ダミーデータを返す
            const dummyResponse: GenerateResponse = {
                text: `これはダミーレスポンスです。受信メッセージ: "${request.messages[0].content}"`
            };
            
            await new Promise(resolve => setTimeout(resolve, 500)); // 通信の遅延をシミュレート
            
            debug('レスポンス受信成功（ダミー）', dummyResponse);
            return dummyResponse;
            */
        } catch (error) {
            debug('generate エラー', error);
            if (error instanceof Error) {
                throw new Error(`エージェント生成エラー: ${error.message}`);
            }
            throw error;
        }
    }
    
    /**
     * エージェントからストリーミングレスポンスを生成する
     * @param request 生成リクエスト
     * @param onChunk チャンク受信コールバック
     * @param onDone 完了コールバック
     * @param onError エラーコールバック
     */
    async generateStream(
        request: GenerateRequest,
        onChunk: (chunk: string) => void,
        onDone: (fullResponse: string) => void,
        onError: (error: Error) => void
    ): Promise<void> {
        const endpoint = `/agents/${this.agentId}/generate`;
        const streamingRequest = {
            ...request,
            stream: true
        };
        
        debug('generateStream 呼び出し', { endpoint, streamingRequest });
        
        try {
            // SSEストリーミングのための実装
            debug('SSEストリーミングリクエスト作成');
            const response = await fetch(`${this.client['baseUrl']}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify(streamingRequest)
            });
            
            debug('ストリーミングレスポンス状態', { 
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                debug('ストリーミングリクエストエラー', { errorText });
                throw new Error(`HTTP エラー ${response.status}: ${errorText}`);
            }
            
            if (!response.body) {
                debug('ストリーミングレスポンスボディなし');
                throw new Error('レスポンスボディが存在しません');
            }
            
            // ReadableStreamをテキストとして読み込む
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            
            debug('ストリーム読み取り開始');
            
            // チャンクを受信し続ける
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    debug('ストリーム読み取り完了');
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                debug('チャンク受信', { chunk });
                fullResponse += chunk;
                onChunk(chunk);
            }
            
            debug('ストリーミング完了', { fullResponse });
            onDone(fullResponse);
        } catch (error) {
            debug('generateStream エラー', error);
            if (error instanceof Error) {
                onError(new Error(`ストリーミングエラー: ${error.message}`));
            } else {
                onError(new Error('不明なストリーミングエラー'));
            }
        }
    }
    
    /**
     * エージェントの情報を取得する
     * @returns エージェント情報
     */
    async getInfo(): Promise<any> {
        const endpoint = `/agents/${this.agentId}`;
        debug('getInfo 呼び出し', { endpoint });
        
        try {
            const response = await this.client.makeRequest(endpoint);
            debug('getInfo レスポンス', response);
            return response;
        } catch (error) {
            debug('getInfo エラー', error);
            if (error instanceof Error) {
                throw new Error(`エージェント情報取得エラー: ${error.message}`);
            }
            throw error;
        }
    }
} 