import React from "react";
import ReactMarkdown from "react-markdown";
import styles from "../styles.module.css";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps): JSX.Element {
  return (
    <div
      className={`${styles.message} ${
        message.role === "assistant"
          ? styles.assistantMessage
          : styles.userMessage
      }`}
    >
      <div className={styles.messageContent}>
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
      <div className={styles.messageTimestamp}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}