"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const errors_1 = require("../utils/errors");
function createAIService(config) {
    const client = new openai_1.default({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
    });
    return {
        async generateEmbeddings(texts, options = {}) {
            console.log(`🔮 Generating embeddings for ${texts.length} texts...`);
            return (0, errors_1.withRetry)(async () => {
                try {
                    const response = await client.embeddings.create({
                        input: texts,
                        model: options.model || "text-embedding-3-small",
                    });
                    console.log(`✅ Successfully generated ${response.data.length} embeddings`);
                    return response.data.map((item) => item.embedding);
                }
                catch (error) {
                    const pluginError = (0, errors_1.handleOpenAIError)(error);
                    (0, errors_1.logError)(pluginError, "generateEmbeddings");
                    throw pluginError;
                }
            }, 3, 2000);
        },
        async *generateChatCompletion(messages, options = {}) {
            console.log(`💬 Starting chat completion with ${messages.length} messages...`);
            try {
                const completion = await (0, errors_1.withRetry)(async () => {
                    return client.chat.completions.create({
                        model: options.model || "gpt-4o-mini",
                        messages,
                        stream: true,
                        temperature: options.temperature,
                        max_tokens: options.maxTokens,
                    });
                }, 2, 1000);
                let tokenCount = 0;
                for await (const chunk of completion) {
                    try {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            tokenCount++;
                            yield content;
                        }
                    }
                    catch (chunkError) {
                        console.error("🔥❌ Error processing chat completion chunk:", chunkError);
                        // Continue with next chunk rather than failing completely
                        continue;
                    }
                }
                console.log(`✅ Chat completion finished, streamed ${tokenCount} content chunks`);
            }
            catch (error) {
                const pluginError = (0, errors_1.handleOpenAIError)(error);
                (0, errors_1.logError)(pluginError, "generateChatCompletion");
                throw pluginError;
            }
        },
    };
}
exports.createAIService = createAIService;
//# sourceMappingURL=ai.js.map