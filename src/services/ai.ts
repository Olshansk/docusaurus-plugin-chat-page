import OpenAI from "openai"
import type { OpenAIConfig } from "../types"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { handleOpenAIError, withRetry, logError } from "../utils/errors"

export interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface EmbeddingOptions {
  model?: string
}

export interface AIService {
  generateEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]>
  generateChatCompletion(
    messages: ChatCompletionMessageParam[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<string, void, unknown>
}

export function createAIService(config: OpenAIConfig): AIService {
  const client = new OpenAI({
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  })

  return {
    async generateEmbeddings(
      texts: string[], 
      options: EmbeddingOptions = {}
    ): Promise<number[][]> {
      console.log(`🔮 Generating embeddings for ${texts.length} texts...`);
      
      return withRetry(async () => {
        try {
          const response = await client.embeddings.create({
            input: texts,
            model: options.model || "text-embedding-3-small",
          })
          
          console.log(`✅ Successfully generated ${response.data.length} embeddings`);
          return response.data.map((item) => item.embedding)
        } catch (error) {
          const pluginError = handleOpenAIError(error);
          logError(pluginError, "generateEmbeddings");
          throw pluginError;
        }
      }, 3, 2000);
    },

    async *generateChatCompletion(
      messages: ChatCompletionMessageParam[],
      options: ChatCompletionOptions = {}
    ) {
      console.log(`💬 Starting chat completion with ${messages.length} messages...`);
      
      try {
        const completion = await withRetry(async () => {
          return client.chat.completions.create({
            model: options.model || "gpt-4o-mini",
            messages,
            stream: true,
            temperature: options.temperature,
            max_tokens: options.maxTokens,
          })
        }, 2, 1000);

        let tokenCount = 0;
        for await (const chunk of completion) {
          try {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              tokenCount++;
              yield content
            }
          } catch (chunkError) {
            console.error("🔥❌ Error processing chat completion chunk:", chunkError);
            // Continue with next chunk rather than failing completely
            continue;
          }
        }
        
        console.log(`✅ Chat completion finished, streamed ${tokenCount} content chunks`);
      } catch (error) {
        const pluginError = handleOpenAIError(error);
        logError(pluginError, "generateChatCompletion");
        throw pluginError;
      }
    },
  }
}
