// メッセージ表示機能

/**
 * メッセージを表示する関数
 * @param {string} text メッセージのテキスト
 * @param {string} role ロール ('user', 'assistant', 'system')
 * @param {boolean} shouldSave 会話履歴に保存するかどうか
 * @returns {HTMLElement|null} メッセージ要素
 */
function addMessage(text, role, shouldSave = true) {
    console.log(`addMessage呼び出し: role=${role}, shouldSave=${shouldSave}, text長=${text ? text.length : 0}`);
    
    try {
        if (!text || text.trim() === '') {
            console.warn('空のメッセージは表示しません');
            return null; // 空のメッセージは表示しない
        }
        
        // message-area要素を取得
        const messageArea = document.getElementById('message-area');
        if (!messageArea) {
            console.error('message-area要素が見つかりません');
            return null;
        }
        
        const messageEl = document.createElement('div');
        
        if (role === 'system') {
            messageEl.className = 'system-message';
            messageEl.textContent = text;
        } else {
            messageEl.className = `message-bubble ${role}-message`;
            
            // 特殊なマークダウンテーブルパターンを検出
            const hasTable = (text.includes('| ユーザーID ') || 
                            text.includes('|—|') || 
                            text.includes('| — |') || 
                            text.includes('|-|') ||
                            text.includes('表') || 
                            (text.includes('|') && text.includes('\n') && text.split('\n').filter(line => line.includes('|')).length >= 2));
            
            // マークダウンの可能性がある内容かチェック
            const isMd = role === 'assistant' && 
                     (hasTable || (window.xiboMarkdown && typeof window.xiboMarkdown.isMdContent === 'function' && 
                                   window.xiboMarkdown.isMdContent(text)));
            
            if (isMd) {
                // markdownクラスを追加
                messageEl.classList.add('markdown-content');
                
                // renderMarkdown関数を使用
                if (window.xiboMarkdown && typeof window.xiboMarkdown.renderMarkdown === 'function') {
                    try {
                        messageEl.innerHTML = window.xiboMarkdown.renderMarkdown(text);
                        
                        // マークダウンレンダリング後に相対位置を確保するための処理
                        messageEl.style.position = 'relative';
                    } catch (renderError) {
                        console.error('マークダウンレンダリングエラー:', renderError);
                        // レンダリングに失敗した場合はテキストとして表示
                        messageEl.textContent = text;
                    }
                } else {
                    // レンダリング関数がない場合はテキストとして表示
                    console.warn('マークダウンレンダリング関数が見つかりません');
                    messageEl.textContent = text;
                }
            } else {
                // 通常のテキストとして表示
                // JSONデータと改行の処理
                let displayText = text;
                // JSONオブジェクト（9:{"toolCallId"など）を削除
                displayText = displayText.replace(/\d+:\s*\{.*?\}/g, '');
                displayText = displayText.replace(/[a-z]:\s*\{.*?\}/g, '');
                // 改行文字列を実際の改行に変換
                displayText = displayText.replace(/\\n/g, '\n');
                
                // <br>要素を使用して改行を表示
                messageEl.innerHTML = displayText
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line)
                    .join('<br>');
            }
            
            // Assistantのメッセージにコピーボタンを追加
            if (role === 'assistant') {
                addCopyButton(messageEl, text, isMd);
            }
        }
        
        try {
            messageArea.appendChild(messageEl);
            
            // 自動スクロール
            messageArea.scrollTop = messageArea.scrollHeight;
            
            // 会話を保存（システムメッセージは保存しない）
            if (shouldSave && role !== 'system') {
                try {
                    if (typeof saveMessageToConversation === 'function') {
                        saveMessageToConversation(text, role);
                    } else {
                        console.log('会話を保存します: ' + role + ': ' + text);
                    }
                } catch (saveError) {
                    console.error('会話保存エラー:', saveError);
                }
            }
            
            // メッセージ要素を返す（更新用）
            return messageEl;
        } catch (appendError) {
            console.error('メッセージ追加エラー:', appendError);
            return null;
        }
    } catch (error) {
        console.error('addMessage全体エラー:', error);
        return null;
    }
}

