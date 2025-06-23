"use strict";
/// <reference types="@docusaurus/module-type-aliases" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const content_1 = require("./content");
const utils_1 = require("@docusaurus/utils");
const constants_1 = require("./constants");
function pluginChatPage(context, options = {}) {
    const { siteConfig: { baseUrl }, } = context;
    // Default options
    const { label = constants_1.DEFAULT_PLUGIN_OPTIONS.label, path: inputPath = constants_1.DEFAULT_PLUGIN_OPTIONS.path, baseURL, openai, embeddingCache, prompt, embedding, } = options;
    // Normalize the path
    const routePath = (0, utils_1.normalizeUrl)([baseUrl, inputPath]);
    return {
        name: "docusaurus-plugin-chat-page",
        getThemePath() {
            return "../lib/theme";
        },
        getTypeScriptThemePath() {
            return "./theme";
        },
        getPathsToWatch() {
            return constants_1.FILE_PATTERNS.THEME_PATHS.map(pattern => path.join(pattern));
        },
        getClientModules() {
            return [path.join("theme", "ChatPage", "styles.module.css")];
        },
        async loadContent() {
            if (!openai?.apiKey) {
                throw new Error("OpenAI API key is required. Please add it to your docusaurus.config.js");
            }
            return (0, content_1.loadContent)({ ...context, options: { openai, embeddingCache, embedding, baseURL } });
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
exports.default = pluginChatPage;
//# sourceMappingURL=index.js.map