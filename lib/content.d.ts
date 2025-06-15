import { LoadContext } from "@docusaurus/types";
import type { FileNode, ChatPluginContent, OpenAIConfig, EmbeddingConfig, EmbeddingCacheConfig } from "./types";
/**
 * Process a directory and build a tree structure
 */
export declare function processDirectory(dir: string): Promise<FileNode[]>;
export declare function loadContent(context: LoadContext & {
    options?: {
        openai?: OpenAIConfig;
        embeddingCache?: EmbeddingCacheConfig;
        embedding?: EmbeddingConfig;
        baseURL?: string;
    };
}): Promise<ChatPluginContent>;