/**
 * ストリーミングメッセージを作成する関数
 * @param {string} initialText 初期テキスト
 * @param {string} role ロール ('user', 'assistant', 'system')
 * @returns {Object} メッセージ要素と更新/完了関数
 */
function createStreamingMessage(initialText, role) {
    console.log('createStreamingMessage開始:', initialText, role);
    // メッセージエリアの取得
    const messageArea = document.getElementById('message-area');
    if (!messageArea) {
        console.error('message-area要素が見つかりません');
        // ダミーの要素と関数を返す（エラー防止用）
        const dummyEl = document.createElement('div');
        return {
            element: dummyEl,
            update: (text) => console.log('更新:', text),
            complete: (text) => console.log('完了:', text)
        };
    }
    
    try {
        // メッセージ要素を作成
        const messageEl = addMessage(initialText || '', role, false);
        console.log('メッセージ要素作成完了:', messageEl);
        
        if (!messageEl) {
            console.error('メッセージ要素の作成に失敗しました');
            const dummyEl = document.createElement('div');
            return {
                element: dummyEl,
                update: (text) => console.log('メッセージ要素なし - 更新:', text),
                complete: (text) => console.log('メッセージ要素なし - 完了:', text)
            };
        }
        
        // システムメッセージの場合は更新不要
        if (role === 'system') {
            return {
                element: messageEl,
                update: (text) => {
                    if (messageEl) messageEl.textContent = text;
                },
                complete: (finalText) => {
                    if (messageEl) messageEl.textContent = finalText;
                    // 会話を保存
                    if (typeof saveMessageToConversation === 'function') {
                        saveMessageToConversation(finalText, role);
                    }
                }
            };
        }
        
        // アシスタントメッセージの場合
        let fullText = initialText || '';
        let isMarkdown = false;
        
        // 処理中表示用のインジケーター
        let processingIndicator = null;
        
        if (role === 'assistant') {
            processingIndicator = createProcessingIndicator(messageEl, initialText);
        }
        
        // テキスト更新関数
        const updateText = (text) => {
            if (!messageEl) {
                console.error('updateText: メッセージ要素がnullです');
                return;
            }

            // SSE形式のチャンクかどうかを判定
            const isSSEFormat = text.includes('f:{') || text.includes('0:"') || text.includes('e:{');
            
            try {
                if (isSSEFormat && window.xiboMarkdown && typeof window.xiboMarkdown.parseSSEChunk === 'function') {
                    // SSE形式のチャンクを解析
                    const parsedText = window.xiboMarkdown.parseSSEChunk(text);
                    
                    if (parsedText) {
                        fullText += parsedText;
                    }
                } else {
                    // 通常のテキスト
                    fullText = text;
                }
                
                // JSONデータと改行を前処理
                // JSONオブジェクト（9:{"toolCallId"など）を削除
                const cleanText = fullText
                    .replace(/\d+:\s*\{.*?\}/g, '')
                    .replace(/[a-z]:\s*\{.*?\}/g, '')
                    // 改行文字を実際の改行に変換
                    .replace(/\\n/g, '\n');
            
                // 処理中インジケーターを表示
                if (processingIndicator) {
                    processingIndicator.style.display = 'block';
                }
                
                if (role === 'assistant') {
                    // マークダウンテーブルのパターンを検出
                    const hasTable = (cleanText.includes('| ユーザーID ') || 
                                     cleanText.includes('|—|') || 
                                     cleanText.includes('| — |') || 
                                     cleanText.includes('|-|') ||
                                     cleanText.includes('表') || 
                                     (cleanText.includes('|') && cleanText.includes('\n') && 
                                      cleanText.split('\n').filter(line => line.includes('|')).length >= 2));
                    
                    // マークダウンとして処理するか判定
                    isMarkdown = hasTable || 
                                (window.xiboMarkdown && typeof window.xiboMarkdown.isMdContent === 'function' && 
                                 window.xiboMarkdown.isMdContent(cleanText));
                    
                    if (isMarkdown) {
                        messageEl.classList.add('markdown-content');
                        
                        if (window.xiboMarkdown && typeof window.xiboMarkdown.renderMarkdown === 'function') {
                            try {
                                messageEl.innerHTML = window.xiboMarkdown.renderMarkdown(cleanText);
                                // インジケーターを再追加（HTMLが上書きされるため）
                                if (processingIndicator) {
                                    messageEl.appendChild(processingIndicator);
                                }
                                messageEl.style.position = 'relative';
                            } catch (e) {
                                console.error('ストリーミング中のマークダウンレンダリングエラー:', e);
                                messageEl.textContent = cleanText;
                            }
                        } else {
                            messageEl.textContent = cleanText;
                        }
                    } else {
                        messageEl.textContent = cleanText;
                    }
                } else {
                    messageEl.textContent = cleanText;
                }
            } catch (displayError) {
                // エラーが発生した場合は単純にテキスト表示
                console.error('ストリーミング表示エラー:', displayError);
                messageEl.textContent = fullText;
            }
            
            // スクロール位置を更新
            if (messageArea) {
                messageArea.scrollTop = messageArea.scrollHeight;
            }
        };
        
        // 完了時の処理
        const complete = (finalText) => {
            if (!messageEl) {
                console.error('complete: メッセージ要素がnullです');
                return;
            }
            
            // 最終的なテキストを設定
            fullText = finalText || fullText;
            
            // JSONデータと改行を前処理
            // JSONオブジェクト（9:{"toolCallId"など）を削除
            const cleanText = fullText
                .replace(/\d+:\s*\{.*?\}/g, '')
                .replace(/[a-z]:\s*\{.*?\}/g, '')
                // 改行文字を実際の改行に変換
                .replace(/\\n/g, '\n');
            
            // 処理中インジケーターを削除
            if (processingIndicator) {
                try {
                    processingIndicator.remove();
                } catch (removeError) {
                    console.error('インジケーター削除エラー:', removeError);
                }
            }
            
            try {
                // 最終的なテキストを表示
                if (role === 'assistant' && isMarkdown && 
                    window.xiboMarkdown && typeof window.xiboMarkdown.renderMarkdown === 'function') {
                    try {
                        messageEl.innerHTML = window.xiboMarkdown.renderMarkdown(cleanText);
                        messageEl.style.position = 'relative';
                        
                        // コピーボタンを追加
                        addCopyButton(messageEl, cleanText, true);
                    } catch (e) {
                        console.error('マークダウンのレンダリングに失敗:', e);
                        if (messageEl) messageEl.textContent = fullText;
                    }
                } else if (!isMarkdown) {
                    if (messageEl) messageEl.textContent = cleanText;
                    
                    // アシスタントのメッセージにはコピーボタンを追加
                    if (role === 'assistant') {
                        addCopyButton(messageEl, cleanText, false);
                    }
                }
            } catch (completeError) {
                console.error('完了処理エラー:', completeError);
                // エラー時の最終手段
                try {
                    if (messageEl) messageEl.textContent = cleanText;
                } catch (finalError) {
                    console.error('最終テキスト設定エラー:', finalError);
                }
            }
            
            // 会話を保存
            try {
                if (typeof saveMessageToConversation === 'function') {
                    saveMessageToConversation(cleanText, role);
                } else {
                    console.log('会話を保存します: ' + role + ': ' + cleanText);
                }
            } catch (saveError) {
                console.error('会話保存エラー:', saveError);
            }
        };
        
        return {
            element: messageEl,
            update: updateText,
            complete: complete
        };
    } catch (creationError) {
        console.error('ストリーミングメッセージ作成エラー:', creationError);
        const dummyEl = document.createElement('div');
        return {
            element: dummyEl,
            update: (text) => console.log('エラー後 - 更新:', text),
            complete: (text) => console.log('エラー後 - 完了:', text)
        };
    }
}

