// マークダウン処理機能

/**
 * テーブルの区切り行（ヘッダーとデータの間の行）を正規化する関数
 * @param {string} markdown マークダウンテキスト
 * @returns {string} 正規化されたマークダウンテキスト
 */
function normalizeTableSeparators(markdown) {
    // テーブルパターンを持たない場合はそのまま返す
    if (!markdown.includes('|')) {
        return markdown;
    }
    
    // テーブル区切り文字の正規化（様々な形式の区切り文字を標準形式に変換）
    const lines = markdown.split('\n');
    const result = [];
    
    let inTable = false;
    let headerLineIndex = -1;
    
    // テーブルのヘッダー行を検出
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // テーブル行の検出（先頭と末尾が|で、少なくとも1つの|を含む）
        if (line.startsWith('|') && line.endsWith('|') && line.indexOf('|', 1) !== -1) {
            if (!inTable) {
                inTable = true;
                headerLineIndex = i;
                result.push(line);
                
                // 次の行がテーブルのセパレータかどうかをチェック
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    
                    // セパレータ行が存在するかどうかをチェック
                    const isSeparator = nextLine.startsWith('|') && 
                                      nextLine.endsWith('|') && 
                                      (nextLine.includes('-') || nextLine.includes('—')) && 
                                      !nextLine.match(/[a-zA-Z0-9@\.]/);
                    
                    if (isSeparator) {
                        // セパレータが存在する場合、正規化されたセパレータに置き換え
                        const columnCount = (line.match(/\|/g) || []).length - 1;
                        const normalizedSeparator = '|' + ' --- |'.repeat(columnCount);
                        result.push(normalizedSeparator);
                        i++; // 既存のセパレータ行をスキップ
                    } else {
                        // セパレータがない場合、自動的に追加
                        const columnCount = (line.match(/\|/g) || []).length - 1;
                        const newSeparator = '|' + ' --- |'.repeat(columnCount);
                        result.push(newSeparator);
                    }
                } else {
                    // テーブルの末尾にセパレータを追加
                    const columnCount = (line.match(/\|/g) || []).length - 1;
                    const newSeparator = '|' + ' --- |'.repeat(columnCount);
                    result.push(newSeparator);
                }
            } else {
                // テーブルの続きの行
                result.push(line);
            }
        } else {
            // テーブル以外の行
            inTable = false;
            result.push(line);
        }
    }
    
    return result.join('\n');
}

/**
 * テキストがマークダウンかどうかを判定する関数
 * @param {string} text 判定するテキスト
 * @returns {boolean} マークダウンかどうか
 */
