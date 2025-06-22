/// <reference types="react" />
import type { Message } from "./ChatMessage";
export interface ChatInstance {
    id: string;
    title: string;
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
}
interface ChatSidebarProps {
    chats: ChatInstance[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSwitchChat: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
}
export declare function ChatSidebar({ chats, activeChatId, onNewChat, onSwitchChat, onDeleteChat }: ChatSidebarProps): JSX.Element;
export {};
