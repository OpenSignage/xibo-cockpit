// メッセージエリアの参照を取得
// グローバル変数として宣言
let messageArea;

// テストメッセージを表示する
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded イベント発火');
    
    // メッセージエリアの参照を取得（DOMロード後）
    messageArea = document.getElementById('message-area');
    console.log('メッセージエリア要素:', messageArea);
    
    if (!messageArea) {
        console.error('message-area要素が見つかりません');
        // 1秒後に再試行
        setTimeout(() => {
            messageArea = document.getElementById('message-area');
            console.log('再試行後のメッセージエリア要素:', messageArea);
            if (messageArea) {
                displayTestMessage();
            }
        }, 1000);
        return;
    }
    
    // メッセージを表示
    displayTestMessage();
});

// テストメッセージを表示する関数
function displayTestMessage() {
    // テストメッセージを追加
    const testMessage = "Xibo Agentへようこそ。こちらはテストメッセージです。\nボタンが表示されていますか？";
    
    console.log('テストメッセージを表示します');
    
    // メッセージを表示する関数が存在するか確認
    if (typeof window.addMessage === 'function') {
        console.log('addMessage関数が見つかりました');
        window.addMessage(testMessage, 'assistant');
    } else {
        console.error('addMessage関数が見つかりません、代替方法を使用します');
        // 直接DOMに追加する代替方法
        const msgEl = document.createElement('div');
        msgEl.className = 'message-bubble assistant-message';
        msgEl.style.position = 'relative'; // 相対位置指定を追加
        msgEl.textContent = testMessage;
        
        // コピーボタンを作成
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '8px';
        copyBtn.style.right = '8px';
        copyBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        copyBtn.style.border = '1px solid #ddd';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.padding = '3px 6px';
        copyBtn.style.fontSize = '12px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; margin-right: 3px;">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            コピー
        `;
        
        // クリックイベントを追加
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(testMessage);
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; margin-right: 3px;">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
                コピー済
            `;
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; margin-right: 3px;">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    コピー
                `;
            }, 2000);
        });
        
        msgEl.appendChild(copyBtn);
        messageArea.appendChild(msgEl);
    }
}

// saveMessageToConversation関数のダミー実装
function saveMessageToConversation(text, role) {
    console.log(`Message saved: ${role}: ${text}`);
    // 実際の保存処理はここに実装されます
}
