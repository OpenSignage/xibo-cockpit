import React, { useState, useRef, useEffect } from 'react';
import { Conversation } from '../../types';
import { AboutDialog } from './AboutDialog';

interface NavbarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
  onDeleteConfirm: (conversationId: string) => void;
  onDeleteAll: () => void;
}

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTitle: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  position: { x: number; y: number };
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
  onDeleteAll: () => void;
  hasConversations: boolean;
  onAboutClick: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-medium mb-4">会話履歴の削除</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          この操作は取り消せません。本当に削除しますか？
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
};

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onEditTitle, onDelete, position }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="menu-overlay" onClick={onClose} />
      <div
        className="menu-container"
        style={{ top: position.y, left: position.x }}
      >
        <button
          onClick={onEditTitle}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        >
          <i className="fa-solid fa-pen-to-square mr-2"></i>
          タイトルを編集
        </button>
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400"
        >
          <i className="fa-solid fa-trash-can mr-2"></i>
          削除
        </button>
      </div>
    </>
  );
};

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSettings, 
  position,
  onThemeChange,
  currentTheme,
  onDeleteAll,
  hasConversations,
  onAboutClick
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="menu-overlay" onClick={onClose} />
      <div
        className="menu-container settings-menu"
        style={{ 
          top: position.y, 
          left: position.x
        }}
      >
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
        >
          <i className="fa-solid fa-sliders mr-2"></i>
          環境設定
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
        >
          <i className="fa-solid fa-list-check mr-2"></i>
          詳細設定
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
        >
          <i className="fa-solid fa-bug mr-2"></i>
          ログ表示
        </button>
        {hasConversations && (
          <button
            onClick={() => {
              onDeleteAll();
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400 whitespace-nowrap"
          >
            <i className="fa-solid fa-trash-can mr-2"></i>
            全削除
          </button>
        )}
        <button
          onClick={() => {
            onAboutClick();
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
        >
          <i className="fa-solid fa-info mr-2"></i>
          About
        </button>
      </div>
    </>
  );
};

const Navbar: React.FC<NavbarProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onOpenSettings,
  onThemeChange,
  currentTheme,
  onDeleteConfirm,
  onDeleteAll
}) => {
  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    conversationId: null,
    position: { x: 0, y: 0 }
  });

  const [editingTitle, setEditingTitle] = useState<{
    conversationId: string | null;
    title: string;
  }>({
    conversationId: null,
    title: ''
  });

  const [settingsMenuState, setSettingsMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });

  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 会話を日付順にソート
  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime();
  });

  const formatDate = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // 日付が変わっているかチェック
    const isDifferentDay = messageDate.getDate() !== now.getDate() ||
                          messageDate.getMonth() !== now.getMonth() ||
                          messageDate.getFullYear() !== now.getFullYear();

    if (isDifferentDay) {
      // 日付が異なる場合は年月日時分を表示
      return messageDate.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // 同じ日の場合は相対時間を表示
    if (diffMinutes < 60) {
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      return messageDate.toLocaleString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleMenuClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      isOpen: true,
      conversationId,
      position: { x: rect.left, y: rect.bottom }
    });
  };

  const handleEditTitle = async (newTitle: string) => {
    if (!editingTitle.conversationId) return;

    try {
      // TODO: PATCHリクエストを実装
      // const response = await fetch(`/api/conversations/${editingTitle.conversationId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ title: newTitle }),
      // });
      // if (!response.ok) throw new Error('Failed to update title');
      
      // 成功した場合の処理
      setEditingTitle({ conversationId: null, title: '' });
    } catch (error) {
      console.error('Error updating title:', error);
      // エラー処理
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditTitle(editingTitle.title);
    } else if (e.key === 'Escape') {
      setEditingTitle({ conversationId: null, title: '' });
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSettingsMenuState({
      isOpen: true,
      position: { x: rect.right, y: rect.top }
    });
  };

  const handleMenuClickAll = (action: string) => {
    switch (action) {
      case 'settings':
        onOpenSettings();
        break;
      case 'delete-all':
        onDeleteAll();
        break;
      case 'about':
        setIsAboutOpen(true);
        break;
    }
    setMenuState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="navbar">
      <div className="navbar-header">
        <img src="/images/logo.jpg" alt="Xibo Cockpit Logo" className="navbar-logo" />
        <h1 className="navbar-title">Xibo Cockpit</h1>
      </div>
      <button className="navbar-new-chat" onClick={onNewConversation}>
        <i className="fa-solid fa-plus"></i>
        新しい会話
      </button>
      <div className="navbar-conversations">
        {sortedConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`navbar-conversation ${conversation.id === activeConversationId ? 'active' : ''}`}
            onClick={() => onConversationSelect(conversation.id)}
          >
            {editingTitle.conversationId === conversation.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingTitle.title}
                onChange={(e) => setEditingTitle(prev => ({ ...prev, title: e.target.value }))}
                onKeyDown={handleKeyDown}
                onBlur={() => handleEditTitle(editingTitle.title)}
                className="navbar-conversation-input"
              />
            ) : (
              <>
                <div className="navbar-conversation-header">
                  <div className="navbar-conversation-title">{conversation.title}</div>
                  <button
                    onClick={(e) => handleMenuClick(e, conversation.id)}
                    className="navbar-conversation-menu"
                  >
                    <i className="fa-solid fa-ellipsis"></i>
                  </button>
                </div>
                <div className="navbar-conversation-date">
                  {formatDate(conversation.metadata.lastUpdated)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="navbar-footer">
        <button
          onClick={handleSettingsClick}
          className="navbar-settings"
        >
          <i className="fa-solid fa-gear"></i>
          設定
        </button>
      </div>
      <Menu
        isOpen={menuState.isOpen}
        onClose={() => setMenuState(prev => ({ ...prev, isOpen: false }))}
        onEditTitle={() => {
          const conversation = conversations.find(c => c.id === menuState.conversationId);
          if (conversation) {
            setEditingTitle({
              conversationId: conversation.id,
              title: conversation.title
            });
            setMenuState(prev => ({ ...prev, isOpen: false }));
          }
        }}
        onDelete={() => {
          if (menuState.conversationId) {
            onDeleteConfirm(menuState.conversationId);
            setMenuState(prev => ({ ...prev, isOpen: false }));
          }
        }}
        position={menuState.position}
      />
      <SettingsMenu
        isOpen={settingsMenuState.isOpen}
        onClose={() => setSettingsMenuState(prev => ({ ...prev, isOpen: false }))}
        onOpenSettings={onOpenSettings}
        position={settingsMenuState.position}
        onThemeChange={onThemeChange}
        currentTheme={currentTheme}
        onDeleteAll={onDeleteAll}
        hasConversations={conversations.length > 0}
        onAboutClick={() => setIsAboutOpen(true)}
      />
      <AboutDialog
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

export default Navbar; 