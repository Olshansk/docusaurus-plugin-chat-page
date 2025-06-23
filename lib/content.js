"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContent = exports.processDirectory = void 0;
/**
 * Load all content and prepare for embedding generation
 */
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
const errors_1 = require("./utils/errors");
const ai_1 = require("./services/ai");
const glob_1 = require("glob");
const gray_matter_1 = __importDefault(require("gray-matter"));
const process_1 = __importDefault(require("process"));
const remark_1 = require("remark");
const strip_markdown_1 = __importDefault(require("strip-markdown"));
/**
 * Convert file path to documentation URL
 */
function filePathToURL(filePath, baseURL, context) {
    console.log(`\n🔗 Converting file path: ${filePath}`);
    if (!baseURL) {
        console.log(`⚠️ No baseURL provided, returning original path: ${filePath}`);
        return filePath;
    }
    // Detect if we're in development mode
    const isDevelopment = process_1.default.env.NODE_ENV === "development" ||
        baseURL.includes("localhost") ||
        baseURL.includes("127.0.0.1") ||
        baseURL.includes(":3000") ||
        baseURL.includes(":4000") ||
        baseURL.startsWith("http://localhost") ||
        baseURL.startsWith("https://localhost");
    console.log(`🛠️ Environment detection: ${isDevelopment ? "development" : "production"} (baseURL: ${baseURL})`);
    // Remove .md extension and convert to URL path
    let urlPath = filePath.replace(/\.mdx?$/, "");
    // Remove leading docs/ or src/pages/ prefixes
    urlPath = urlPath.replace(/^(docs\/|src\/pages\/)/, "");
    // Split path into segments to handle directories and filename separately
    const pathSegments = urlPath.split("/");
    // Process each segment
    const processedSegments = pathSegments.map((segment, index) => {
        // Remove numeric prefixes from both directories AND filenames (e.g., "1_operate" -> "operate", "4_relayminer_config" -> "relayminer_config")
        let processed = segment.replace(/^\d+_/, "");
        // Keep underscores as-is to match actual file URLs
        // processed = processed.replace(/_/g, "-");
        return processed;
    });
    urlPath = processedSegments.join("/");
    // Clean up any empty segments
    urlPath = urlPath.replace(/\/+/g, "/").replace(/^\//, "");
    // Build the final URL based on environment
    let finalURL;
    if (isDevelopment) {
        // For localhost development, always use http://localhost:4000 unless baseURL is already localhost
        let devBaseURL;
        if (baseURL.includes("localhost") || baseURL.includes("127.0.0.1")) {
            // If baseURL is already localhost, use it but ensure it uses port 4000
            devBaseURL = baseURL.replace(/:3000/, ":4000");
        }
        else {
            // Default to localhost:4000 for development
            devBaseURL = "http://localhost:4000";
        }
        const cleanBaseURL = devBaseURL.replace(/\/$/, "");
        finalURL = `${cleanBaseURL}/${urlPath}`;
    }
    else {
        // For production, use the provided baseURL
        const cleanBaseURL = baseURL.replace(/\/$/, "");
        finalURL = `${cleanBaseURL}/${urlPath}`;
    }
    console.log(`✅ Converted URL: ${filePath} -> ${finalURL}`);
    console.log(`📋 Path breakdown: ${JSON.stringify({
        original: filePath,
        segments: pathSegments,
        processed: processedSegments,
        final: urlPath,
        isDev: isDevelopment,
    })}`);
    return finalURL;
}
/**
 * Convert a flat list of file paths into a tree structure
 */
function pathsToTree(files, baseDir) {
    const root = [];
    const nodes = new Map();
    // Sort files to ensure parent directories are processed first
    const sortedFiles = [...files].sort();
    for (const file of sortedFiles) {
        // File is already relative to baseDir
        const parts = file.split(path.sep);
        let currentPath = "";
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            const fullPath = path.join(currentPath, part);
            const displayPath = file; // Use the original relative path for files
            if (!nodes.has(fullPath)) {
                // Get the actual file/directory name from the path
                const name = isFile
                    ? path.basename(part, path.extname(part)) // Remove extension for files
                    : part;
                const node = {
                    type: isFile ? "file" : "directory",
                    name: name,
                    path: isFile ? displayPath : fullPath,
                    children: isFile ? undefined : [],
                };
                nodes.set(fullPath, node);
                if (currentPath === "") {
                    root.push(node);
                }
                else {
                    const parent = nodes.get(currentPath);
                    parent?.children?.push(node);
                }
            }
            currentPath = fullPath;
        }
    }
    return root;
}
/**
 * Split text into chunks by headers with max size fallback
 */
