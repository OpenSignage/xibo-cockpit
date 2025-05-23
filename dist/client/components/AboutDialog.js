"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const version_1 = require("../../config/version");
const AboutDialog = ({ isOpen, onClose }) => {
    if (!isOpen)
        return null;
    // ビルド日時をフォーマット
    const buildDate = new Date(version_1.BUILD_INFO.buildTime).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    return ((0, jsx_runtime_1.jsx)("div", { className: "settings-dialog-overlay", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "settings-dialog", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "about-dialog-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "about-header", children: [(0, jsx_runtime_1.jsx)("img", { src: "/images/logo.jpg", alt: "Xibo Cockpit Logo", className: "about-logo" }), (0, jsx_runtime_1.jsx)("h2", { children: "xibo-Cockpit" }), (0, jsx_runtime_1.jsxs)("div", { className: "version-info", children: ["Version: ", version_1.VERSION, (0, jsx_runtime_1.jsx)("br", {}), "Build: ", buildDate] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "about-copyright", children: ["Copyright 2025 \u00A9 All rights reserved", (0, jsx_runtime_1.jsx)("br", {}), "Open Source Digital Signage Initiative"] }), (0, jsx_runtime_1.jsxs)("div", { className: "about-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "License:" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Elastic License 2.0 (ELv2)", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("a", { href: "https://www.elastic.co/licensing/elastic-license", target: "_blank", rel: "noopener noreferrer", children: "https://www.elastic.co/licensing/elastic-license" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "about-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Github:" }), (0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("a", { href: "https://github.com/OpenSignage/xibo-cockpit", target: "_blank", rel: "noopener noreferrer", children: "https://github.com/OpenSignage/xibo-cockpit" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "about-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Official web site:" }), (0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("a", { href: "https://www.open-signage.org", target: "_blank", rel: "noopener noreferrer", children: "https://www.open-signage.org" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "about-trademark", children: ["Xibo is trademark of Xibo Signage Ltd.", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("a", { href: "https://xibosignage.com/", target: "_blank", rel: "noopener noreferrer", children: "https://xibosignage.com/" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "settings-dialog-buttons", children: (0, jsx_runtime_1.jsx)("button", { className: "save", onClick: onClose, children: "\u9589\u3058\u308B" }) })] }) }));
};
exports.AboutDialog = AboutDialog;
//# sourceMappingURL=AboutDialog.js.map