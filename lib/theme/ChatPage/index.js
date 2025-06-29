"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Layout_1 = __importDefault(require("@theme/Layout"));
const useGlobalData_1 = require("@docusaurus/useGlobalData");
const ChatSidebar_1 = require("./components/ChatSidebar");
const ChatHistory_1 = require("./components/ChatHistory");
const ChatInput_1 = require("./components/ChatInput");
const ErrorBoundary_1 = require("./components/ErrorBoundary");
const useChatState_1 = require("./hooks/useChatState");
const useAIChat_1 = require("./hooks/useAIChat");
const constants_1 = require("../../constants");
const errors_1 = require("../../utils/errors");
const styles_module_css_1 = __importDefault(require("./styles.module.css"));
function ChatPage() {
    const pluginData = (0, useGlobalData_1.usePluginData)("docusaurus-plugin-chat-page");
    const { chatState, createNewChat, switchChat, deleteChat, addMessage, updateChatLoading, updateChatError, updateChatTitle, updateLastMessage, } = (0, useChatState_1.useChatState)();
    // Defensive check for data
    if (!pluginData || typeof pluginData !== "object") {
        return (react_1.default.createElement(Layout_1.default, { title: "Chat", description: "Chat with your documentation" },
            react_1.default.createElement("div", { className: "container margin-vert--lg" },
                react_1.default.createElement("div", { className: styles_module_css_1.default.errorMessage }, "No plugin data available. Make sure the plugin is properly configured."))));
    }
    const { chunks, metadata, config } = pluginData;
    // Check for required data
    if (!chunks || !metadata || !config?.openai?.apiKey) {
        return (react_1.default.createElement(Layout_1.default, { title: "Chat", description: "Chat with your documentation" },
            react_1.default.createElement("div", { className: "container margin-vert--lg" },
                react_1.default.createElement("div", { className: styles_module_css_1.default.errorMessage },
                    "Missing required data. Please ensure the plugin is properly configured with:",
                    react_1.default.createElement("ul", null,
                        !chunks && react_1.default.createElement("li", null, "Document chunks"),
                        !metadata && react_1.default.createElement("li", null, "Metadata"),
                        !config?.openai?.apiKey && react_1.default.createElement("li", null, "OpenAI API key"))))));
    }
    const { generateResponse } = (0, useAIChat_1.useAIChat)(chunks, config);
    const handleSubmit = async (query) => {
        if (!chatState.activeChatId) {
            console.warn("⚠️ No active chat selected");
            return;
        }
        const activeChat = chatState.chats.find((chat) => chat.id === chatState.activeChatId);
        if (!activeChat) {
            console.error("❌ Active chat not found in chat list");
            return;
        }
        console.log(`💬 Processing user query: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`);
        const userMessage = {
            role: "user",
            content: query,
            timestamp: new Date(),
        };
        // Add user message and set loading state
        addMessage(chatState.activeChatId, userMessage);
        updateChatLoading(chatState.activeChatId, true);
        try {
            const assistantMessage = {
                role: "assistant",
                content: "",
                timestamp: new Date(),
            };
            // Add empty assistant message
            addMessage(chatState.activeChatId, assistantMessage);
            console.log("🤖 Starting AI response generation...");
            let contentReceived = false;
            // Stream the AI response
            for await (const content of generateResponse(query, activeChat.messages)) {
                contentReceived = true;
                assistantMessage.content += content;
                updateLastMessage(chatState.activeChatId, assistantMessage.content);
            }
            if (!contentReceived) {
                console.warn("⚠️ No content received from AI service");
                updateChatError(chatState.activeChatId, "🤖❌ No response received from AI. Please try again.");
                return;
            }
            // Update chat title based on first user message if it's still the default
            if (activeChat.title === constants_1.CHAT_DEFAULTS.NEW_CHAT_TITLE) {
                updateChatTitle(chatState.activeChatId, userMessage.content.slice(0, 30) + "...");
            }
            console.log("✅ AI response completed successfully");
            // Final update after streaming is complete
            updateChatLoading(chatState.activeChatId, false);
        }
        catch (error) {
            (0, errors_1.logError)(error, "handleSubmit");
            let userErrorMessage = "❌ Failed to get response. Please try again.";
            if (error instanceof errors_1.DocusaurusPluginError) {
                userErrorMessage = (0, errors_1.formatUserError)(error);
            }
            updateChatError(chatState.activeChatId, userErrorMessage);
        }
    };
    const activeChat = chatState.chats.find((chat) => chat.id === chatState.activeChatId);
    return (react_1.default.createElement(Layout_1.default, { title: "Chat", description: "Chat with your documentation" },
        react_1.default.createElement("div", { className: "container margin-vert--lg" },
            react_1.default.createElement("h1", null, "Chat with Documentation"),
            react_1.default.createElement("p", null,
                "Ask questions about your documentation and get AI-powered answers.",
                " ",
                metadata.totalChunks,
                " chunks of documentation indexed, last updated",
                " ",
                new Date(metadata.lastUpdated).toLocaleDateString(),
                "."),
            react_1.default.createElement("div", { className: styles_module_css_1.default.chatContainer },
                react_1.default.createElement(ErrorBoundary_1.ErrorBoundary, null,
                    react_1.default.createElement(ChatSidebar_1.ChatSidebar, { chats: chatState.chats, activeChatId: chatState.activeChatId, onNewChat: createNewChat, onSwitchChat: switchChat, onDeleteChat: deleteChat })),
                react_1.default.createElement("div", { className: styles_module_css_1.default.chatMain },
                    react_1.default.createElement(ErrorBoundary_1.ErrorBoundary, null,
                        react_1.default.createElement(ChatHistory_1.ChatHistory, { messages: activeChat?.messages || [], isLoading: activeChat?.isLoading || false, error: activeChat?.error || null })),
                    react_1.default.createElement(ErrorBoundary_1.ErrorBoundary, null,
                        react_1.default.createElement(ChatInput_1.ChatInput, { onSubmit: handleSubmit, disabled: !activeChat || activeChat.isLoading })))))));
}
exports.default = ChatPage;
//# sourceMappingURL=index.js.map