function splitByHeaders(text, maxChunkSize = 1500) {
    const lines = text.split("\n");
    const chunks = [];
    let currentChunk = "";
    let currentSection = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isHeader = /^#{1,6}\s/.test(line);
        if (isHeader) {
            // Save current chunk before starting new section
            if (currentChunk.trim()) {
                chunks.push({
                    text: currentChunk.trim(),
                    section: currentSection || undefined,
                });
            }
            // Start new section
            currentSection = line.replace(/^#+\s/, "");
            currentChunk = line;
        }
        else {
            // Add line to current chunk
            currentChunk += (currentChunk ? "\n" : "") + line;
            // If chunk exceeds max size, save it and start new chunk in same section
            if (currentChunk.length > maxChunkSize) {
                chunks.push({
                    text: currentChunk.trim(),
                    section: currentSection || undefined,
                });
                currentChunk = "";
            }
        }
    }
    // Add final chunk
    if (currentChunk.trim()) {
        chunks.push({
            text: currentChunk.trim(),
            section: currentSection || undefined,
        });
    }
    return chunks;
}
/**
 * Split text into chunks intelligently based on strategy
 */
function splitIntoChunks(text, options = {}) {
    const { maxChunkSize = constants_1.DEFAULT_EMBEDDING_CONFIG.chunkSize, strategy = constants_1.DEFAULT_EMBEDDING_CONFIG.chunkingStrategy, } = options;
    if (strategy === "headers") {
        return splitByHeaders(text, maxChunkSize);
    }
    // Fallback to paragraph-based chunking
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";
    for (const paragraph of paragraphs) {
        // If adding this paragraph would exceed max size, save current chunk and start new one
        if (currentChunk && currentChunk.length + paragraph.length > maxChunkSize) {
            chunks.push({ text: currentChunk.trim() });
            currentChunk = "";
        }
        // If a single paragraph is too long, split it by sentences
        if (paragraph.length > maxChunkSize) {
            const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
            for (const sentence of sentences) {
                if (currentChunk.length + sentence.length > maxChunkSize) {
                    if (currentChunk)
                        chunks.push({ text: currentChunk.trim() });
                    currentChunk = sentence;
                }
                else {
                    currentChunk = currentChunk
                        ? `${currentChunk} ${sentence}`
                        : sentence;
                }
            }
        }
        else {
            // Add paragraph to current chunk
            currentChunk = currentChunk
                ? `${currentChunk}\n\n${paragraph}`
                : paragraph;
        }
    }
    // Add the last chunk if there is one
    if (currentChunk) {
        chunks.push({ text: currentChunk.trim() });
    }
    return chunks;
}
/**
 * Process markdown content into plain text and extract frontmatter
 */
async function processMarkdown(content) {
    try {
        if (!content || typeof content !== "string") {
            throw (0, errors_1.createError)(errors_1.ErrorType.VALIDATION, "Invalid markdown content: content must be a non-empty string", "File contains invalid content", { emoji: "📄❌" });
        }
        // Extract frontmatter using gray-matter
        const { data: frontmatter, content: markdownContent } = (0, gray_matter_1.default)(content);
        // Convert markdown to plain text
        const file = await (0, remark_1.remark)().use(strip_markdown_1.default).process(markdownContent);
        const plainText = String(file);
        if (!plainText.trim()) {
            console.warn("⚠️ Processed markdown resulted in empty content");
        }
        return {
            plainText: plainText.trim(),
            frontmatter,
        };
    }
    catch (error) {
        if (error instanceof errors_1.DocusaurusPluginError) {
            throw error;
        }
        throw (0, errors_1.createError)(errors_1.ErrorType.PARSING, `Failed to process markdown: ${error.message}`, "Unable to process markdown content", {
            emoji: "📝❌",
            details: error,
        });
    }
}
/**
 * Process a directory and build a tree structure
 */
