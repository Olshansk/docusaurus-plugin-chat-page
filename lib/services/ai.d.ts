import type { OpenAIConfig } from "../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
export interface ChatCompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface EmbeddingOptions {
    model?: string;
}
export interface AIService {
    generateEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;
    generateChatCompletion(messages: ChatCompletionMessageParam[], options?: ChatCompletionOptions): AsyncGenerator<string, void, unknown>;
}
export declare function createAIService(config: OpenAIConfig): AIService;
