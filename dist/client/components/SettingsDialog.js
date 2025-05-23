"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TIMEZONES = [
    { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
    { value: 'America/New_York', label: 'New York, USA' },
    { value: 'Europe/London', label: 'London, UK' },
    { value: 'Asia/Shanghai', label: 'Shanghai, China' },
    { value: 'Australia/Sydney', label: 'Sydney, Australia' }
];
const LANGUAGES = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: 'English' }
];
const DISPLAY_MODES = [
    { value: 'false', label: 'ライトモード' },
    { value: 'true', label: 'ダークモード' }
];
const SettingsDialog = ({ isOpen, onClose, onSettingsChange, settings, currentTheme, onThemeChange }) => {
    const formRef = (0, react_1.useRef)(null);
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formRef.current)
            return;
        const formData = new FormData(formRef.current);
        const newSettings = {
            endpoint: formData.get('endpoint'),
            agent: formData.get('agent'),
            timezone: formData.get('timezone'),
            defaultAdmin: formData.get('defaultAdmin'),
            defaultPassword: formData.get('defaultPassword'),
            darkMode: formData.get('darkMode') === 'true',
            language: formData.get('language')
        };
        onSettingsChange(newSettings);
        onThemeChange(newSettings.darkMode ? 'dark' : 'light');
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "settings-dialog-overlay", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "settings-dialog", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsx)("h2", { children: "\u74B0\u5883\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsxs)("form", { ref: formRef, onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["\u8868\u793A\u30E2\u30FC\u30C9", (0, jsx_runtime_1.jsx)("select", { name: "darkMode", defaultValue: settings.darkMode.toString(), children: DISPLAY_MODES.map(mode => ((0, jsx_runtime_1.jsx)("option", { value: mode.value, children: mode.label }, mode.value))) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["\u8868\u793A\u8A00\u8A9E", (0, jsx_runtime_1.jsx)("select", { name: "language", defaultValue: settings.language, children: LANGUAGES.map(lang => ((0, jsx_runtime_1.jsx)("option", { value: lang.value, children: lang.label }, lang.value))) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["\u30BF\u30A4\u30E0\u30BE\u30FC\u30F3", (0, jsx_runtime_1.jsx)("select", { name: "timezone", defaultValue: settings.timezone, children: TIMEZONES.map(tz => ((0, jsx_runtime_1.jsx)("option", { value: tz.value, children: tz.label }, tz.value))) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["Agent\u30A2\u30C9\u30EC\u30B9", (0, jsx_runtime_1.jsx)("input", { type: "text", name: "endpoint", defaultValue: settings.endpoint, placeholder: "http://localhost:4111" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["Agent\u540D", (0, jsx_runtime_1.jsx)("input", { type: "text", name: "agent", defaultValue: settings.agent, placeholder: "xibo" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["\u30C7\u30D5\u30A9\u30EB\u30C8\u7BA1\u7406\u8005", (0, jsx_runtime_1.jsx)("input", { type: "text", name: "defaultAdmin", defaultValue: settings.defaultAdmin, placeholder: "captain" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "settings-group", children: (0, jsx_runtime_1.jsxs)("label", { children: ["\u30C7\u30D5\u30A9\u30EB\u30C8\u30D1\u30B9\u30EF\u30FC\u30C9", (0, jsx_runtime_1.jsx)("input", { type: "password", name: "defaultPassword", defaultValue: settings.defaultPassword, placeholder: "administrator" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-dialog-buttons", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "save", children: "\u4FDD\u5B58" })] })] })] }) }));
};
exports.SettingsDialog = SettingsDialog;
//# sourceMappingURL=SettingsDialog.js.map