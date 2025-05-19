"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SettingsModal = ({ settings, onSave, onClose }) => {
    const [formState, setFormState] = (0, react_1.useState)(Object.assign({}, settings));
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormState(prev => (Object.assign(Object.assign({}, prev), { [name]: type === 'checkbox'
                ? e.target.checked
                : value })));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formState);
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-4 text-gray-900 dark:text-white", children: "\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-gray-700 dark:text-gray-300 mb-2", children: "\u63A5\u7D9A\u5148" }), (0, jsx_runtime_1.jsx)("input", { type: "text", name: "endpoint", value: formState.endpoint, onChange: handleChange, className: "w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white", placeholder: "\u4F8B: http://localhost:4111" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-gray-700 dark:text-gray-300 mb-2", children: "\u30C6\u30FC\u30DE" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", name: "darkMode", checked: formState.darkMode, onChange: handleChange, className: "mr-2" }), (0, jsx_runtime_1.jsx)("span", { children: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-gray-700 dark:text-gray-300 mb-2", children: "\u8A00\u8A9E" }), (0, jsx_runtime_1.jsxs)("select", { name: "language", value: formState.language, onChange: handleChange, className: "w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white", children: [(0, jsx_runtime_1.jsx)("option", { value: "ja", children: "\u65E5\u672C\u8A9E" }), (0, jsx_runtime_1.jsx)("option", { value: "en", children: "English" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-2 mt-6", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition", children: "\u4FDD\u5B58" })] })] })] }) }));
};
exports.default = SettingsModal;
//# sourceMappingURL=SettingsModal.js.map