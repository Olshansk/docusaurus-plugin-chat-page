import type { OpenAIConfig } from "../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
export interface AIService {
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    generateChatCompletion(messages: ChatCompletionMessageParam[]): AsyncGenerator<string, void, unknown>;
}
export declare function createAIService(config: OpenAIConfig): AIService;
