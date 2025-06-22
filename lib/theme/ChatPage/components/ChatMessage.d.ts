/// <reference types="react" />
export interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}
interface ChatMessageProps {
    message: Message;
}
export declare function ChatMessage({ message }: ChatMessageProps): JSX.Element;
export {};
