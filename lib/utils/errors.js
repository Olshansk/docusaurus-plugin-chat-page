"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = exports.formatUserError = exports.logError = exports.handleValidationError = exports.handleFileSystemError = exports.handleOpenAIError = exports.createError = exports.DocusaurusPluginError = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK"] = "NETWORK";
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorType["VALIDATION"] = "VALIDATION";
    ErrorType["RATE_LIMIT"] = "RATE_LIMIT";
    ErrorType["FILE_SYSTEM"] = "FILE_SYSTEM";
    ErrorType["PARSING"] = "PARSING";
    ErrorType["UNKNOWN"] = "UNKNOWN";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
class DocusaurusPluginError extends Error {
    constructor(error) {
        super(error.message);
        this.name = "DocusaurusPluginError";
        this.type = error.type;
        this.userMessage = error.userMessage;
        this.emoji = error.emoji;
        this.code = error.code;
        this.details = error.details;
        this.retryable = error.retryable;
    }
}
exports.DocusaurusPluginError = DocusaurusPluginError;
function createError(type, message, userMessage, options = {}) {
    const defaultEmojis = {
        [ErrorType.NETWORK]: "🌐❌",
        [ErrorType.AUTHENTICATION]: "🔐❌",
        [ErrorType.VALIDATION]: "⚠️❌",
        [ErrorType.RATE_LIMIT]: "⏱️❌",
        [ErrorType.FILE_SYSTEM]: "📁❌",
        [ErrorType.PARSING]: "📄❌",
        [ErrorType.UNKNOWN]: "❓❌",
    };
    return new DocusaurusPluginError({
        type,
        message,
        userMessage,
        emoji: options.emoji || defaultEmojis[type],
        code: options.code,
        details: options.details,
        retryable: options.retryable ?? false,
    });
}
exports.createError = createError;
function handleOpenAIError(error) {
    console.error("🔥❌ OpenAI API Error:", error);
    if (error?.code === "invalid_api_key" || error?.status === 401) {
        return createError(ErrorType.AUTHENTICATION, `OpenAI API key invalid: ${error.message}`, "Invalid OpenAI API key. Please check your configuration.", {
            emoji: "🔑❌",
            code: error.code,
            retryable: false,
        });
    }
    if (error?.status === 429 || error?.code === "rate_limit_exceeded") {
        return createError(ErrorType.RATE_LIMIT, `OpenAI rate limit exceeded: ${error.message}`, "OpenAI API rate limit reached. Please wait a moment and try again.", {
            emoji: "🚫⏱️",
            code: error.code,
            retryable: true,
        });
    }
    if (error?.status >= 500) {
        return createError(ErrorType.NETWORK, `OpenAI server error: ${error.message}`, "OpenAI service is temporarily unavailable. Please try again later.", {
            emoji: "🌐💥",
            code: error.code,
            retryable: true,
        });
    }
    if (!navigator.onLine) {
        return createError(ErrorType.NETWORK, "Network connection lost", "No internet connection. Please check your network and try again.", {
            emoji: "📡❌",
            retryable: true,
        });
    }
    return createError(ErrorType.UNKNOWN, `Unexpected OpenAI error: ${error.message || error}`, "Something went wrong with the AI service. Please try again.", {
        emoji: "🤖💥",
        details: error,
        retryable: true,
    });
}
exports.handleOpenAIError = handleOpenAIError;
function handleFileSystemError(error, filePath) {
    console.error("📁❌ File System Error:", error, filePath ? `(${filePath})` : "");
    if (error.code === "ENOENT") {
        return createError(ErrorType.FILE_SYSTEM, `File not found: ${filePath || "unknown file"}`, `Required file is missing: ${filePath || "unknown file"}`, {
            emoji: "📄❌",
            code: error.code,
            retryable: false,
        });
    }
    if (error.code === "EACCES" || error.code === "EPERM") {
        return createError(ErrorType.FILE_SYSTEM, `Permission denied: ${filePath || "unknown file"}`, `Cannot access file due to permissions: ${filePath || "unknown file"}`, {
            emoji: "🔒❌",
            code: error.code,
            retryable: false,
        });
    }
    if (error.code === "ENOSPC") {
        return createError(ErrorType.FILE_SYSTEM, "No space left on device", "Disk is full. Please free up some space and try again.", {
            emoji: "💾❌",
            code: error.code,
            retryable: false,
        });
    }
    return createError(ErrorType.FILE_SYSTEM, `File system error: ${error.message}`, `Problem accessing files. Please check file permissions and disk space.`, {
        emoji: "📁💥",
        details: error,
        retryable: false,
    });
}
exports.handleFileSystemError = handleFileSystemError;
function handleValidationError(field, value, requirement) {
    console.error("⚠️❌ Validation Error:", { field, value, requirement });
    return createError(ErrorType.VALIDATION, `Validation failed for ${field}: ${requirement}`, `Configuration error: ${field} ${requirement}`, {
        emoji: "⚙️❌",
        details: { field, value, requirement },
        retryable: false,
    });
}
exports.handleValidationError = handleValidationError;
function logError(error, context) {
    const prefix = context ? `[${context}]` : "";
    if (error instanceof DocusaurusPluginError) {
        console.error(`${error.emoji} ${prefix} ${error.message}`);
        if (error.details) {
            console.error("📋 Error details:", error.details);
        }
    }
    else {
        console.error(`❌ ${prefix} Unexpected error:`, error);
    }
}
exports.logError = logError;
function formatUserError(error) {
    if (error instanceof DocusaurusPluginError) {
        return `${error.emoji} ${error.userMessage}`;
    }
    return `❌ An unexpected error occurred. Please try again.`;
}
exports.formatUserError = formatUserError;
async function withRetry(operation, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (error instanceof DocusaurusPluginError && !error.retryable) {
                console.error(`🚫 Non-retryable error, stopping attempts:`, error.emoji, error.message);
                throw error;
            }
            if (attempt === maxRetries) {
                console.error(`💥 All ${maxRetries} attempts failed`);
                break;
            }
            const delay = delayMs * attempt; // Exponential backoff
            console.warn(`⏳ Attempt ${attempt} failed, retrying in ${delay}ms...`, error?.message || error);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
exports.withRetry = withRetry;
//# sourceMappingURL=errors.js.map