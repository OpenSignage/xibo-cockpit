import React from 'react';
import { Conversation } from '../../types';

interface NavbarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onOpenSettings
}) => {
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

    if (diffMinutes < 60) {
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <nav className="w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col h-full">
      {/* ロゴ */}
      <div className="flex justify-center items-center h-16 border-b border-gray-700">
        <h1 className="text-xl font-bold">Xibo Cockpit</h1>
      </div>

      {/* 新規会話ボタン */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
        >
          新規会話
        </button>
      </div>

      {/* 会話リスト */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            会話履歴がありません
          </div>
        ) : (
          <ul>
            {sortedConversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onConversationSelect(conv.id)}
                  className={`w-full text-left py-3 px-4 hover:bg-gray-700 transition ${
                    activeConversationId === conv.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 truncate">
                      <div className="font-medium">{conv.title}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(conv.metadata.lastUpdated)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 設定ボタン */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onOpenSettings}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition"
        >
          設定
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 