import React, { useState } from "react";
import styles from "../styles.module.css";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSubmit, 
  disabled = false, 
  placeholder = "Ask a question about the documentation..." 
}: ChatInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled) return;
    
    onSubmit(inputValue);
    setInputValue("");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatInputContainer}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className={styles.chatInput}
        disabled={disabled}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={disabled || !inputValue.trim()}
      >
        Send
      </button>
    </form>
  );
}