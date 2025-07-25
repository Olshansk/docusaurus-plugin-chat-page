/// <reference types="@docusaurus/module-type-aliases" />

import * as path from "path";

import type { ChatPluginContent, OpenAIConfig, PromptConfig, EmbeddingConfig } from "./types";
import { LoadContext, Plugin } from "@docusaurus/types";

import type { EmbeddingCacheConfig } from "./types";
import { loadContent } from "./content";
import { normalizeUrl } from "@docusaurus/utils";
import { DEFAULT_PLUGIN_OPTIONS, FILE_PATTERNS } from "./constants";

export interface PluginOptions {
  label?: string;
  path?: string;
  baseURL?: string;
  openai?: OpenAIConfig;
  embeddingCache?: EmbeddingCacheConfig;
  prompt?: PromptConfig;
  embedding?: EmbeddingConfig;
}

export default function pluginChatPage(
  context: LoadContext,
  options: PluginOptions = {}
): Plugin<ChatPluginContent> {
  const {
    siteConfig: { baseUrl },
  } = context;

  // Default options
  const {
    label = DEFAULT_PLUGIN_OPTIONS.label,
    path: inputPath = DEFAULT_PLUGIN_OPTIONS.path,
    baseURL,
    openai,
    embeddingCache,
    prompt,
    embedding,
  } = options;

  // Normalize the path
  const routePath = normalizeUrl([baseUrl, inputPath]);

  return {
    name: "docusaurus-plugin-chat-page",

    getThemePath() {
      return "../lib/theme";
    },

    getTypeScriptThemePath() {
      return "./theme";
    },

    getPathsToWatch() {
      return FILE_PATTERNS.THEME_PATHS.map(pattern => path.join(pattern));
    },

    getClientModules() {
      return [path.join("theme", "ChatPage", "styles.module.css")];
    },

    async loadContent() {
      if (!openai?.apiKey) {
        throw new Error(
          "OpenAI API key is required. Please add it to your docusaurus.config.js"
        );
      }
      return loadContent({ ...context, options: { openai, embeddingCache, embedding, baseURL } });
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute, setGlobalData } = actions;

      setGlobalData({
        pluginId: "docusaurus-plugin-chat-page",
        ...content,
        config: {
          openai,
          prompt,
          embedding,
          baseURL,
        },
      });

      // Use the content data directly from loadContent instead of trying to read cache
      console.log(`\n📖 USING CONTENT FROM LOADCONTENT`);
      console.log(`📖 Content contains ${content.chunks?.length || 0} chunks`);
      
      const embeddingsData = JSON.stringify({
        ...content,
        config: {
          openai,
          prompt,
          embedding,
          baseURL,
        },
      });

      const embeddingsPath = await createData("embeddings.json", embeddingsData);

      addRoute({
        path: routePath,
        component: "@theme/ChatPage",
        modules: {
          embeddings: embeddingsPath,
        },
        exact: true,
      });
    },
  };
}
