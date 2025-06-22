import type { ChatInstance } from "../components/ChatSidebar";
import type { Message } from "../components/ChatMessage";
export interface ChatState {
    chats: ChatInstance[];
    activeChatId: string | null;
}
export declare function useChatState(): {
    chatState: ChatState;
    createNewChat: () => void;
    switchChat: (chatId: string) => void;
    deleteChat: (chatId: string) => void;
    addMessage: (chatId: string, message: Message) => void;
    updateChatLoading: (chatId: string, isLoading: boolean) => void;
    updateChatError: (chatId: string, error: string | null) => void;
    updateChatTitle: (chatId: string, title: string) => void;
    updateLastMessage: (chatId: string, content: string) => void;
};