async function processDirectory(dir) {
    console.log(`📁 Processing directory: ${dir}`);
    try {
        // Check if directory exists
        try {
            await fs.access(dir);
        }
        catch (error) {
            console.warn(`⚠️ Directory ${dir} does not exist, skipping...`);
            return [];
        }
        const files = glob_1.glob.sync(constants_1.FILE_PATTERNS.MARKDOWN, {
            cwd: dir,
            absolute: false,
        });
        console.log(`📄 Processing ${files.length} markdown files from ${dir}...`);
        const tree = pathsToTree(files, dir);
        let processedFiles = 0;
        const totalFiles = files.length;
        // Process each file node
        const processNode = async (node) => {
            if (node.type === "file") {
                const filePath = path.join(dir, node.path);
                try {
                    const content = await (0, errors_1.withRetry)(async () => {
                        return fs.readFile(filePath, "utf-8");
                    }, 2, 500);
                    const { plainText, frontmatter } = await processMarkdown(content);
                    node.content = {
                        metadata: frontmatter,
                        rawContent: plainText,
                    };
                    processedFiles++;
                    const progress = Math.round((processedFiles / totalFiles) * 100);
                    process_1.default.stdout.write(`\r✅ Progress: ${progress}% (${processedFiles}/${totalFiles} files)`);
                }
                catch (error) {
                    const pluginError = (0, errors_1.handleFileSystemError)(error, node.path);
                    console.error(`\n${pluginError.emoji} Error processing file ${node.path}:`, pluginError.message);
                    // Continue processing other files rather than failing completely
                }
            }
            // Process children recursively
            if (node.children) {
                await Promise.all(node.children.map(processNode));
            }
        };
        // Process all root nodes
        await Promise.all(tree.map(processNode));
        console.log(`\n✅ Directory processing complete! Processed ${processedFiles}/${totalFiles} files successfully.`);
        return tree;
    }
    catch (error) {
        const pluginError = (0, errors_1.handleFileSystemError)(error, dir);
        (0, errors_1.logError)(pluginError, "processDirectory");
        throw pluginError;
    }
}
exports.processDirectory = processDirectory;
/**
 * Convert a tree structure to a flat list of files with their content
 */
function treeToFlatList(nodes) {
    const results = [];
    function traverse(node) {
        if (node.type === "file" && node.content) {
            results.push({
                filePath: node.path,
                content: node.content.rawContent,
                metadata: node.content.metadata,
            });
        }
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    }
    nodes.forEach(traverse);
    return results;
}
/**
 * Generate embeddings for chunks in batches
 */
