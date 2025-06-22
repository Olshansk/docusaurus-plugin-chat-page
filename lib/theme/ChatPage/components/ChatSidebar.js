"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSidebar = void 0;
const react_1 = __importDefault(require("react"));
const styles_module_css_1 = __importDefault(require("../styles.module.css"));
// Helper function to group chats by date
const groupChatsByDate = (chats) => {
    const groups = {};
    // Sort chats by updatedAt timestamp (most recent first)
    const sortedChats = [...chats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    sortedChats.forEach((chat) => {
        const date = chat.updatedAt;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let dateKey;
        if (date.toDateString() === today.toDateString()) {
            dateKey = "Today";
        }
        else if (date.toDateString() === yesterday.toDateString()) {
            dateKey = "Yesterday";
        }
        else {
            dateKey = date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
        }
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(chat);
    });
    return groups;
};
function ChatSidebar({ chats, activeChatId, onNewChat, onSwitchChat, onDeleteChat }) {
    const chatGroups = groupChatsByDate(chats);
    return (react_1.default.createElement("div", { className: styles_module_css_1.default.chatSideMenu },
        react_1.default.createElement("button", { className: styles_module_css_1.default.newChatButton, onClick: onNewChat, title: "Start a new chat" }, "+ New Chat"),
        react_1.default.createElement("div", { className: styles_module_css_1.default.chatList }, Object.entries(chatGroups).map(([dateGroup, groupChats]) => (react_1.default.createElement("div", { key: dateGroup, className: styles_module_css_1.default.chatGroup },
            react_1.default.createElement("div", { className: styles_module_css_1.default.chatGroupHeader }, dateGroup),
            groupChats.map((chat) => (react_1.default.createElement("div", { key: chat.id, className: `${styles_module_css_1.default.chatListItem} ${chat.id === activeChatId ? styles_module_css_1.default.active : ""}`, onClick: () => onSwitchChat(chat.id) },
                react_1.default.createElement("span", { className: styles_module_css_1.default.chatTitle }, chat.title),
                chats.length > 1 && (react_1.default.createElement("button", { className: styles_module_css_1.default.deleteButton, onClick: (e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                    }, title: "Delete chat" }, "\u00D7")))))))))));
}
exports.ChatSidebar = ChatSidebar;
//# sourceMappingURL=ChatSidebar.js.map