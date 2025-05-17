// UI関連の処理

/**
 * テキストエリアの高さを自動調整する関数
 */
function setupTextareaAutoResize() {
    const textarea = document.getElementById('message-input');
    if (!textarea) return;
    
    // 入力に応じて高さをリセットして自動調整
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        const newHeight = Math.min(this.scrollHeight, 120); // 最大5行程度（約120px）
        this.style.height = newHeight + 'px';
    });
    
    // IME入力中かを追跡するフラグ
    let isComposing = false;
    
    // IME入力開始イベント
    textarea.addEventListener('compositionstart', function() {
        isComposing = true;
    });
    
    // IME入力終了イベント
    textarea.addEventListener('compositionend', function() {
        isComposing = false;
    });
    
    // Enterキーでの送信とShift+Enterでの改行を制御
    textarea.addEventListener('keydown', function(e) {
        // IME入力中はEnterキーでの送信を無効化
        if (e.key === 'Enter' && !isComposing) {
            if (!e.shiftKey) {
                e.preventDefault();
                document.getElementById('send-message-btn').click();
            }
        }
    });
}

/**
 * 設定モーダルの処理をセットアップする関数
 */
function setupSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-settings');
    const saveBtn = document.getElementById('save-settings');
    
    if (!settingsBtn || !settingsModal) return;
    
    // 設定ボタンクリックでモーダルを表示
    settingsBtn.addEventListener('click', function() {
        // 現在の設定を読み込む
        if (window.xiboConfig && typeof window.xiboConfig.getXiboConfig === 'function') {
            const config = window.xiboConfig.getXiboConfig();
            loadConfigValues(config);
        }
        settingsModal.style.display = 'block';
    });
    
    // 閉じるボタンクリックでモーダルを閉じる
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            settingsModal.style.display = 'none';
        });
    }
    
    // キャンセルボタンクリックでモーダルを閉じる
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            settingsModal.style.display = 'none';
        });
    }
    
    // 保存ボタンクリックで設定を保存してモーダルを閉じる
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            if (saveSettings()) {
                settingsModal.style.display = 'none';
            }
        });
    }
    
    // モーダル外クリックでモーダルを閉じる
    window.addEventListener('click', function(event) {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
}

/**
 * 設定値をフォームに読み込む
 * @param {Object} config 設定オブジェクト
 */
function loadConfigValues(config) {
    const serverUrlInput = document.getElementById('server-url');
    const displayModeSelect = document.getElementById('display-mode');
    const languageSelect = document.getElementById('language');
    const maxHistoryInput = document.getElementById('max-history');
    
    if (!serverUrlInput || !displayModeSelect || !languageSelect || !maxHistoryInput) return;
    
    const defaultConfig = {
        serverUrl: 'http://localhost:4111',
        displayMode: 'light',
        language: 'ja',
        maxHistory: 20
    };
    
    // フォームに値をセット
    serverUrlInput.value = config.serverUrl || defaultConfig.serverUrl;
    displayModeSelect.value = config.displayMode || defaultConfig.displayMode;
    languageSelect.value = config.language || defaultConfig.language;
    maxHistoryInput.value = config.maxHistory || defaultConfig.maxHistory;
}

/**
 * 設定を保存する
 * @returns {boolean} 保存成功したかどうか
 */
function saveSettings() {
    const serverUrlInput = document.getElementById('server-url');
    const displayModeSelect = document.getElementById('display-mode');
    const languageSelect = document.getElementById('language');
    const maxHistoryInput = document.getElementById('max-history');
    
    if (!serverUrlInput || !displayModeSelect || !languageSelect || !maxHistoryInput) {
        return false;
    }
    
    const config = {
        serverUrl: serverUrlInput.value,
        displayMode: displayModeSelect.value,
        language: languageSelect.value,
        maxHistory: parseInt(maxHistoryInput.value, 10)
    };
    
    try {
        // 設定管理関数を使用
        if (window.xiboConfig && typeof window.xiboConfig.updateXiboConfig === 'function') {
            if (window.xiboConfig.updateXiboConfig(config)) {
                // 設定を適用
                if (typeof window.xiboConfig.applyDisplayMode === 'function') {
                    window.xiboConfig.applyDisplayMode(config.displayMode);
                }
                if (typeof window.xiboConfig.applyLanguage === 'function') {
                    window.xiboConfig.applyLanguage(config.language);
                }
                return true;
            }
            return false;
        }
        
        // 直接ローカルストレージに保存（フォールバック）
        localStorage.setItem('xibo_config', JSON.stringify(config));
        
        // 表示モードと言語を適用
        if (config.displayMode === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // 言語の適用はここではスキップ（複雑なため）
        
        return true;
    } catch (e) {
        console.error('設定の保存に失敗しました', e);
        return false;
    }
}

/**
 * メッセージ送信処理のセットアップ
 */
function setupMessageSending() {
    const sendButton = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('message-input');
    
    if (!sendButton || !messageInput) return;
    
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
    
    // エンターキーでの送信はsetupTextareaAutoResizeで対応済み
}

/**
 * メッセージを送信する
 */
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;
    
    const message = messageInput.value.trim();
    if (message === '') return;
    
    // メッセージを表示
    if (window.xiboMessage && typeof window.xiboMessage.addMessage === 'function') {
        window.xiboMessage.addMessage(message, 'user');
    }
    
    // 入力欄をクリア
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // 設定からサーバーURLを取得
    let serverUrl = 'http://localhost:4111';
    if (window.xiboConfig && typeof window.xiboConfig.getXiboConfig === 'function') {
        const config = window.xiboConfig.getXiboConfig();
        serverUrl = config.serverUrl || serverUrl;
    }
    
    // ストリーミングメッセージのプレースホルダーを作成
    let streamingMessage = null;
    if (window.xiboMessage && typeof window.xiboMessage.createStreamingMessage === 'function') {
        streamingMessage = window.xiboMessage.createStreamingMessage('', 'assistant');
    }
    
    // サーバーにメッセージを送信
    sendMessageToServer(serverUrl, message, streamingMessage);
}

/**
 * サーバーにメッセージを送信する
 * @param {string} serverUrl サーバーURL
 * @param {string} message メッセージ
 * @param {Object} streamingMessage ストリーミングメッセージオブジェクト
 */
function sendMessageToServer(serverUrl, message, streamingMessage) {
    try {
        // 本番環境ではここで実際のAPIリクエストを行う
        // ここではデモとしてフェイクのストリーミングレスポンスを作成
        
        // デモ用：マークダウン対応のテスト応答
        const demoResponses = [
            "これはマークダウンテストです。\n\n**太字** と *斜体* のテキストが含まれています。",
            "# マークダウン見出し\n\n- リストアイテム1\n- リストアイテム2\n\n```javascript\nconsole.log('コードブロック');\n```",
            "以下は表の例です：\n\n| 名前 | 年齢 |\n| --- | --- |\n| 田中 | 25 |\n| 佐藤 | 30 |",
            "このサンプルテキストは正常に**マークダウン**として処理されるはずです。\n\n1. 番号付きリスト\n2. 二番目の項目\n\n> 引用ブロック\n\n`インラインコード`"
        ];
        
        // ランダムにレスポンスを選択
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        
        // ストリーミングをシミュレート
        simulateStreamingResponse(randomResponse, streamingMessage);
        
    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        // エラーメッセージを表示
        if (streamingMessage) {
            streamingMessage.complete("エラーが発生しました。もう一度お試しください。");
        } else if (window.xiboMessage && typeof window.xiboMessage.addMessage === 'function') {
            window.xiboMessage.addMessage("エラーが発生しました。もう一度お試しください。", 'system');
        }
    }
}

/**
 * ストリーミングレスポンスをシミュレートする
 * @param {string} fullText 完全なテキスト
 * @param {Object} streamingMessage ストリーミングメッセージオブジェクト
 */
function simulateStreamingResponse(fullText, streamingMessage) {
    if (!streamingMessage) return;
    
    // テキストを文字ごとに分割
    const characters = fullText.split('');
    let currentIndex = 0;
    let accumulatedText = '';
    
    // SSE形式を模倣したチャンクを作成する関数
    function createSSEChunk(text) {
        return `0:"${text}"`;
    }
    
    // 文字を少しずつ追加して更新
    function addNextCharacter() {
        if (currentIndex < characters.length) {
            // 1〜5文字をランダムに選んで追加（より自然なストリーミングを模倣）
            const charsToAdd = Math.min(
                Math.floor(Math.random() * 5) + 1, 
                characters.length - currentIndex
            );
            
            const newChars = characters.slice(currentIndex, currentIndex + charsToAdd).join('');
            accumulatedText += newChars;
            currentIndex += charsToAdd;
            
            // SSE形式で更新
            streamingMessage.update(createSSEChunk(accumulatedText));
            
            // 次の文字を追加するまでのディレイ（30〜100ms）
            const delay = Math.floor(Math.random() * 70) + 30;
            setTimeout(addNextCharacter, delay);
        } else {
            // 完了
            streamingMessage.complete(fullText);
        }
    }
    
    // 最初の文字の追加を開始
    setTimeout(addNextCharacter, 300);
}

/**
 * 新規会話ボタンのセットアップ
 */
function setupNewChatButton() {
    const newChatBtn = document.getElementById('new-chat-btn');
    
    if (!newChatBtn) return;
    
    newChatBtn.addEventListener('click', function() {
        // メッセージエリアをクリア
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.innerHTML = '';
        }
        
        // 会話履歴の処理
        // TODO: 会話履歴を保存する処理
        
        // 新規会話の初期メッセージを表示（オプション）
        if (window.xiboMessage && typeof window.xiboMessage.addMessage === 'function') {
            window.xiboMessage.addMessage('新しい会話を開始しました', 'system');
        }
    });
}