async function generateEmbeddings(chunks, openAIConfig, embeddingConfig = {}) {
    if (!chunks.length) {
        console.warn("⚠️ No chunks provided for embedding generation");
        return [];
    }
    if (!openAIConfig?.apiKey) {
        throw (0, errors_1.handleValidationError)("openAIConfig.apiKey", openAIConfig?.apiKey, "is required");
    }
    const batchSize = embeddingConfig.batchSize || constants_1.DEFAULT_EMBEDDING_CONFIG.batchSize;
    const model = embeddingConfig.model || constants_1.DEFAULT_EMBEDDING_CONFIG.model;
    const aiService = (0, ai_1.createAIService)(openAIConfig);
    const results = [];
    const totalChunks = chunks.length;
    let processedChunks = 0;
    console.log(`\n🔮 Generating embeddings for ${totalChunks} chunks using batch size of ${batchSize}`);
    console.log(`📊 Why batching? Each API call can process multiple chunks at once:`);
    console.log(`   • Batch size ${batchSize} = ${batchSize} chunks per API request`);
    console.log(`   • Total API calls needed: ${Math.ceil(totalChunks / batchSize)}`);
    console.log(`   • Reduces API overhead and improves speed`);
    console.log(`   • Larger batches = fewer API calls but more memory usage`);
    console.log(``);
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const texts = batch.map((chunk) => chunk.text);
        try {
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(totalChunks / batchSize);
            console.log(`🔮 API Call ${batchNumber}/${totalBatches}: Processing ${batch.length} chunks (${batch.length * 1500} chars avg)`);
            const embeddings = await aiService.generateEmbeddings(texts, { model });
            for (let j = 0; j < batch.length; j++) {
                results.push({
                    text: batch[j].text,
                    metadata: batch[j].metadata,
                    embedding: embeddings[j],
                });
            }
            processedChunks += batch.length;
            const progress = Math.round((processedChunks / totalChunks) * 100);
            const memoryUsage = Math.round(process_1.default.memoryUsage().heapUsed / 1024 / 1024);
            console.log(`✅ Batch ${batchNumber} complete: ${batch.length} embeddings generated`);
            process_1.default.stdout.write(`📊 Overall Progress: ${progress}% (${processedChunks}/${totalChunks} chunks) - Memory: ${memoryUsage}MB\n`);
            // Clear temporary arrays to help with garbage collection
            batch.length = 0;
            texts.length = 0;
            // Add a small delay between batches
            await new Promise((resolve) => setTimeout(resolve, constants_1.CHAT_DEFAULTS.PROGRESS_UPDATE_DELAY));
        }
        catch (error) {
            console.error(`\n🔥❌ Error processing batch starting at chunk ${i}:`, error);
            // Don't throw immediately - let the AI service error handling take care of retries
            throw error;
        }
    }
    console.log(`\n✅ Embeddings generation complete! Generated ${results.length} embeddings.`);
    return results;
}
async function loadContent(context) {
    const { siteDir, options } = context;
    const embeddingCache = {
        ...constants_1.DEFAULT_EMBEDDING_CACHE_CONFIG,
        ...options?.embeddingCache,
    };
    const embeddingConfig = {
        ...constants_1.DEFAULT_EMBEDDING_CONFIG,
        ...options?.embedding,
    };
    const baseURL = options?.baseURL;
    const cachePath = embeddingCache.path || "embeddings.json";
    // Use target site root directory for single source of truth
    const cacheFullPath = path.join(siteDir, cachePath);
    if (!options?.openai?.apiKey) {
        throw (0, errors_1.handleValidationError)("openai.apiKey", options?.openai?.apiKey, "is required. Please add it to your docusaurus.config.js");
    }
    console.log("\n=== 🔥 Starting content processing 🔥 ===");
    console.log(`[CACHE] Mode: ${embeddingCache.mode}`);
    console.log(`[CACHE] Path: ${cacheFullPath}`);
    console.log("");
    const docsDir = path.join(siteDir, "docs");
    const pagesDir = path.join(siteDir, "src/pages");
    // Get the tree structures
    const [docsTree, pagesTree] = await Promise.all([
        processDirectory(docsDir),
        processDirectory(pagesDir),
    ]);
    // Convert trees to flat lists and combine
    const allFiles = [...treeToFlatList(docsTree), ...treeToFlatList(pagesTree)];
    console.log(`\n📖 Found ${allFiles.length} total files to process`);
    // --- Simplified Cache Logic ---
    let cacheValid = false;
    let cacheData = undefined;
    console.log(`\n[CACHE] Mode: ${embeddingCache.mode}`);
    console.log(`[CACHE] Path: ${cacheFullPath}`);
    if (embeddingCache.mode === "use") {
        try {
            console.log(`[CACHE] Reading existing cache file...`);
            const cacheRaw = await fs.readFile(cacheFullPath, "utf-8");
            const cacheJson = JSON.parse(cacheRaw);
            if (cacheJson.chunks && Array.isArray(cacheJson.chunks) && cacheJson.metadata) {
                cacheValid = true;
                cacheData = cacheJson;
                console.log(`✅ [CACHE] Using existing cache with ${cacheJson.chunks.length} chunks`);
            }
            else {
                throw new Error("Invalid cache format");
            }
        }
        catch (e) {
            throw (0, errors_1.createError)(errors_1.ErrorType.FILE_SYSTEM, `Cache file not found or invalid at ${cacheFullPath}`, "Mode 'use' requires a valid existing cache file. Set mode to 'auto' to regenerate.", {
                emoji: "📋❌",
                retryable: false,
            });
        }
    }
    if (cacheValid && cacheData) {
        console.log(`🎯 [CACHE] Using cached embeddings, skipping generation`);
        return cacheData;
    }
    console.log(`🔄 [CACHE] Regenerating embeddings (mode: ${embeddingCache.mode})`);
    // --- End Cache Logic ---
    // Process each file into chunks with metadata
    console.log("\n📖 Splitting content into chunks...\n");
    let processedForChunking = 0;
    const totalForChunking = allFiles.length;
    const MAX_CHUNKS_PER_FILE = embeddingConfig.maxChunksPerFile;
    const allChunks = [];
    // Track statistics for enhanced metadata
    const fileStats = new Map();
    // Process files sequentially instead of using flatMap
    for (const file of allFiles) {
        const fileContent = file.content;
        const originalBytes = Buffer.byteLength(fileContent, "utf8");
        const wordCount = fileContent
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
        const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed
        const textChunks = splitIntoChunks(fileContent, {
            maxChunkSize: embeddingConfig.chunkSize,
            strategy: embeddingConfig.chunkingStrategy,
        });
        const limitedChunks = textChunks.length > MAX_CHUNKS_PER_FILE
            ? textChunks.slice(0, MAX_CHUNKS_PER_FILE)
            : textChunks;
        // Calculate processed bytes (sum of all chunk text lengths)
        const processedBytes = limitedChunks.reduce((sum, chunk) => {
            const chunkText = typeof chunk === "string" ? chunk : chunk.text;
            return sum + Buffer.byteLength(chunkText, "utf8");
        }, 0);
        const averageChunkSize = limitedChunks.length > 0 ? processedBytes / limitedChunks.length : 0;
        // Store file statistics
        fileStats.set(file.filePath, {
            originalBytes,
            processedBytes,
            totalChunks: limitedChunks.length,
            wordCount,
            readingTimeMinutes,
            averageChunkSize: Math.round(averageChunkSize),
        });
        // Add chunks for this file with enhanced metadata
        for (let index = 0; index < limitedChunks.length; index++) {
            const chunk = limitedChunks[index];
            const chunkText = typeof chunk === "string" ? chunk : chunk.text;
            const chunkBytes = Buffer.byteLength(chunkText, "utf8");
            const chunkWords = chunkText
                .split(/\s+/)
                .filter((word) => word.length > 0).length;
            allChunks.push({
                text: chunkText,
                metadata: {
                    ...file.metadata,
                    filePath: file.filePath,
                    fileURL: filePathToURL(file.filePath, baseURL, context),
                    title: file.metadata.title,
                    section: typeof chunk === "object" ? chunk.section : undefined,
                    position: index,
                    // 🔥 Enhanced file-level metadata
                    fileStats: {
                        fileSizeBytes: originalBytes,
                        fileSizeKB: Math.round((originalBytes / 1024) * 100) / 100,
                        totalChunksInFile: limitedChunks.length,
                        totalEmbeddingsInFile: limitedChunks.length,
                        fileWordCount: wordCount,
                        estimatedReadingTimeMinutes: readingTimeMinutes,
                        averageChunkSizeBytes: Math.round(averageChunkSize),
                        compressionRatio: Math.round((processedBytes / originalBytes) * 100), // % of original content preserved
                    },
                    // 🔥 Enhanced chunk-level metadata
                    chunkStats: {
                        chunkIndex: index + 1,
                        chunkSizeBytes: chunkBytes,
                        chunkSizeKB: Math.round((chunkBytes / 1024) * 100) / 100,
                        chunkWordCount: chunkWords,
                        chunkReadingTimeSeconds: Math.max(5, Math.ceil(chunkWords / 3.33)),
                        isLargeChunk: chunkBytes > embeddingConfig.chunkSize * 0.8,
                        chunkType: typeof chunk === "object" && chunk.section
                            ? "section"
                            : "content",
                    },
                    // 🔥 Processing metadata
                    processingStats: {
                        processedAt: new Date().toISOString(),
                        chunkingStrategy: embeddingConfig.chunkingStrategy,
                        maxChunkSize: embeddingConfig.chunkSize,
                        embeddingModel: embeddingConfig.model,
                        wasTruncated: textChunks.length > limitedChunks.length,
                        originalChunkCount: textChunks.length,
                    },
                },
            });
        }
        processedForChunking++;
        const progress = Math.round((processedForChunking / totalForChunking) * 100);
        const memoryUsage = Math.round(process_1.default.memoryUsage().heapUsed / 1024 / 1024);
        // Enhanced progress reporting
        const fileSize = Math.round((originalBytes / 1024) * 100) / 100;
        process_1.default.stdout.write(`\r📖 Progress: ${progress}% (${processedForChunking}/${totalForChunking} files) | ` +
            `📄 ${file.filePath.split("/").pop()} (${fileSize}KB → ${limitedChunks.length} chunks) | ` +
            `💾 Memory: ${memoryUsage}MB`);
        // Clear the temporary arrays to help with garbage collection
        textChunks.length = 0;
        limitedChunks.length = 0;
    }
    console.log(`\n📖 Content splitting complete! Generated ${allChunks.length} total chunks`);
    // 🔥 Calculate and display comprehensive statistics
    const totalOriginalBytes = Array.from(fileStats.values()).reduce((sum, stats) => sum + stats.originalBytes, 0);
    const totalProcessedBytes = Array.from(fileStats.values()).reduce((sum, stats) => sum + stats.processedBytes, 0);
    const totalWords = Array.from(fileStats.values()).reduce((sum, stats) => sum + stats.wordCount, 0);
    const totalReadingTime = Array.from(fileStats.values()).reduce((sum, stats) => sum + stats.readingTimeMinutes, 0);
    const averageChunksPerFile = allChunks.length / allFiles.length;
    const largestFile = Math.max(...Array.from(fileStats.values()).map((s) => s.originalBytes));
    const smallestFile = Math.min(...Array.from(fileStats.values()).map((s) => s.originalBytes));
    console.log(`\n🔥 COMPREHENSIVE PROCESSING STATISTICS:`);
    console.log(`📁 Total Files: ${allFiles.length}`);
    console.log(`📦 Total Chunks: ${allChunks.length}`);
    console.log(`📊 Average Chunks/File: ${Math.round(averageChunksPerFile * 100) / 100}`);
    console.log(`📏 Total Content: ${Math.round(totalOriginalBytes / 1024)} KB (${totalWords.toLocaleString()} words)`);
    console.log(`⚡ Processed Content: ${Math.round(totalProcessedBytes / 1024)} KB`);
    console.log(`📖 Total Reading Time: ${totalReadingTime} minutes`);
    console.log(`📈 File Size Range: ${Math.round((smallestFile / 1024) * 100) / 100}KB - ${Math.round((largestFile / 1024) * 100) / 100}KB`);
    console.log(`🗜️ Compression Ratio: ${Math.round((totalProcessedBytes / totalOriginalBytes) * 100)}%`);
    console.log(`\n🔥 SAMPLE ENHANCED METADATA:`);
    const sampleMetadata = allChunks[0]?.metadata;
    if (sampleMetadata) {
        console.log(`📄 File: ${sampleMetadata.filePath}`);
        console.log(`🔗 URL: ${sampleMetadata.fileURL}`);
        console.log(`📊 File Stats:`, JSON.stringify(sampleMetadata.fileStats, null, 2));
        console.log(`📦 Chunk Stats:`, JSON.stringify(sampleMetadata.chunkStats, null, 2));
        console.log(`⚙️ Processing Stats:`, JSON.stringify(sampleMetadata.processingStats, null, 2));
    }
    // Generate embeddings for all chunks
    console.log(`\n🔥 About to start generating embeddings for ${allChunks.length} chunks`);
    const chunksWithEmbeddings = await generateEmbeddings(allChunks, options.openai, embeddingConfig);
    console.log(`\n🔥 EMBEDDINGS GENERATED - Sample result:`);
    console.log(`🔥 First chunk metadata:`, JSON.stringify(chunksWithEmbeddings[0]?.metadata, null, 2));
    console.log(`🔥 First chunk has fileURL:`, !!chunksWithEmbeddings[0]?.metadata?.fileURL);
    // Compute content hash for cache metadata
    const hash = crypto.createHash("sha256");
    for (const file of allFiles) {
        hash.update(file.content);
    }
    const contentHash = hash.digest("hex");
    console.log(`\n[CACHE] Generated contentHash ${contentHash} for metadata.`);
    const result = {
        chunks: chunksWithEmbeddings,
        metadata: {
            totalChunks: chunksWithEmbeddings.length,
            lastUpdated: new Date().toISOString(),
            ...(contentHash ? { contentHash } : {}),
            // 🔥 Enhanced global statistics
            globalStats: {
                totalFiles: allFiles.length,
                totalOriginalBytes: totalOriginalBytes,
                totalOriginalKB: Math.round((totalOriginalBytes / 1024) * 100) / 100,
                totalProcessedBytes: totalProcessedBytes,
                totalProcessedKB: Math.round((totalProcessedBytes / 1024) * 100) / 100,
                totalWords: totalWords,
                totalReadingTimeMinutes: totalReadingTime,
                averageChunksPerFile: Math.round(averageChunksPerFile * 100) / 100,
                compressionRatio: Math.round((totalProcessedBytes / totalOriginalBytes) * 100),
                largestFileBytes: largestFile,
                smallestFileBytes: smallestFile,
                processingTimeSeconds: Math.round((Date.now() - Date.parse(new Date().toISOString())) / 1000),
                embeddingModel: embeddingConfig.model,
                chunkingStrategy: embeddingConfig.chunkingStrategy,
                maxChunkSize: embeddingConfig.chunkSize,
                actualMaxChunkSize: Math.max(...chunksWithEmbeddings.map((c) => Buffer.byteLength(c.text, "utf8"))),
                actualMinChunkSize: Math.min(...chunksWithEmbeddings.map((c) => Buffer.byteLength(c.text, "utf8"))),
            },
            // 🔥 Per-file breakdown for advanced analytics
            fileBreakdown: Array.from(fileStats.entries()).map(([filePath, stats]) => ({
                filePath,
                fileURL: filePathToURL(filePath, baseURL, context),
                ...stats,
            })),
        },
    };
    console.log(`\n🔥 FINAL RESULT CREATED`);
    console.log(`🔥 Total chunks in result: ${result.chunks.length}`);
    console.log(`🔥 Sample chunk from result:`, JSON.stringify(result.chunks[0]?.metadata, null, 2));
    // Write cache (except in 'skip' mode)
    console.log(`\n📝 PREPARING TO WRITE CACHE TO: ${cacheFullPath}`);
    console.log(`📝 Cache mode: ${embeddingCache.mode}`);
    if (embeddingCache.mode !== "skip") {
        try {
            console.log(`📝 Creating directory: ${path.dirname(cacheFullPath)}`);
            await fs.mkdir(path.dirname(cacheFullPath), { recursive: true });
            console.log(`📝 Writing cache file to: ${cacheFullPath}`);
            await fs.writeFile(cacheFullPath, JSON.stringify(result, null, 2), "utf-8");
            console.log(`\n✅ CACHE SUCCESSFULLY WRITTEN TO: ${cacheFullPath}`);
            console.log(`✅ Cache file size: ${JSON.stringify(result).length} characters`);
            console.log(`✅ First chunk in cache has fileURL: ${!!result.chunks[0]?.metadata?.fileURL}`);
            // Verify file exists
            const stats = await fs.stat(cacheFullPath);
            console.log(`✅ Cache file confirmed - size: ${stats.size} bytes`);
        }
        catch (e) {
            const cacheError = (0, errors_1.handleFileSystemError)(e, cacheFullPath);
            console.error(`❌ FAILED TO WRITE CACHE TO: ${cacheFullPath}`);
            console.error(`❌ Error: ${cacheError.message}`);
            // Don't throw - cache write failure shouldn't break the build
        }
    }
    else {
        console.log(`⚠️ Cache writing DISABLED (mode: skip)`);
    }
    console.log("\n=== 🔥Content processing complete 🔥 ===");
    console.log(`🔍 Total files processed: ${allFiles.length}`);
    console.log(`🔍 Total chunks generated: ${allChunks.length}`);
    console.log(`🔍 Total embeddings created: ${chunksWithEmbeddings.length}`);
    console.log("\n=== 🔥Content processing complete 🔥 ===");
    return result;
}
exports.loadContent = loadContent;
//# sourceMappingURL=content.js.map