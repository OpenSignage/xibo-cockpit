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
        return;
      }

      try {
        console.log('Fetching conversation:', conversationId);
        const conversation = await mastraService.getConversationThread(conversationId);
        if (isCurrentRequest && isMountedRef.current) {
          console.log('Conversation fetched:', conversation);
          setCurrentConversation(conversation);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching conversation:', error);
        if (isCurrentRequest && isMountedRef.current) {
          setCurrentConversation(null);
        }
      }
    };

    fetchConversation();

    return () => {
      isCurrentRequest = false;
      abortController.abort();
    };
  }, [conversationId]);

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
      console.log('Starting message send process:', { 
        conversationId: currentConversation.id,
        content 
      });

      setIsLoading(true);
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };

      console.log('Saving user message:', { userMessage });

      // ユーザーメッセージを保存
      await mastraService.saveMessage(currentConversation.id, userMessage);

      if (!isMountedRef.current || signal.aborted) return;

      // 会話を更新
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage]
      };
      console.log('Updated conversation with user message:', { 
        conversationId: updatedConversation.id,
        messageCount: updatedConversation.messages.length
      });

      setCurrentConversation(updatedConversation);
      onUpdateConversation(updatedConversation);

      // アシスタントの応答を生成（ストリーミング）
      let fullResponse = '';
      setStreamedResponse('');
      console.log('Requesting assistant response');

      const response = await mastraService.sendMessage(content, (text) => {
        if (isMountedRef.current && !signal.aborted) {
          fullResponse = text;
          setStreamedResponse(text);
        }
      });

      if (!isMountedRef.current || signal.aborted) return;

      console.log('Received assistant response:', { fullResponse });

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString()
      };

      console.log('Saving assistant message:', { assistantMessage });

      // アシスタントのメッセージを保存
      await mastraService.saveMessage(currentConversation.id, assistantMessage);

      if (!isMountedRef.current || signal.aborted) return;

      // 会話を更新
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage]
      };
      console.log('Updated conversation with assistant message:', { 
        conversationId: finalConversation.id,
        messageCount: finalConversation.messages.length
      });

      setCurrentConversation(finalConversation);
      onUpdateConversation(finalConversation);
      setInput('');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Message sending aborted');
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
  const MessageComponent = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';

    return (
      <div className={`mb-4 ${isUser ? 'pl-12' : 'pr-12'}`}>
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-3xl p-4 rounded-lg ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
            }`}
          >
            {isUser ? (
              <div>{message.content}</div>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }) => (
                      <div className="relative">
                        <button
                          onClick={() => {
                            const code = typeof children === 'string' 
                              ? children 
                              : (children && typeof children === 'object' && 'props' in children)
                                ? String(children.props?.children || '')
                                : '';
                            navigator.clipboard.writeText(code);
                          }}
                          className="absolute top-2 right-2 bg-gray-700 text-white rounded px-2 py-1 text-xs"
                        >
                          コピー
                        </button>
                        <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto text-white my-2">
                          {children}
                        </pre>
                      </div>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  };

  // キー入力でのメッセージ送信
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 会話エリア */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">
        {!conversationId ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Xibo Cockpit</h2>
              <p>左側のサイドバーから新規会話を開始してください</p>
            </div>
          </div>
        ) : (
          <div>
            {/* 会話メッセージ */}
            {currentConversation?.messages.map((msg) => (
              <MessageComponent key={msg.id} message={msg} />
            ))}
            
            {/* ストリーミング中の応答（最後のメッセージがアシスタントのメッセージでない場合のみ表示） */}
            {streamedResponse && (!currentConversation?.messages.length || currentConversation.messages[currentConversation.messages.length - 1].role !== 'assistant') && (
              <div className="mb-4 pr-12">
                <div className="flex justify-start">
                  <div className="max-w-3xl p-4 rounded-lg bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white">
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamedResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 自動スクロール用の要素 */}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div className="flex">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="メッセージを入力..."
            className="flex-1 p-2 border rounded-l dark:bg-gray-800 dark:text-white dark:border-gray-700"
            disabled={!conversationId || isLoading}
            rows={2}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!conversationId || isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r transition disabled:opacity-50"
          >
            {isLoading ? '処理中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ChatArea }; 