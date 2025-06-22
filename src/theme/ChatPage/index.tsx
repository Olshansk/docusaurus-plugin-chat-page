import React from "react";
import Layout from "@theme/Layout";
import { usePluginData } from "@docusaurus/useGlobalData";
import type { DocumentChunkWithEmbedding } from "../../types";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHistory } from "./components/ChatHistory";
import { ChatInput } from "./components/ChatInput";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { Message } from "./components/ChatMessage";
import { useChatState } from "./hooks/useChatState";
import { useAIChat } from "./hooks/useAIChat";
import { CHAT_DEFAULTS } from "../../constants";
import { formatUserError, DocusaurusPluginError, logError } from "../../utils/errors";
import styles from "./styles.module.css";

export default function ChatPage(): JSX.Element {
  const pluginData = usePluginData("docusaurus-plugin-chat-page");
  const {
    chatState,
    createNewChat,
    switchChat,
    deleteChat,
    addMessage,
    updateChatLoading,
    updateChatError,
    updateChatTitle,
    updateLastMessage,
  } = useChatState();

  // Defensive check for data
  if (!pluginData || typeof pluginData !== "object") {
    return (
      <Layout title="Chat" description="Chat with your documentation">
        <div className="container margin-vert--lg">
          <div className={styles.errorMessage}>
            No plugin data available. Make sure the plugin is properly configured.
          </div>
        </div>
      </Layout>
    );
  }

  const { chunks, metadata, config } = pluginData as {
    chunks: DocumentChunkWithEmbedding[];
    metadata: {
      totalChunks: number;
      lastUpdated: string;
    };
    config: {
      openai: {
        apiKey: string;
      };
      prompt?: {
        systemPrompt?: string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
      };
      embedding?: {
        model?: string;
        chunkSize?: number;
        chunkOverlap?: number;
        batchSize?: number;
        maxChunksPerFile?: number;
        chunkingStrategy?: "headers" | "paragraphs";
        relevantChunks?: number;
      };
      baseURL?: string;
    };
  };

  // Check for required data
  if (!chunks || !metadata || !config?.openai?.apiKey) {
    return (
      <Layout title="Chat" description="Chat with your documentation">
        <div className="container margin-vert--lg">
          <div className={styles.errorMessage}>
            Missing required data. Please ensure the plugin is properly configured with:
            <ul>
              {!chunks && <li>Document chunks</li>}
              {!metadata && <li>Metadata</li>}
              {!config?.openai?.apiKey && <li>OpenAI API key</li>}
            </ul>
          </div>
        </div>
      </Layout>
    );
  }

  const { generateResponse } = useAIChat(chunks, config);

  const handleSubmit = async (query: string) => {
    if (!chatState.activeChatId) {
      console.warn("⚠️ No active chat selected");
      return;
    }

    const activeChat = chatState.chats.find(
      (chat) => chat.id === chatState.activeChatId
    );
    if (!activeChat) {
      console.error("❌ Active chat not found in chat list");
      return;
    }

    console.log(`💬 Processing user query: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`); 

    const userMessage: Message = {
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    // Add user message and set loading state
    addMessage(chatState.activeChatId, userMessage);
    updateChatLoading(chatState.activeChatId, true);

    try {
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      // Add empty assistant message
      addMessage(chatState.activeChatId, assistantMessage);

      console.log("🤖 Starting AI response generation...");
      let contentReceived = false;
      
      // Stream the AI response
      for await (const content of generateResponse(query, activeChat.messages)) {
        contentReceived = true;
        assistantMessage.content += content;
        updateLastMessage(chatState.activeChatId, assistantMessage.content);
      }

      if (!contentReceived) {
        console.warn("⚠️ No content received from AI service");
        updateChatError(chatState.activeChatId, "🤖❌ No response received from AI. Please try again.");
        return;
      }

      // Update chat title based on first user message if it's still the default
      if (activeChat.title === CHAT_DEFAULTS.NEW_CHAT_TITLE) {
        updateChatTitle(chatState.activeChatId, userMessage.content.slice(0, 30) + "...");
      }

      console.log("✅ AI response completed successfully");
      // Final update after streaming is complete
      updateChatLoading(chatState.activeChatId, false);
    } catch (error) {
      logError(error as Error, "handleSubmit");
      
      let userErrorMessage = "❌ Failed to get response. Please try again.";
      if (error instanceof DocusaurusPluginError) {
        userErrorMessage = formatUserError(error);
      }
      
      updateChatError(chatState.activeChatId, userErrorMessage);
    }
  };

  const activeChat = chatState.chats.find(
    (chat) => chat.id === chatState.activeChatId
  );

  return (
    <Layout title="Chat" description="Chat with your documentation">
      <div className="container margin-vert--lg">
        <h1>Chat with Documentation</h1>
        <p>
          Ask questions about your documentation and get AI-powered answers.{" "}
          {metadata.totalChunks} chunks of documentation indexed, last updated{" "}
          {new Date(metadata.lastUpdated).toLocaleDateString()}.
        </p>

        <div className={styles.chatContainer}>
          <ErrorBoundary>
            <ChatSidebar
              chats={chatState.chats}
              activeChatId={chatState.activeChatId}
              onNewChat={createNewChat}
              onSwitchChat={switchChat}
              onDeleteChat={deleteChat}
            />
          </ErrorBoundary>

          <div className={styles.chatMain}>
            <ErrorBoundary>
              <ChatHistory
                messages={activeChat?.messages || []}
                isLoading={activeChat?.isLoading || false}
                error={activeChat?.error || null}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <ChatInput
                onSubmit={handleSubmit}
                disabled={!activeChat || activeChat.isLoading}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Layout>
  );
}