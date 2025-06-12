import type { ChatPluginContent, OpenAIConfig } from "./types";
import { LoadContext, Plugin } from "@docusaurus/types";
import type { EmbeddingCacheConfig } from "./types";
export interface PluginOptions {
    label?: string;
    path?: string;
    openai?: OpenAIConfig;
    embeddingCache?: EmbeddingCacheConfig;
}
export default function pluginChatPage(context: LoadContext, options?: PluginOptions): Plugin<ChatPluginContent>;
