import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChatArea } from './components/ChatArea';
import Navbar from './components/Navbar';
import { SettingsDialog } from './components/SettingsDialog';
import { MastraService } from '../services/mastraService';
import { Conversation, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../config/default';
import { getLocalStorage, setLocalStorage } from '../utils';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    return getLocalStorage<UserSettings>('userSettings', DEFAULT_SETTINGS);
  });

  // settingsが変更されたときにMastraServiceを再初期化
  const [mastraService, setMastraService] = useState<MastraService>(() => {
    return new MastraService(
      settings.endpoint,
      settings.agent,
      settings.defaultAdmin
    );
  });

  useEffect(() => {
    // settingsが変更されたときにMastraServiceを更新
    const newService = new MastraService(
      settings.endpoint,
      settings.agent,
      settings.defaultAdmin
    );
    setMastraService(newService);
    
    // 新しいサービスで初期化を実行
    const initializeNewService = async () => {
      try {
        const initialized = await newService.initialize();
        if (!initialized) {
          throw new Error('エージェントサーバーに接続できません。サーバーが起動しているか確認してください。');
        }
        const threads = await newService.getConversationThreads();
        if (isMountedRef.current) {
          console.log('Fetched conversations:', threads);
          setConversations(threads);
          setError(null);
          
          if (threads.length > 0) {
            setCurrentConversationId(threads[0].id);
          }
        }
      } catch (error) {
        console.error('Error initializing new service:', error);
        if (isMountedRef.current) {
          let errorMessage = '予期せぬエラーが発生しました';
          let errorDetails = '';

          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
              errorMessage = 'ネットワーク接続を確認してください';
              errorDetails = 'エージェントサーバーに接続できません。ネットワーク接続とサーバーの状態を確認してください。';
            } else if (error.message.includes('Agent')) {
              errorMessage = 'エージェントが見つかりません';
              errorDetails = '指定されたエージェントが存在しません。設定を確認してください。';
            } else {
              errorMessage = error.message;
            }
          }

          setError({
            message: errorMessage,
            details: errorDetails
          });
        }
      }
    };

    initializeNewService();
  }, [settings]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    conversationId: string | null;
  }>({
    isOpen: false,
    conversationId: null
  });
  const initRef = useRef(false);
  const isMountedRef = useRef(true);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);

  // コンポーネントのマウント状態を管理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // テーマの変更をHTML要素に適用
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // 会話の更新を監視する関数をメモ化
  const updateConversation = useCallback(async (conversationId: string) => {
    if (!isMountedRef.current) return;

    try {
      const conversation = await mastraService.getConversationThread(conversationId);
      if (isMountedRef.current) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversation.id ? conversation : conv
          )
        );
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }, []);

  // 会話の初期化（初回のみ）
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeConversations = async () => {
      if (!isMountedRef.current) return;

      try {
        const initialized = await mastraService.initialize();
        if (!initialized) {
          throw new Error('エージェントサーバーに接続できません。サーバーが起動しているか確認してください。');
        }
        const threads = await mastraService.getConversationThreads();
        if (isMountedRef.current) {
          console.log('Fetched conversations:', threads);
          setConversations(threads);
          setError(null);
          
          if (threads.length > 0) {
            setCurrentConversationId(threads[0].id);
          }
        }
      } catch (error) {
        console.error('Error initializing conversations:', error);
        if (isMountedRef.current) {
          let errorMessage = '予期せぬエラーが発生しました';
          let errorDetails = '';

          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
              errorMessage = 'ネットワーク接続を確認してください';
              errorDetails = 'エージェントサーバーに接続できません。ネットワーク接続とサーバーの状態を確認してください。';
            } else if (error.message.includes('Agent')) {
              errorMessage = 'エージェントが見つかりません';
              errorDetails = '指定されたエージェントが存在しません。設定を確認してください。';
            } else {
              errorMessage = error.message;
            }
          }

          setError({
            message: errorMessage,
            details: errorDetails
          });
        }
      }
    };

    initializeConversations();
  }, [mastraService]);

  const handleNewConversation = async () => {
    if (!isMountedRef.current) return;

    console.log('Creating new conversation...');
    try {
      const newConversation = await mastraService.createConversationThread();
      if (isMountedRef.current) {
        console.log('New conversation created:', newConversation);
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!isMountedRef.current) return;

    console.log('Deleting conversation:', id);
    try {
      await mastraService.deleteConversationThread(id);
      if (isMountedRef.current) {
        const updatedConversations = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversations);
        if (currentConversationId === id) {
          setCurrentConversationId(updatedConversations.length > 0 ? updatedConversations[0].id : null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!isMountedRef.current) return;

    console.log('Deleting all conversations...');
    try {
      // 全てのスレッドを取得
      const threads = await mastraService.getConversationThreads();
      
      // 各スレッドを削除
      for (const thread of threads) {
        await mastraService.deleteConversationThread(thread.id);
      }

      if (isMountedRef.current) {
        setConversations([]);
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting all conversations:', error);
    }
  };

  const handleSettingsChange = (newSettings: UserSettings) => {
    if (!isMountedRef.current) return;

    console.log('Settings changed:', newSettings);
    setSettings(newSettings);
    setLocalStorage('userSettings', newSettings);
    setCurrentTheme(newSettings.darkMode ? 'dark' : 'light');
    mastraService.updateEndpoint(newSettings.endpoint);
    mastraService.updateSettings({ 
      agentId: newSettings.agent,
      resourceId: newSettings.defaultAdmin
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className={`app-container ${currentTheme === 'dark' ? 'dark' : ''}`}>
      <div className="sidebar">
        <Navbar
          conversations={conversations}
          activeConversationId={currentConversationId}
          onConversationSelect={setCurrentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onThemeChange={setCurrentTheme}
          currentTheme={currentTheme}
          onDeleteConfirm={(conversationId) => {
            setDeleteConfirmState({
              isOpen: true,
              conversationId
            });
          }}
          onDeleteAll={() => {
            setDeleteConfirmState({
              isOpen: true,
              conversationId: null
            });
          }}
        />
      </div>
      <div className="main-content">
        <ChatArea
          mastraService={mastraService}
          conversationId={currentConversationId}
          settings={settings}
          onUpdateConversation={(updatedConversation) => {
            if (isMountedRef.current) {
              setConversations(prev => 
                prev.map(conv => 
                  conv.id === updatedConversation.id ? updatedConversation : conv
                )
              );
            }
          }}
          error={error}
        />
      </div>
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      <DeleteConfirmDialog
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (deleteConfirmState.conversationId) {
            handleDeleteConversation(deleteConfirmState.conversationId);
          } else {
            handleDeleteAll();
          }
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
        }}
        isDeleteAll={!deleteConfirmState.conversationId}
      />
    </div>
  );
};

export default App; 