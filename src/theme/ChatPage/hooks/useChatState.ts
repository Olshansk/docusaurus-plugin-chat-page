import { useState, useEffect } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { STORAGE_KEYS, CHAT_DEFAULTS } from "../../../constants";
import type { ChatInstance } from "../components/ChatSidebar";
import type { Message } from "../components/ChatMessage";

export interface ChatState {
  chats: ChatInstance[];
  activeChatId: string | null;
}

const serializeChatState = (state: ChatState): string => {
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

const deserializeChatState = (serialized: string): ChatState => {
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

const DEFAULT_CHAT_STATE: ChatState = {
  chats: [
    {
      id: CHAT_DEFAULTS.DEFAULT_CHAT_ID,
      title: CHAT_DEFAULTS.NEW_CHAT_TITLE,
      messages: [],
      isLoading: false,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  activeChatId: CHAT_DEFAULTS.DEFAULT_CHAT_ID,
};

export function useChatState() {
  const isBrowser = useIsBrowser();
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatState, setChatState] = useState<ChatState>(DEFAULT_CHAT_STATE);

  // Load state from localStorage once browser is ready
  useEffect(() => {
    if (isBrowser && !isInitialized) {
      const savedState = localStorage.getItem(STORAGE_KEYS.CHAT_STATE);
      if (savedState) {
        try {
          const loadedState = deserializeChatState(savedState);
          setChatState(loadedState);
        } catch (error) {
          console.error("Error loading chat state from localStorage:", error);
        }
      }
      setIsInitialized(true);
    }
  }, [isBrowser, isInitialized]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isBrowser && isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEYS.CHAT_STATE, serializeChatState(chatState));
      } catch (error) {
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
          title: CHAT_DEFAULTS.NEW_CHAT_TITLE,
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

  const switchChat = (chatId: string) => {
    setChatState((prev) => ({
      ...prev,
      activeChatId: chatId,
    }));
  };

  const deleteChat = (chatId: string) => {
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
              title: CHAT_DEFAULTS.NEW_CHAT_TITLE,
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

  const addMessage = (chatId: string, message: Message) => {
    const now = new Date();
    setChatState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              updatedAt: now,
            }
          : chat
      ),
    }));
  };

  const updateChatLoading = (chatId: string, isLoading: boolean) => {
    setChatState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              isLoading,
              error: isLoading ? null : chat.error,
            }
          : chat
      ),
    }));
  };

  const updateChatError = (chatId: string, error: string | null) => {
    setChatState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              error,
              isLoading: false,
            }
          : chat
      ),
    }));
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChatState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title,
            }
          : chat
      ),
    }));
  };

  const updateLastMessage = (chatId: string, content: string) => {
    setChatState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === chatId
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
          : chat
      ),
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