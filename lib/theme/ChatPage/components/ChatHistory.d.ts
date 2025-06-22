/// <reference types="react" />
import { type Message } from "./ChatMessage";
interface ChatHistoryProps {
    messages: Message[];
    isLoading?: boolean;
    error?: string | null;
}
export declare function ChatHistory({ messages, isLoading, error }: ChatHistoryProps): JSX.Element;
export {};
