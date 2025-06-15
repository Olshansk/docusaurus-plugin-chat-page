import type { ChatPluginContent, OpenAIConfig, PromptConfig, EmbeddingConfig } from "./types";
import { LoadContext, Plugin } from "@docusaurus/types";
import type { EmbeddingCacheConfig } from "./types";
export interface PluginOptions {
    label?: string;
    path?: string;
    openai?: OpenAIConfig;
    embeddingCache?: EmbeddingCacheConfig;
    prompt?: PromptConfig;
    embedding?: EmbeddingConfig;
}
export default function pluginChatPage(context: LoadContext, options?: PluginOptions): Plugin<ChatPluginContent>;
