import React from 'react';
import { Conversation } from '../../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation
}) => {
  console.log('Sidebar rendered with conversations:', conversations);
  console.log('Active conversation ID:', activeConversationId);

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full">
      <button
        onClick={() => {
          console.log('New conversation button clicked');
          onNewConversation();
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
      >
        新しい会話
      </button>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          console.log('Rendering conversation:', conversation);
          return (
            <div
              key={conversation.id}
              className={`p-2 mb-2 rounded cursor-pointer flex justify-between items-center ${
                activeConversationId === conversation.id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => {
                console.log('Conversation selected:', conversation.id);
                onConversationSelect(conversation.id);
              }}
            >
              <span className="truncate flex-1">{conversation.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked for conversation:', conversation.id);
                  onDeleteConversation(conversation.id);
                }}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 