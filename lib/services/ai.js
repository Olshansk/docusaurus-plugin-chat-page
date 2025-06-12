"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIService = void 0;
const openai_1 = __importDefault(require("openai"));
function createAIService(config) {
    const client = new openai_1.default({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
    });
    return {
        async generateEmbeddings(texts) {
            const response = await client.embeddings.create({
                input: texts,
                model: "text-embedding-3-small",
            });
            return response.data.map((item) => item.embedding);
        },
        async *generateChatCompletion(messages) {
            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages,
                stream: true,
            });
            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content)
                    yield content;
            }
        },
    };
}
exports.createAIService = createAIService;
//# sourceMappingURL=ai.js.map