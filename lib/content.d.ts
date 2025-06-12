import { LoadContext } from "@docusaurus/types";
import type { FileNode, ChatPluginContent, OpenAIConfig } from "./types";
/**
 * Process a directory and build a tree structure
 */
export declare function processDirectory(dir: string): Promise<FileNode[]>;
/**
 * Load all content and prepare for embedding generation
 */
export declare function loadContent(context: LoadContext & {
    options?: {
        openai?: OpenAIConfig;
    };
}): Promise<ChatPluginContent>;
