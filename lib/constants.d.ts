import type { PluginOptions, EmbeddingConfig, PromptConfig, EmbeddingCacheConfig } from "./types";
export declare const DEFAULT_PLUGIN_OPTIONS: Required<Pick<PluginOptions, 'label' | 'path'>>;
export declare const DEFAULT_EMBEDDING_CONFIG: Required<EmbeddingConfig>;
export declare const DEFAULT_PROMPT_CONFIG: Required<PromptConfig> & {
    systemPrompt: string;
};
export declare const DEFAULT_EMBEDDING_CACHE_CONFIG: Required<EmbeddingCacheConfig>;
export declare const STORAGE_KEYS: {
    readonly CHAT_STATE: "docusaurus-chat-state";
};
export declare const CHAT_DEFAULTS: {
    readonly NEW_CHAT_TITLE: "New Chat";
    readonly DEFAULT_CHAT_ID: "default";
    readonly PROGRESS_UPDATE_DELAY: 50;
};
export declare const FILE_PATTERNS: {
    readonly MARKDOWN: "**/*.{md,mdx}";
    readonly THEME_PATHS: readonly ["src/theme/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"];
};