/**
 * ページ読み込み時の初期化
 */
function initializeUI() {
    // テキストエリアの自動リサイズ設定
    setupTextareaAutoResize();
    
    // 設定モーダルのセットアップ
    setupSettingsModal();
    
    // メッセージ送信処理のセットアップ
    setupMessageSending();
    
    // 新規会話ボタンのセットアップ
    setupNewChatButton();
    
    // コピーボタンの確認を設定
    setupCopyButtonObserver();
    
    // 設定の初期化
    if (window.xiboConfig) {
        const config = window.xiboConfig.getXiboConfig();
        
        // 表示モードを適用
        if (typeof window.xiboConfig.applyDisplayMode === 'function') {
            window.xiboConfig.applyDisplayMode(config.displayMode);
        }
        
        // 言語を適用
        if (typeof window.xiboConfig.applyLanguage === 'function') {
            window.xiboConfig.applyLanguage(config.language);
        }
    }
}

/**
 * コピーボタンの監視設定
 */
function setupCopyButtonObserver() {
    const messageArea = document.getElementById('message-area');
    if (!messageArea) return;
    
    // 既存のメッセージのコピーボタンを確認
    if (window.xiboMessage && typeof window.xiboMessage.ensureCopyButtonsExist === 'function') {
        window.xiboMessage.ensureCopyButtonsExist();
    }
    
    // DOM変更を監視して新しいメッセージにもコピーボタンを追加
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                if (window.xiboMessage && typeof window.xiboMessage.ensureCopyButtonsExist === 'function') {
                    window.xiboMessage.ensureCopyButtonsExist();
                }
            }
        });
    });
    
    observer.observe(messageArea, { childList: true, subtree: true });
}

// DOMの読み込みが完了したら初期化
document.addEventListener('DOMContentLoaded', initializeUI);

// グローバルに公開
window.xiboUI = {
    setupTextareaAutoResize,
    setupSettingsModal,
    setupMessageSending,
    setupNewChatButton,
    initializeUI,
    setupCopyButtonObserver,
    sendMessage,
    sendMessageToServer
}; 