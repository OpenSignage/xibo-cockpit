"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, isDeleteAll = false }) => {
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "delete-dialog-overlay", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "delete-dialog", children: [(0, jsx_runtime_1.jsx)("h3", { children: isDeleteAll ? '全ての会話履歴の削除' : '会話履歴の削除' }), (0, jsx_runtime_1.jsx)("p", { children: isDeleteAll
                            ? '全ての会話履歴を削除します。この操作は取り消せません。本当に削除しますか？'
                            : 'この会話履歴を削除します。この操作は取り消せません。本当に削除しますか？' }), (0, jsx_runtime_1.jsxs)("div", { className: "delete-dialog-buttons", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "cancel", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), (0, jsx_runtime_1.jsx)("button", { onClick: onConfirm, className: "delete", children: "\u524A\u9664" })] })] })] }));
};
exports.default = DeleteConfirmDialog;
//# sourceMappingURL=DeleteConfirmDialog.js.map