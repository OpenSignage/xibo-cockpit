// 設定管理機能
const defaultConfig = {
    serverUrl: 'http://localhost:4111',
    displayMode: 'light',
    language: 'ja',
    maxHistory: 20
};

/**
 * 設定を読み込む
 * @returns {Object} 設定オブジェクト
 */
function getXiboConfig() {
    const savedConfig = localStorage.getItem('xibo_config');
    let config = defaultConfig;
    
    if (savedConfig) {
        try {
            config = JSON.parse(savedConfig);
        } catch (e) {
            console.error('設定の読み込みに失敗しました', e);
        }
    }
    
    return config;
}

/**
 * 設定を保存する
 * @param {Object} config 設定オブジェクト
 * @returns {boolean} 保存成功したかどうか
 */
function updateXiboConfig(config) {
    try {
        localStorage.setItem('xibo_config', JSON.stringify(config));
        return true;
    } catch (e) {
        console.error('設定の保存に失敗しました', e);
        return false;
    }
}

/**
 * 表示モードを適用
 * @param {string} mode 'light'または'dark'
 */
function applyDisplayMode(mode) {
    if (mode === 'dark') {
        document.body.classList.add('dark-mode');
        // Mermaidのテーマも変更
        if (window.mermaid) {
            window.mermaid.initialize({ 
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                logLevel: 'error'
            });
        }
    } else {
        document.body.classList.remove('dark-mode');
        // Mermaidのテーマも変更
        if (window.mermaid) {
            window.mermaid.initialize({ 
                startOnLoad: false,
                theme: 'forest',
                securityLevel: 'loose',
                logLevel: 'error'
            });
        }
    }
}

/**
 * 言語を適用
 * @param {string} lang 'ja'または'en'
 */
function applyLanguage(lang) {
    const translations = {
        ja: {
            newChat: '新規会話',
            send: '送信',
            settings: '設定',
            serverUrl: '接続先URL',
            displayMode: '表示モード',
            lightMode: 'ライトモード',
            darkMode: 'ダークモード',
            language: '言語',
            japanese: '日本語',
            english: '英語',
            cancel: 'キャンセル',
            save: '保存',
            noHistory: '会話履歴がありません',
            messagePlaceholder: 'メッセージを入力...',
            maxHistory: '会話履歴の最大数'
        },
        en: {
            newChat: 'New Chat',
            send: 'Send',
            settings: 'Settings',
            serverUrl: 'Server URL',
            displayMode: 'Display Mode',
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            language: 'Language',
            japanese: 'Japanese',
            english: 'English',
            cancel: 'Cancel',
            save: 'Save',
            noHistory: 'No conversation history',
            messagePlaceholder: 'Type a message...',
            maxHistory: 'Max Conversation History'
        }
    };
    
    const text = translations[lang] || translations.ja;
    
    // 各要素のテキストを更新
    try {
        document.getElementById('new-chat-btn').textContent = text.newChat;
        document.getElementById('send-message-btn').textContent = text.send;
        document.querySelector('.settings-text').textContent = text.settings;
        document.querySelector('.modal-title').textContent = text.settings;
        document.querySelector('label[for="server-url"]').textContent = text.serverUrl;
        document.querySelector('label[for="display-mode"]').textContent = text.displayMode;
        document.querySelector('option[value="light"]').textContent = text.lightMode;
        document.querySelector('option[value="dark"]').textContent = text.darkMode;
        document.querySelector('label[for="language"]').textContent = text.language;
        document.querySelector('option[value="ja"]').textContent = text.japanese;
        document.querySelector('option[value="en"]').textContent = text.english;
        document.querySelector('label[for="max-history"]').textContent = text.maxHistory;
        document.getElementById('cancel-settings').textContent = text.cancel;
        document.getElementById('save-settings').textContent = text.save;
        document.getElementById('message-input').placeholder = text.messagePlaceholder;
        
        // 会話履歴が空の場合のメッセージも更新
        const emptyHistoryEl = document.querySelector('.chat-item.empty');
        if (emptyHistoryEl) {
            emptyHistoryEl.textContent = text.noHistory;
        }
    } catch (e) {
        console.error('言語設定の適用に失敗しました', e);
    }
}

// グローバルに公開
window.xiboConfig = {
    getXiboConfig,
    updateXiboConfig,
    applyDisplayMode,
    applyLanguage
}; 