/**
 * 処理中インジケーターを作成する関数
 * @param {HTMLElement} messageEl メッセージ要素
 * @param {string} initialText 初期テキスト
 * @returns {HTMLElement|null} インジケーター要素
 */
function createProcessingIndicator(messageEl, initialText) {
    try {
        // 処理中インジケーターの追加
        const processingIndicator = document.createElement('div');
        processingIndicator.className = 'processing-indicator';
        processingIndicator.innerHTML = `
            <div class="loading-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        processingIndicator.style.display = initialText ? 'none' : 'block';
        if (messageEl) messageEl.appendChild(processingIndicator);
        
        // スタイルを追加（もし存在しなければ）
        if (!document.querySelector('#processing-indicator-style')) {
            const style = document.createElement('style');
            style.id = 'processing-indicator-style';
            style.textContent = `
                .processing-indicator {
                    padding-top: 8px;
                    margin-top: 5px;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                }
                .loading-dots {
                    display: flex;
                    justify-content: center;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    margin: 0 3px;
                    background-color: #999;
                    border-radius: 50%;
                    display: inline-block;
                    animation: dot-pulse 1.5s infinite ease-in-out;
                }
                .dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                @keyframes dot-pulse {
                    0%, 80%, 100% { 
                        transform: scale(0.8);
                        opacity: 0.6;
                    }
                    40% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                body.dark-mode .processing-indicator {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                body.dark-mode .dot {
                    background-color: #ccc;
                }
            `;
            document.head.appendChild(style);
        }
        
        return processingIndicator;
    } catch (e) {
        console.error('インジケーター作成エラー:', e);
        return null;
    }
}

/**
 * コピーボタンを追加する関数
 * @param {HTMLElement} messageEl メッセージ要素
 * @param {string} text コピーするテキスト
 * @param {boolean} isMd マークダウンかどうか
 */
function addCopyButton(messageEl, text, isMd) {
    try {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            コピー
        `;
        
        // コピーボタンクリック時の処理
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // クリックイベントの伝播を止める
            
            // コピーするテキスト
            const contentToCopy = text;
            
            // クリップボードにコピー
            navigator.clipboard.writeText(contentToCopy).then(() => {
                // コピー成功時の表示
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    コピー済
                `;
                
                // 2秒後に元に戻す
                setTimeout(function() {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span style="display: inline-block; vertical-align: middle;">コピー</span>
                    `;
                }, 2000);
            }).catch(function(err) {
                console.error('コピーに失敗しました', err);
            });
        });
        
        messageEl.appendChild(copyBtn);
    } catch (btnError) {
        console.error('コピーボタン追加エラー:', btnError);
    }
}

