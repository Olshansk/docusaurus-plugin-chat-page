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
exports.ChatInput = void 0;
const react_1 = __importStar(require("react"));
const styles_module_css_1 = __importDefault(require("../styles.module.css"));
function ChatInput({ onSubmit, disabled = false, placeholder = "Ask a question about the documentation..." }) {
    const [inputValue, setInputValue] = (0, react_1.useState)("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || disabled)
            return;
        onSubmit(inputValue);
        setInputValue("");
    };
    return (react_1.default.createElement("form", { onSubmit: handleSubmit, className: styles_module_css_1.default.chatInputContainer },
        react_1.default.createElement("input", { type: "text", value: inputValue, onChange: (e) => setInputValue(e.target.value), placeholder: placeholder, className: styles_module_css_1.default.chatInput, disabled: disabled }),
        react_1.default.createElement("button", { type: "submit", className: styles_module_css_1.default.sendButton, disabled: disabled || !inputValue.trim() }, "Send")));
}
exports.ChatInput = ChatInput;
//# sourceMappingURL=ChatInput.js.map