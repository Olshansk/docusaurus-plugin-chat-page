import { useCallback } from "react";
import type { DocumentChunkWithEmbedding } from "../../../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ChatCompletionOptions } from "../../../services/ai";
import { cosineSimilarity } from "../../../utils/vector";
import { createAIService } from "../../../services/ai";
import { DEFAULT_EMBEDDING_CONFIG, DEFAULT_PROMPT_CONFIG } from "../../../constants";
import type { Message } from "../components/ChatMessage";

interface AIConfig {
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
    relevantChunks?: number;
  };
}

export function useAIChat(chunks: DocumentChunkWithEmbedding[], config: AIConfig) {
  const aiService = createAIService(config.openai);

  const findRelevantChunks = useCallback(async (query: string, topK: number = DEFAULT_EMBEDDING_CONFIG.relevantChunks) => {
    try {
      const [queryEmbedding] = await aiService.generateEmbeddings([query]);
      const similarities = chunks.map((chunk) => ({
        chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      }));

      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .map((item) => item.chunk);
    } catch (error) {
      console.error("Error getting embeddings:", error);
      throw error;
    }
  }, [chunks, aiService]);

  const generateResponse = useCallback(async function* (
    query: string,
    chatHistory: Message[]
  ): AsyncGenerator<string, void, unknown> {
    try {
      const relevantChunks = await findRelevantChunks(
        query,
        config.embedding?.relevantChunks || DEFAULT_EMBEDDING_CONFIG.relevantChunks
      );

      const contextText = relevantChunks
        .map((chunk) => {
          console.log(`[DEBUG] Chunk metadata:`, chunk.metadata);
          return `${chunk.text}\nSource: ${chunk.metadata.fileURL || chunk.metadata.filePath}`;
        })
        .join("\n\n");

      // Build the system prompt for the documentation assistant
      const basePrompt = config.prompt?.systemPrompt || DEFAULT_PROMPT_CONFIG.systemPrompt;
      const systemPrompt = `${basePrompt}\n\nDocumentation context:\n${contextText}`;

      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: query },
      ];

      const chatOptions: ChatCompletionOptions = {
        model: config.prompt?.model,
        temperature: config.prompt?.temperature,
        maxTokens: config.prompt?.maxTokens,
      };

      for await (const content of aiService.generateChatCompletion(messages, chatOptions)) {
        yield content;
      }
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }, [aiService, findRelevantChunks, config]);

  return {
    generateResponse,
  };
}