/**
 * メッセージが表示された後にコピーボタンを確認する関数
 */
function ensureCopyButtonsExist() {
    const assistantMessages = document.querySelectorAll('.assistant-message');
    
    assistantMessages.forEach(function(msgEl) {
        // position: relativeを確保
        msgEl.style.position = 'relative';
        
        // コピーボタンの有無をチェック
        if (!msgEl.querySelector('.copy-btn')) {
            console.log('コピーボタンがないメッセージを検出、追加します');
            
            // コピーボタンを作成
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span style="display: inline-block; vertical-align: middle;">コピー</span>
            `;
            
            // クリックイベントを追加
            copyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const text = msgEl.textContent.replace('コピー', '').trim();
                
                navigator.clipboard.writeText(text).then(function() {
                    copyBtn.classList.add('copied');
                    copyBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        <span style="display: inline-block; vertical-align: middle;">コピー済</span>
                    `;
                    
                    setTimeout(function() {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span style="display: inline-block; vertical-align: middle;">コピー</span>
                        `;
                    }, 2000);
                }).catch(function(err) {
                    console.error('コピーに失敗しました', err);
                });
            });
            
            msgEl.appendChild(copyBtn);
        }
    });
}

// グローバルに公開
window.xiboMessage = {
    addMessage,
    createStreamingMessage,
    ensureCopyButtonsExist
}; 