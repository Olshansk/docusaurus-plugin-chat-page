import { useCallback } from "react";
import type { DocumentChunkWithEmbedding } from "../../../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ChatCompletionOptions } from "../../../services/ai";
import { cosineSimilarity } from "../../../utils/vector";
import { createAIService } from "../../../services/ai";
import { DEFAULT_EMBEDDING_CONFIG, DEFAULT_PROMPT_CONFIG } from "../../../constants";
import { handleValidationError, DocusaurusPluginError, logError } from "../../../utils/errors";
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
  if (!chunks?.length) {
    console.warn("⚠️ No document chunks provided to useAIChat");
  }

  if (!config?.openai?.apiKey) {
    throw handleValidationError("config.openai.apiKey", config?.openai?.apiKey, "is required");
  }

  const aiService = createAIService(config.openai);

  const findRelevantChunks = useCallback(async (query: string, topK: number = DEFAULT_EMBEDDING_CONFIG.relevantChunks) => {
    console.log(`🔍 Finding relevant chunks for query: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}" (top ${topK})`);
    
    try {
      if (!query?.trim()) {
        throw handleValidationError("query", query, "cannot be empty");
      }

      if (!chunks?.length) {
        console.warn("⚠️ No chunks available for similarity search");
        return [];
      }

      const [queryEmbedding] = await aiService.generateEmbeddings([query]);
      
      if (!queryEmbedding?.length) {
        console.error("❌ Failed to generate query embedding");
        throw new Error("No embedding generated for query");
      }

      const similarities = chunks.map((chunk) => {
        try {
          return {
            chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
          };
        } catch (simError) {
          console.warn(`⚠️ Skipping chunk due to similarity calculation error:`, simError);
          return null;
        }
      }).filter(Boolean);

      const relevantChunks = similarities
        .sort((a, b) => b!.similarity - a!.similarity)
        .slice(0, topK)
        .map((item) => item!.chunk);

      console.log(`✅ Found ${relevantChunks.length} relevant chunks (avg similarity: ${similarities.slice(0, topK).reduce((sum, item) => sum + item!.similarity, 0) / Math.min(topK, similarities.length)})`);
      
      return relevantChunks;
    } catch (error) {
      logError(error as Error, "findRelevantChunks");
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
          
          // 🔥 Enhanced context with file statistics
          const fileStats = chunk.metadata.fileStats;
          const chunkStats = chunk.metadata.chunkStats;
          
          let contextInfo = `${chunk.text}\n\nSource: ${chunk.metadata.fileURL || chunk.metadata.filePath}`;
          
          // Add file statistics if available
          if (fileStats) {
            contextInfo += `\n📊 File Info: ${fileStats.fileSizeKB}KB, ${fileStats.totalChunksInFile} chunks, ~${fileStats.estimatedReadingTimeMinutes}min read`;
          }
          
          // Add chunk-specific info if available  
          if (chunkStats) {
            contextInfo += `\n📦 Section: ${chunkStats.chunkIndex}/${fileStats?.totalChunksInFile || '?'} (${chunkStats.chunkSizeKB}KB)`;
            if (chunk.metadata.section) {
              contextInfo += ` - "${chunk.metadata.section}"`;
            }
          }
          
          return contextInfo;
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