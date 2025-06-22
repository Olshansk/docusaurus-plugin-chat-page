"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const react_1 = __importDefault(require("react"));
const react_markdown_1 = __importDefault(require("react-markdown"));
const styles_module_css_1 = __importDefault(require("../styles.module.css"));
function ChatMessage({ message }) {
    return (react_1.default.createElement("div", { className: `${styles_module_css_1.default.message} ${message.role === "assistant"
            ? styles_module_css_1.default.assistantMessage
            : styles_module_css_1.default.userMessage}` },
        react_1.default.createElement("div", { className: styles_module_css_1.default.messageContent },
            react_1.default.createElement(react_markdown_1.default, null, message.content)),
        react_1.default.createElement("div", { className: styles_module_css_1.default.messageTimestamp }, message.timestamp.toLocaleTimeString())));
}
exports.ChatMessage = ChatMessage;
//# sourceMappingURL=ChatMessage.js.map