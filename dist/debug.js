// デバッグ用スクリプト

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('デバッグスクリプトが実行されています');
    
    // 1秒待ってからメッセージエリアとメッセージ関数を確認
    setTimeout(function() {
        const messageArea = document.getElementById('message-area');
        console.log('メッセージエリア要素:', messageArea);
        
        // xiboMessageが存在するか確認
        console.log('window.xiboMessage:', window.xiboMessage);
        console.log('addMessage関数:', typeof window.xiboMessage?.addMessage);
        
        // 設定の確認
        console.log('window.xiboConfig:', window.xiboConfig);
        
        // マークダウン関連の確認
        console.log('window.xiboMarkdown:', window.xiboMarkdown);
        console.log('window.md:', window.md);
        
        // グローバルスコープのmarkdown-it確認
        console.log('markdownit関数:', typeof window.markdownit);
        
        // テストメッセージを表示
        if (window.xiboMessage && typeof window.xiboMessage.addMessage === 'function') {
            console.log('addMessageを呼び出します');
            window.xiboMessage.addMessage('デバッグテストメッセージです', 'system');
            window.xiboMessage.addMessage('ユーザーからのテストメッセージ', 'user');
            window.xiboMessage.addMessage('アシスタントからの返信テストです', 'assistant');
        } else {
            console.error('xiboMessage.addMessageが見つかりません');
            
            // 直接DOMに追加する代替方法
            if (messageArea) {
                console.log('直接DOMにメッセージを追加します');
                const msgEl = document.createElement('div');
                msgEl.className = 'message-bubble assistant-message';
                msgEl.textContent = 'デバッグメッセージ: addMessage関数が利用できないため、直接DOMに追加しています';
                messageArea.appendChild(msgEl);
            }
        }
    }, 1000);
});

// エラーハンドリング
window.onerror = function(message, source, lineno, colno, error) {
    console.error('グローバルエラー:', message, 'at', source, lineno, colno, error);
    
    // エラーをUIに表示
    const messageArea = document.getElementById('message-area');
    if (messageArea) {
        const errorEl = document.createElement('div');
        errorEl.className = 'system-message';
        errorEl.textContent = `エラーが発生しました: ${message}`;
        messageArea.appendChild(errorEl);
    }
    
    return false; // エラーを通常通り処理する
}; 