import { LoadContext, Plugin } from "@docusaurus/types";
import type { ChatPluginContent, OpenAIConfig } from "./types";
export interface PluginOptions {
    label?: string;
    path?: string;
    openai?: OpenAIConfig;
}
export default function pluginChatPage(context: LoadContext, options?: PluginOptions): Plugin<ChatPluginContent>;
