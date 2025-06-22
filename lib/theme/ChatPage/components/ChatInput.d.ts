/// <reference types="react" />
interface ChatInputProps {
    onSubmit: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}
export declare function ChatInput({ onSubmit, disabled, placeholder }: ChatInputProps): JSX.Element;
export {};
