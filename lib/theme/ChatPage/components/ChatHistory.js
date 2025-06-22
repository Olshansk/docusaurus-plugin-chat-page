"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHistory = void 0;
const react_1 = __importStar(require("react"));
const ChatMessage_1 = require("./ChatMessage");
const styles_module_css_1 = __importDefault(require("../styles.module.css"));
function ChatHistory({ messages, isLoading = false, error = null }) {
    const chatHistoryRef = (0, react_1.useRef)(null);
    // Scroll to bottom when new messages are added
    (0, react_1.useEffect)(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);
    return (react_1.default.createElement("div", { className: styles_module_css_1.default.chatHistory, ref: chatHistoryRef },
        messages.map((message, index) => (react_1.default.createElement(ChatMessage_1.ChatMessage, { key: index, message: message }))),
        isLoading && (react_1.default.createElement("div", { className: styles_module_css_1.default.loadingIndicator },
            react_1.default.createElement("span", null, "\u25CF"),
            react_1.default.createElement("span", null, "\u25CF"),
            react_1.default.createElement("span", null, "\u25CF"))),
        error && (react_1.default.createElement("div", { className: styles_module_css_1.default.errorMessage }, error))));
}
exports.ChatHistory = ChatHistory;
//# sourceMappingURL=ChatHistory.js.map