function isMdContent(text) {
    // 空のテキストや短すぎるテキストはマークダウンとして扱わない
    if (!text || text.length < 3) {
        return false;
    }
    
    // テーブル特有のパターンをチェック
    if (text.includes('| --- |') || 
        text.includes('|---|') || 
        text.includes('| - |') || 
        text.includes('|-|') ||
        text.includes('|—|') ||
        (text.includes('|') && text.includes('\n') && text.split('\n').filter(line => line.includes('|')).length >= 2)) {
        return true;
    }
    
    // 一般的なマークダウンパターン
    const mdPatterns = [
        /(?:^|\n)#{1,6}\s+.+/,      // 見出し
        /(?:^|\n)[*-]\s+.+/,         // リスト
        /(?:^|\n)\d+\.\s+.+/,        // 番号付きリスト
        /\[.+?\]\(.+?\)/,            // リンク
        /(?:^|\n)>\s+.+/,            // 引用
        /(?:^|\n)```[\s\S]*?```/,    // コードブロック
        /(?:^|\n)\|.+\|.+\|/,        // テーブル
        /\*\*.+?\*\*/,               // 太字
        /\*.+?\*/,                   // 斜体
        /~~.+?~~/,                   // 取り消し線
        /(?:^|\n)-{3,}/,             // 水平線
        /`[^`]+?`/,                  // インラインコード
    ];
    
    return mdPatterns.some(pattern => pattern.test(text));
}

/**
 * マークダウンをHTMLに変換する関数
 * @param {string} text マークダウンテキスト
 * @returns {string} HTML
 */
function renderMarkdown(text) {
    try {
        console.log('元のテキスト:', text);
        
        // 入力がnullまたは空の場合は空を返す
        if (!text) {
            return '';
        }
        
        // マークダウンの前処理
        
        // 1. 改行文字列を実際の改行に変換
        let processedText = text.replace(/\\n/g, '\n');
        
        // 2. JSONデータパターンを削除 (9:{"toolCallId": など)
        processedText = processedText.replace(/\d+:\s*\{.*?\}/g, '');
        processedText = processedText.replace(/[a-z]:\s*\{.*?\}/g, '');
        
        // 3. 引用符で囲まれた文字列の場合、引用符を削除
        if (processedText.startsWith('"') && processedText.endsWith('"')) {
            processedText = processedText.substring(1, processedText.length - 1);
        }
        
        // 4. パラグラフを適切に分割
        // 連続した改行を保持したまま処理
        let paragraphs = processedText.split('\n\n');
        paragraphs = paragraphs.filter(p => p.trim() !== '');
        
        // 5. テーブルの区切り文字を正規化
        processedText = normalizeTableSeparators(processedText);
        
        // 6. 連続した空白行を1つの空白行に
        processedText = processedText.replace(/\n{3,}/g, '\n\n');
        
        console.log('処理後のテキスト:', processedText);
        
        // markdown-itを使用してHTMLに変換
        if (window.md) {
            let html = window.md.render(processedText);
            
            // 7. 一部のHTMLタグをエスケープ
            html = html.replace(/<script/gi, '&lt;script');
            
            console.log('生成されたHTML:', html);
            
            return html;
        } else {
            console.error('markdown-itが初期化されていません');
            return processedText;
        }
    } catch (e) {
        console.error('マークダウンのレンダリングに失敗:', e);
        return text || '';
    }
}

/**
 * SSE形式のストリーミングデータを解析する関数
 * @param {string} chunk SSEチャンク
 * @returns {string} 解析されたテキスト
 */
function parseSSEChunk(chunk) {
    // nullまたは空の文字列の場合は空文字を返す
    if (!chunk) {
        return '';
    }
    
    try {
        // f:, 0:, e:, d: のような形式で始まる行を処理
        const lines = chunk.split('\n');
        let parsedContent = '';

        for (const line of lines) {
            // 空行はスキップ
            if (!line || line.trim() === '') {
                continue;
            }
            
            // 行の先頭が特定のプレフィックスで始まるか確認
            if (line.startsWith('0:')) {
                // 0: はメッセージ本文を示す
                // 0:"メッセージ内容" の形式から内容部分を抽出
                const content = line.substring(2);
                // 内容が引用符で囲まれている場合は引用符を削除
                if (content.startsWith('"') && content.endsWith('"')) {
                    const extractedContent = content.substring(1, content.length - 1);
                    parsedContent += extractedContent;
                } else {
                    parsedContent += content;
                }
            } else if (line.startsWith('f:') || line.startsWith('e:') || line.startsWith('d:')) {
                // 他のプレフィックスの行はログだけ出力（必要に応じてコメントアウト）
                console.log(`プレフィックス ${line.substring(0, 2)} の行:`, line);
            } else if (line.includes('0:')) {
                // 行の途中に0:がある場合（フォーマットが不正な場合の対応）
                const parts = line.split('0:');
                if (parts.length > 1) {
                    let content = parts[1];
                    // 引用符の処理
                    if (content.startsWith('"') && content.endsWith('"')) {
                        content = content.substring(1, content.length - 1);
                    }
                    parsedContent += content;
                }
            } else {
                // プレフィックスがない場合はそのまま追加（通常のテキスト）
                parsedContent += line;
            }
        }

        return parsedContent;
    } catch (error) {
        console.error('SSEチャンク解析エラー:', error);
        // エラー時は元のチャンクをそのまま返す
        return chunk;
    }
}

/**
 * SSE文字列かどうかを判定する
 * @param {string} text 判定するテキスト
 * @returns {boolean} SSE文字列かどうか
 */
function isSSEData(text) {
    if (!text) return false;
    
    // SSE形式のパターンをチェック
    return text.includes('0:') || 
           text.includes('f:') || 
           text.includes('e:') || 
           text.includes('d:');
}

// グローバルに公開
window.xiboMarkdown = {
    normalizeTableSeparators,
    isMdContent,
    renderMarkdown,
    parseSSEChunk,
    isSSEData
}; 