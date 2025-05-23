import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Conversation, Message, UserSettings } from '../../types';
import { createMessage } from '../../utils';
import { MastraService } from '../../services/mastraService';
import { v4 as uuidv4 } from 'uuid';
import Markdown from 'react-markdown';

interface ChatAreaProps {
  mastraService: MastraService;
  conversationId: string | null;
  settings: UserSettings;
  onUpdateConversation: (conversation: Conversation) => void;
}

interface MessageComponentProps {
  message: Message;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  mastraService,
  conversationId,
  settings,
  onUpdateConversation
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);

  // 入力エリアの高さを自動調整
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    // 一度高さをリセット
    textarea.style.height = '40px';
    
    // 新しい高さを計算
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
  };

  // 入力内容が変更されたときに高さを調整
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // コンポーネントのマウント状態を管理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 会話データの取得
  useEffect(() => {
    let isCurrentRequest = true;
    let abortController = new AbortController();

    const fetchConversation = async () => {
      if (!conversationId || !isMountedRef.current) {
        setCurrentConversation(null);
        setStreamedResponse('');
        return;
      }

      try {
        const conversation = await mastraService.getConversationThread(conversationId);
        if (isCurrentRequest && isMountedRef.current) {
          setCurrentConversation(conversation);
          setStreamedResponse('');
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching conversation:', error);
        if (isCurrentRequest && isMountedRef.current) {
          setCurrentConversation(null);
          setStreamedResponse('');
        }
      }
    };

    fetchConversation();

    return () => {
      isCurrentRequest = false;
      abortController.abort();
    };
  }, [conversationId, mastraService]);

  // メッセージが増えたら自動スクロール
  useEffect(() => {
    if (isMountedRef.current) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, streamedResponse]);

  // メッセージ送信処理
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation || !isMountedRef.current) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    try {
      setIsLoading(true);
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
      };

      // ユーザーメッセージを保存
      await mastraService.saveMessage(currentConversation.id, userMessage, (newTitle) => {
        // タイトルが更新された場合、会話を更新
        const updatedConversation = {
          ...currentConversation,
          title: newTitle
        };
        setCurrentConversation(updatedConversation);
        onUpdateConversation(updatedConversation);
      });

      if (!isMountedRef.current || signal.aborted) return;

      // 会話を更新
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage]
      };

      setCurrentConversation(updatedConversation);
      onUpdateConversation(updatedConversation);

      // アシスタントの応答を生成（ストリーミング）
      let fullResponse = '';
      setStreamedResponse('');

      const response = await mastraService.sendMessage(content, (text) => {
        if (isMountedRef.current && !signal.aborted) {
          fullResponse = text;
          setStreamedResponse(text);
        }
      });

      if (!isMountedRef.current || signal.aborted) return;

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString()
      };

      // アシスタントのメッセージを保存
      await mastraService.saveMessage(currentConversation.id, assistantMessage, (newTitle) => {
        // タイトルが更新された場合、会話を更新
        const updatedConversation = {
          ...currentConversation,
          title: newTitle
        };
        setCurrentConversation(updatedConversation);
        onUpdateConversation(updatedConversation);
      });

      if (!isMountedRef.current || signal.aborted) return;

      // 会話を更新
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage]
      };

      setCurrentConversation(finalConversation);
      onUpdateConversation(finalConversation);
      setInput('');
      setStreamedResponse('');
      
      // テキストエリアの高さをリセット
      if (inputRef.current) {
        inputRef.current.style.height = '40px';
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error sending message:', error);
    } finally {
      if (isMountedRef.current && !signal.aborted) {
        setIsLoading(false);
      }
    }

    return () => {
      abortController.abort();
    };
  };

  // メッセージ表示コンポーネント
  const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
    const content = Array.isArray(message.content) 
      ? message.content.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n')
      : message.content;
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shouldShowCollapse, setShouldShowCollapse] = useState(false);

    // コンテンツの高さをチェックして折りたたみボタンの表示を決定
    useEffect(() => {
      const checkContentHeight = () => {
        if (contentRef.current && message.role === 'assistant') {
          const lineHeight = 20; // 1行あたりの高さ（px）
          const maxLines = 20; // 折りたたみ時の最大行数
          const maxHeight = lineHeight * maxLines;
          
          // コンテンツの実際の高さを取得
          const contentHeight = contentRef.current.scrollHeight;
          
          setShouldShowCollapse(contentHeight > maxHeight);
        }
      };

      // 初回チェック
      checkContentHeight();

      // コンテンツが変更されたときに再チェック
      const observer = new ResizeObserver(checkContentHeight);
      if (contentRef.current) {
        observer.observe(contentRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [message.role, content]);

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    };

    const handleCopyToInput = () => {
      if (inputRef.current) {
        inputRef.current.value = content;
        setInput(content);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.style.height = '40px';
            const scrollHeight = inputRef.current.scrollHeight;
            inputRef.current.style.height = `${scrollHeight}px`;
          }
        }, 0);
        inputRef.current.focus();
      }
    };

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };

    return (
      <div className={`message-container ${message.role}`}>
        <div className={`message-flex ${message.role}`}>
          <div className={`message-content ${message.role}`}>
            {message.role === 'user' ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <div className="relative">
                <div 
                  ref={contentRef}
                  className="markdown-content overflow-x-auto"
                  style={{
                    maxHeight: isCollapsed ? '400px' : 'none',
                    overflowY: isCollapsed ? 'auto' : 'visible',
                    transition: 'max-height 0.3s ease-in-out'
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: ({ children }) => {
                        // 言語を取得（```の後の文字列）
                        let language = 'unknown';
                        if (children && typeof children === 'object' && 'props' in children) {
                          const className = children.props?.className || '';
                          const match = className.match(/language-(\w+)/);
                          if (match) {
                            language = match[1];
                          }
                        }

                        return (
                          <div className="code-block">
                            <div className="code-block-header">
                              <span className="code-block-language">{language}</span>
                              <button
                                onClick={() => {
                                  const code = typeof children === 'string' 
                                    ? children 
                                    : (children && typeof children === 'object' && 'props' in children)
                                      ? String(children.props?.children || '')
                                      : '';
                                  navigator.clipboard.writeText(code);
                                }}
                                className="code-block-copy"
                                title="クリップボードにコピー"
                              >
                                <i className="fa-regular fa-copy"></i>
                              </button>
                            </div>
                            <pre className="code-block-content">
                              {children}
                            </pre>
                          </div>
                        );
                      },
                      table: ({ children }) => (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse" style={{ border: '1px solid var(--border-color)' }}>
                            {children}
                          </table>
                        </div>
                      ),
                      img: ({ src, alt }) => (
                        <div className="overflow-x-auto">
                          <img src={src} alt={alt} className="max-w-full h-auto" />
                        </div>
                      )
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
        {message.role === 'assistant' ? (
          <div className="message-header">
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="message-actions">
              {shouldShowCollapse && (
                <button
                  onClick={toggleCollapse}
                  className="message-collapse"
                  title={isCollapsed ? '展開する' : '折りたたむ'}
                >
                  <i className={`fa-solid fa-angles-${isCollapsed ? 'down' : 'up'}`}></i>
                </button>
              )}
              <button
                onClick={handleCopy}
                className="message-copy"
                title="クリップボードにコピー"
              >
                <i className="fa-regular fa-copy"></i>
              </button>
              {showCopied && (
                <div className="copy-tooltip">
                  Copied!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="message-header">
            <div className="message-actions">
              <button
                onClick={handleCopy}
                className="message-copy"
                title="クリップボードにコピー"
              >
                <i className="fa-regular fa-copy"></i>
              </button>
              <button
                onClick={handleCopyToInput}
                className="message-copy"
                title="入力欄にコピー"
              >
                <i className="fa-regular fa-keyboard"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-area">
      <div className="chat-messages">
        {!currentConversation ? (
          <div className="empty-state">
            <img src="/images/logo.jpg" alt="Xibo Cockpit Logo" className="empty-state-logo" />
            <p>新しい会話ボタンを押して会話を開始してください。</p>
          </div>
        ) : (
          <>
            {currentConversation.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
            {streamedResponse && (
              <div className={`message-container assistant`}>
                <div className={`message-flex assistant`}>
                  <div className={`message-content assistant`}>
                    <div className="relative">
                      <div className="markdown-content overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamedResponse}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
              e.preventDefault();
              handleSendMessage(input);
            }
          }}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="メッセージを入力..."
          className="chat-textarea"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '処理中...' : '送信'}
        </button>
      </div>
    </div>
  );
};

export { ChatArea }; 