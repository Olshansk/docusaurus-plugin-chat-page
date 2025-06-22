import React, { useEffect, useRef } from "react";
import { ChatMessage, type Message } from "./ChatMessage";
import styles from "../styles.module.css";

interface ChatHistoryProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
}

export function ChatHistory({ messages, isLoading = false, error = null }: ChatHistoryProps): JSX.Element {
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.chatHistory} ref={chatHistoryRef}>
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      
      {isLoading && (
        <div className={styles.loadingIndicator}>
          <span>●</span>
          <span>●</span>
          <span>●</span>
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </div>
  );
}