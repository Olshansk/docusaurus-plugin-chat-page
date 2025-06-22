"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatState = void 0;
const react_1 = require("react");
const useIsBrowser_1 = __importDefault(require("@docusaurus/useIsBrowser"));
const constants_1 = require("../../../constants");
const serializeChatState = (state) => {
    return JSON.stringify({
        ...state,
        chats: state.chats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) => ({
                ...msg,
                timestamp: msg.timestamp.toISOString(),
            })),
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt.toISOString(),
        })),
    });
};
const deserializeChatState = (serialized) => {
    const parsed = JSON.parse(serialized);
    return {
        ...parsed,
        chats: parsed.chats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
            })),
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
        })),
    };
};
const DEFAULT_CHAT_STATE = {
    chats: [
        {
            id: constants_1.CHAT_DEFAULTS.DEFAULT_CHAT_ID,
            title: constants_1.CHAT_DEFAULTS.NEW_CHAT_TITLE,
            messages: [],
            isLoading: false,
            error: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
    activeChatId: constants_1.CHAT_DEFAULTS.DEFAULT_CHAT_ID,
};
function useChatState() {
    const isBrowser = (0, useIsBrowser_1.default)();
    const [isInitialized, setIsInitialized] = (0, react_1.useState)(false);
    const [chatState, setChatState] = (0, react_1.useState)(DEFAULT_CHAT_STATE);
    // Load state from localStorage once browser is ready
    (0, react_1.useEffect)(() => {
        if (isBrowser && !isInitialized) {
            const savedState = localStorage.getItem(constants_1.STORAGE_KEYS.CHAT_STATE);
            if (savedState) {
                try {
                    const loadedState = deserializeChatState(savedState);
                    setChatState(loadedState);
                }
                catch (error) {
                    console.error("Error loading chat state from localStorage:", error);
                }
            }
            setIsInitialized(true);
        }
    }, [isBrowser, isInitialized]);
    // Save state to localStorage whenever it changes
    (0, react_1.useEffect)(() => {
        if (isBrowser && isInitialized) {
            try {
                localStorage.setItem(constants_1.STORAGE_KEYS.CHAT_STATE, serializeChatState(chatState));
            }
            catch (error) {
                console.error("Error saving chat state to localStorage:", error);
            }
        }
    }, [chatState, isBrowser, isInitialized]);
    const createNewChat = () => {
        const newChatId = `chat-${Date.now()}`;
        const now = new Date();
        setChatState((prev) => ({
            chats: [
                ...prev.chats,
                {
                    id: newChatId,
                    title: constants_1.CHAT_DEFAULTS.NEW_CHAT_TITLE,
                    messages: [],
                    isLoading: false,
                    error: null,
                    createdAt: now,
                    updatedAt: now,
                },
            ],
            activeChatId: newChatId,
        }));
    };
    const switchChat = (chatId) => {
        setChatState((prev) => ({
            ...prev,
            activeChatId: chatId,
        }));
    };
    const deleteChat = (chatId) => {
        setChatState((prev) => {
            const newChats = prev.chats.filter((chat) => chat.id !== chatId);
            let newActiveChatId = prev.activeChatId;
            // If we're deleting the active chat, switch to another one
            if (chatId === prev.activeChatId) {
                newActiveChatId = newChats[0]?.id || null;
            }
            // If this was the last chat, create a new one
            if (newChats.length === 0) {
                const newChatId = `chat-${Date.now()}`;
                return {
                    chats: [
                        {
                            id: newChatId,
                            title: constants_1.CHAT_DEFAULTS.NEW_CHAT_TITLE,
                            messages: [],
                            isLoading: false,
                            error: null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ],
                    activeChatId: newChatId,
                };
            }
            return {
                chats: newChats,
                activeChatId: newActiveChatId,
            };
        });
    };
    const addMessage = (chatId, message) => {
        const now = new Date();
        setChatState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) => chat.id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, message],
                    updatedAt: now,
                }
                : chat),
        }));
    };
    const updateChatLoading = (chatId, isLoading) => {
        setChatState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) => chat.id === chatId
                ? {
                    ...chat,
                    isLoading,
                    error: isLoading ? null : chat.error,
                }
                : chat),
        }));
    };
    const updateChatError = (chatId, error) => {
        setChatState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) => chat.id === chatId
                ? {
                    ...chat,
                    error,
                    isLoading: false,
                }
                : chat),
        }));
    };
    const updateChatTitle = (chatId, title) => {
        setChatState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) => chat.id === chatId
                ? {
                    ...chat,
                    title,
                }
                : chat),
        }));
    };
    const updateLastMessage = (chatId, content) => {
        setChatState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) => chat.id === chatId
                ? {
                    ...chat,
                    messages: [
                        ...chat.messages.slice(0, -1),
                        {
                            ...chat.messages[chat.messages.length - 1],
                            content,
                        },
                    ],
                }
                : chat),
        }));
    };
    return {
        chatState,
        createNewChat,
        switchChat,
        deleteChat,
        addMessage,
        updateChatLoading,
        updateChatError,
        updateChatTitle,
        updateLastMessage,
    };
}
exports.useChatState = useChatState;
//# sourceMappingURL=useChatState.js.map