import OpenAI from "openai"
import type { OpenAIConfig } from "../types"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

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
      const response = await client.embeddings.create({
        input: texts,
        model: options.model || "text-embedding-3-small",
      })
      return response.data.map((item) => item.embedding)
    },

    async *generateChatCompletion(
      messages: ChatCompletionMessageParam[],
      options: ChatCompletionOptions = {}
    ) {
      const completion = await client.chat.completions.create({
        model: options.model || "gpt-4o-mini",
        messages,
        stream: true,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      })

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || ""
        if (content) yield content
      }
    },
  }
}
