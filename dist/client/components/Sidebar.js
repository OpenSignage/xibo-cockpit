"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Sidebar = ({ conversations, activeConversationId, onConversationSelect, onNewConversation, onDeleteConversation }) => {
    console.log('Sidebar rendered with conversations:', conversations);
    console.log('Active conversation ID:', activeConversationId);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-64 bg-gray-800 text-white p-4 flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => {
                    console.log('New conversation button clicked');
                    onNewConversation();
                }, className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4", children: "\u65B0\u3057\u3044\u4F1A\u8A71" }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto", children: conversations.map((conversation) => {
                    console.log('Rendering conversation:', conversation);
                    return ((0, jsx_runtime_1.jsxs)("div", { className: `p-2 mb-2 rounded cursor-pointer flex justify-between items-center ${activeConversationId === conversation.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`, onClick: () => {
                            console.log('Conversation selected:', conversation.id);
                            onConversationSelect(conversation.id);
                        }, children: [(0, jsx_runtime_1.jsx)("span", { className: "truncate flex-1", children: conversation.title }), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('Delete button clicked for conversation:', conversation.id);
                                    onDeleteConversation(conversation.id);
                                }, className: "ml-2 text-gray-400 hover:text-red-500", children: (0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] }, conversation.id));
                }) })] }));
};
exports.Sidebar = Sidebar;
//# sourceMappingURL=Sidebar.js.map