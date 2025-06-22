import React from "react";
import { CHAT_DEFAULTS } from "../../../constants";
import styles from "../styles.module.css";
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

// Helper function to group chats by date
const groupChatsByDate = (chats: ChatInstance[]) => {
  const groups: { [key: string]: ChatInstance[] } = {};

  // Sort chats by updatedAt timestamp (most recent first)
  const sortedChats = [...chats].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  sortedChats.forEach((chat) => {
    const date = chat.updatedAt;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(chat);
  });

  return groups;
};

export function ChatSidebar({ 
  chats, 
  activeChatId, 
  onNewChat, 
  onSwitchChat, 
  onDeleteChat 
}: ChatSidebarProps): JSX.Element {
  const chatGroups = groupChatsByDate(chats);

  return (
    <div className={styles.chatSideMenu}>
      <button
        className={styles.newChatButton}
        onClick={onNewChat}
        title="Start a new chat"
      >
        + New Chat
      </button>
      
      <div className={styles.chatList}>
        {Object.entries(chatGroups).map(([dateGroup, groupChats]) => (
          <div key={dateGroup} className={styles.chatGroup}>
            <div className={styles.chatGroupHeader}>{dateGroup}</div>
            {groupChats.map((chat) => (
              <div
                key={chat.id}
                className={`${styles.chatListItem} ${
                  chat.id === activeChatId ? styles.active : ""
                }`}
                onClick={() => onSwitchChat(chat.id)}
              >
                <span className={styles.chatTitle}>{chat.title}</span>
                {chats.length > 1 && (
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}