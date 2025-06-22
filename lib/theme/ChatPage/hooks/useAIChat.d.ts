import type { DocumentChunkWithEmbedding } from "../../../types";
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
export declare function useAIChat(chunks: DocumentChunkWithEmbedding[], config: AIConfig): {
    generateResponse: (query: string, chatHistory: Message[]) => AsyncGenerator<string, void, unknown>;
};
export {};
