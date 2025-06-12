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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const gray_matter_1 = __importDefault(require("gray-matter"));
const remark_1 = require("remark");
const strip_markdown_1 = __importDefault(require("strip-markdown"));
const process_1 = __importDefault(require("process"));
const ai_1 = require("./services/ai");
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
 * Split text into chunks intelligently, trying to break at paragraph boundaries
 */
function splitIntoChunks(text, maxChunkSize = 1500) {
    // Split into paragraphs first
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";
    for (const paragraph of paragraphs) {
        // If adding this paragraph would exceed max size, save current chunk and start new one
        if (currentChunk && currentChunk.length + paragraph.length > maxChunkSize) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
        // If a single paragraph is too long, split it by sentences
        if (paragraph.length > maxChunkSize) {
            const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
            for (const sentence of sentences) {
                if (currentChunk.length + sentence.length > maxChunkSize) {
                    if (currentChunk)
                        chunks.push(currentChunk.trim());
                    currentChunk = sentence;
                }
                else {
                    currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
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
        chunks.push(currentChunk.trim());
    }
    return chunks;
}
/**
 * Process markdown content into plain text and extract frontmatter
 */
async function processMarkdown(content) {
    // Extract frontmatter using gray-matter
    const { data: frontmatter, content: markdownContent } = (0, gray_matter_1.default)(content);
    // Convert markdown to plain text
    const file = await (0, remark_1.remark)().use(strip_markdown_1.default).process(markdownContent);
    const plainText = String(file);
    return {
        plainText: plainText.trim(),
        frontmatter,
    };
}
/**
 * Process a directory and build a tree structure
 */
async function processDirectory(dir) {
    try {
        const files = glob_1.glob.sync("**/*.{md,mdx}", {
            cwd: dir,
            absolute: false,
        });
        console.log(`\nProcessing ${files.length} markdown files from ${dir}...`);
        const tree = pathsToTree(files, dir);
        let processedFiles = 0;
        const totalFiles = files.length;
        // Process each file node
        const processNode = async (node) => {
            if (node.type === "file") {
                try {
                    const content = await fs.readFile(path.join(dir, node.path), "utf-8");
                    const { plainText, frontmatter } = await processMarkdown(content);
                    node.content = {
                        metadata: frontmatter,
                        rawContent: plainText,
                    };
                    processedFiles++;
                    const progress = Math.round((processedFiles / totalFiles) * 100);
                    process_1.default.stdout.write(`\rProgress: ${progress}% (${processedFiles}/${totalFiles} files)`);
                }
                catch (error) {
                    console.error(`\nError processing file ${node.path}:`, error);
                }
            }
            // Process children recursively
            if (node.children) {
                await Promise.all(node.children.map(processNode));
            }
        };
        // Process all root nodes
        await Promise.all(tree.map(processNode));
        console.log("\nFile processing complete!");
        return tree;
    }
    catch (error) {
        console.error("Error in processDirectory:", error);
        throw error;
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
async function generateEmbeddings(chunks, openAIConfig, batchSize = 10) {
    const aiService = (0, ai_1.createAIService)(openAIConfig);
    const results = [];
    const totalChunks = chunks.length;
    let processedChunks = 0;
    console.log(`\nGenerating embeddings for ${totalChunks} chunks in batches of ${batchSize}...`);
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const texts = batch.map((chunk) => chunk.text);
        try {
            const embeddings = await aiService.generateEmbeddings(texts);
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
            process_1.default.stdout.write(`\rProgress: ${progress}% (${processedChunks}/${totalChunks} chunks) - Memory: ${memoryUsage}MB`);
            // Clear temporary arrays to help with garbage collection
            batch.length = 0;
            texts.length = 0;
            // Add a small delay between batches
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        catch (error) {
            console.error(`\nError processing batch starting at chunk ${i}:`, error);
            throw error;
        }
    }
    console.log("\nEmbeddings generation complete!");
    return results;
}
const crypto = __importStar(require("crypto"));
async function loadContent(context) {
    const { siteDir, options } = context;
    const embeddingCache = options?.embeddingCache || { enabled: true, strategy: "hash", path: "embeddings.json" };
    const cachePath = embeddingCache.path || "embeddings.json";
    const cacheFullPath = path.join(siteDir, ".docusaurus", cachePath);
    if (!options?.openai?.apiKey) {
        throw new Error("OpenAI API key is required. Please add it to your docusaurus.config.js");
    }
    console.log("\n=== Starting content processing ===");
    const docsDir = path.join(siteDir, "docs");
    const pagesDir = path.join(siteDir, "src/pages");
    // Get the tree structures
    const [docsTree, pagesTree] = await Promise.all([
        processDirectory(docsDir),
        processDirectory(pagesDir),
    ]);
    // Convert trees to flat lists and combine
    const allFiles = [...treeToFlatList(docsTree), ...treeToFlatList(pagesTree)];
    console.log(`\nFound ${allFiles.length} total files to process`);
    // --- Embedding Cache Logic ---
    let cacheValid = false;
    let cacheData = undefined;
    if (embeddingCache.enabled) {
        try {
            const cacheRaw = await fs.readFile(cacheFullPath, "utf-8");
            const cacheJson = JSON.parse(cacheRaw);
            if (embeddingCache.strategy === "manual") {
                // Always use cache if present, never regenerate
                cacheValid = true;
                cacheData = cacheJson;
                console.log("\n[Embedding Cache] MANUAL strategy: Using cache and skipping embedding generation.");
            }
            else if (embeddingCache.strategy === "hash") {
                // Compute hash of all file contents
                const hash = crypto.createHash("sha256");
                for (const file of allFiles) {
                    hash.update(file.content);
                }
                const contentHash = hash.digest("hex");
                if (cacheJson.metadata?.contentHash === contentHash) {
                    cacheValid = true;
                    cacheData = cacheJson;
                    console.log("\n[Embedding Cache] Valid cache found. Skipping embedding generation.");
                }
            }
            else if (embeddingCache.strategy === "timestamp") {
                // Compare timestamps (not implemented, fallback to hash)
                cacheValid = false;
            }
        }
        catch (e) {
            if (embeddingCache.strategy === "manual") {
                throw new Error(`[Embedding Cache] MANUAL strategy: Cache file not found at ${cacheFullPath}. Please generate embeddings manually.`);
            }
            // Cache file does not exist or is invalid for other strategies
            cacheValid = false;
        }
    }
    if (cacheValid && cacheData) {
        return cacheData;
    }
    // --- End Embedding Cache Logic ---
    // Process each file into chunks with metadata
    console.log("\nSplitting content into chunks...");
    let processedForChunking = 0;
    const totalForChunking = allFiles.length;
    const MAX_CHUNKS_PER_FILE = 10;
    const allChunks = [];
    // Process files sequentially instead of using flatMap
    for (const file of allFiles) {
        const textChunks = splitIntoChunks(file.content);
        const limitedChunks = textChunks.length > MAX_CHUNKS_PER_FILE
            ? textChunks.slice(0, MAX_CHUNKS_PER_FILE)
            : textChunks;
        // Add chunks for this file with metadata
        for (let index = 0; index < limitedChunks.length; index++) {
            allChunks.push({
                text: limitedChunks[index],
                metadata: {
                    ...file.metadata,
                    filePath: file.filePath,
                    position: index,
                },
            });
        }
        processedForChunking++;
        const progress = Math.round((processedForChunking / totalForChunking) * 100);
        const memoryUsage = Math.round(process_1.default.memoryUsage().heapUsed / 1024 / 1024);
        process_1.default.stdout.write(`\rProgress: ${progress}% (${processedForChunking}/${totalForChunking} files chunked) - Memory: ${memoryUsage}MB`);
        // Clear the temporary arrays to help with garbage collection
        textChunks.length = 0;
        limitedChunks.length = 0;
    }
    console.log(`\nContent splitting complete! Generated ${allChunks.length} total chunks`);
    // Generate embeddings for all chunks
    const chunksWithEmbeddings = await generateEmbeddings(allChunks, options.openai, 10);
    // Compute content hash for cache
    let contentHash = "";
    if (embeddingCache.strategy === "hash") {
        const hash = crypto.createHash("sha256");
        for (const file of allFiles) {
            hash.update(file.content);
        }
        contentHash = hash.digest("hex");
    }
    const result = {
        chunks: chunksWithEmbeddings,
        metadata: {
            totalChunks: chunksWithEmbeddings.length,
            lastUpdated: new Date().toISOString(),
            ...(contentHash ? { contentHash } : {}),
        },
    };
    // Write cache
    if (embeddingCache.enabled) {
        try {
            await fs.mkdir(path.dirname(cacheFullPath), { recursive: true });
            await fs.writeFile(cacheFullPath, JSON.stringify(result, null, 2), "utf-8");
            console.log(`\n[Embedding Cache] Cache updated at ${cacheFullPath}`);
        }
        catch (e) {
            console.warn("[Embedding Cache] Failed to write cache:", e);
        }
    }
    console.log("\n=== Content processing complete! ===");
    console.log(`Total files processed: ${allFiles.length}`);
    console.log(`Total chunks generated: ${allChunks.length}`);
    console.log(`Total embeddings created: ${chunksWithEmbeddings.length}`);
    return result;
}
exports.loadContent = loadContent;
//# sourceMappingURL=content.js.map