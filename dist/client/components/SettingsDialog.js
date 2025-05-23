"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SettingsDialog = ({ isOpen, onClose, settings, onSettingsChange, currentTheme, onThemeChange }) => {
    const [localSettings, setLocalSettings] = (0, react_1.useState)(settings);
    const [localTheme, setLocalTheme] = (0, react_1.useState)(currentTheme);
    if (!isOpen)
        return null;
    const handleSave = () => {
        onSettingsChange(localSettings);
        onThemeChange(localTheme);
        onClose();
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "settings-dialog-overlay", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-dialog", children: [(0, jsx_runtime_1.jsx)("h2", { children: "\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "\u30C6\u30FC\u30DE" }), (0, jsx_runtime_1.jsxs)("select", { value: localTheme, onChange: (e) => setLocalTheme(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "light", children: "\u30E9\u30A4\u30C8\u30E2\u30FC\u30C9" }), (0, jsx_runtime_1.jsx)("option", { value: "dark", children: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "API\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: localSettings.endpoint, onChange: (e) => setLocalSettings(Object.assign(Object.assign({}, localSettings), { endpoint: e.target.value })) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "\u8A00\u8A9E" }), (0, jsx_runtime_1.jsxs)("select", { value: localSettings.language, onChange: (e) => setLocalSettings(Object.assign(Object.assign({}, localSettings), { language: e.target.value })), children: [(0, jsx_runtime_1.jsx)("option", { value: "ja", children: "\u65E5\u672C\u8A9E" }), (0, jsx_runtime_1.jsx)("option", { value: "en", children: "English" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-dialog-buttons", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "cancel", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSave, className: "save", children: "\u4FDD\u5B58" })] })] })] }));
};
exports.SettingsDialog = SettingsDialog;
//# sourceMappingURL=SettingsDialog.js.map