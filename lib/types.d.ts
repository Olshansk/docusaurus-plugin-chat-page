export interface FileNode {
    type: "file" | "directory";
    name: string;
    path: string;
    children?: FileNode[];
    content?: {
        metadata: Record<string, any>;
        rawContent: string;
    };
}
/**
 * Base document chunk without embedding
 */
export interface DocumentChunk {
    text: string;
    metadata: {
        filePath: string;
        fileURL?: string;
        title?: string;
        section?: string;
        position?: number;
        fileStats?: {
            fileSizeBytes: number;
            fileSizeKB: number;
            totalChunksInFile: number;
            totalEmbeddingsInFile: number;
            fileWordCount: number;
            estimatedReadingTimeMinutes: number;
            averageChunkSizeBytes: number;
            compressionRatio: number;
        };
        chunkStats?: {
            chunkIndex: number;
            chunkSizeBytes: number;
            chunkSizeKB: number;
            chunkWordCount: number;
            chunkReadingTimeSeconds: number;
            isLargeChunk: boolean;
            chunkType: string;
        };
        processingStats?: {
            processedAt: string;
            chunkingStrategy: string;
            maxChunkSize: number;
            embeddingModel: string;
            wasTruncated: boolean;
            originalChunkCount: number;
        };
        [key: string]: any;
    };
}
/**
 * Document chunk with embedding vector
 */
export interface DocumentChunkWithEmbedding extends DocumentChunk {
    embedding: number[];
}
export interface VectorStore {
    chunks: DocumentChunkWithEmbedding[];
    metadata: {
        model: string;
        timestamp: string;
        version: string;
    };
}
export interface ChatPluginContent {
    chunks: DocumentChunkWithEmbedding[];
    metadata: {
        totalChunks: number;
        lastUpdated: string;
        contentHash?: string;
        globalStats?: {
            totalFiles: number;
            totalOriginalBytes: number;
            totalOriginalKB: number;
            totalProcessedBytes: number;
            totalProcessedKB: number;
            totalWords: number;
            totalReadingTimeMinutes: number;
            averageChunksPerFile: number;
            compressionRatio: number;
            largestFileBytes: number;
            smallestFileBytes: number;
            processingTimeSeconds: number;
            embeddingModel: string;
            chunkingStrategy: string;
            maxChunkSize: number;
            actualMaxChunkSize: number;
            actualMinChunkSize: number;
        };
        fileBreakdown?: Array<{
            filePath: string;
            fileURL: string;
            originalBytes: number;
            processedBytes: number;
            totalChunks: number;
            wordCount: number;
            readingTimeMinutes: number;
            averageChunkSize: number;
        }>;
    };
}
export interface OpenAIConfig {
    apiKey: string;
}
export type EmbeddingCacheMode = "auto" | "use" | "skip";
export interface EmbeddingCacheConfig {
    mode?: EmbeddingCacheMode;
    path?: string;
}
export interface PromptConfig {
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface EmbeddingConfig {
    model?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    batchSize?: number;
    maxChunksPerFile?: number;
    chunkingStrategy?: "headers" | "paragraphs";
    relevantChunks?: number;
}
export interface PluginOptions {
    label?: string;
    path?: string;
    baseURL?: string;
    openai?: OpenAIConfig;
    embeddingCache?: EmbeddingCacheConfig;
    prompt?: PromptConfig;
    embedding?: EmbeddingConfig;
}
