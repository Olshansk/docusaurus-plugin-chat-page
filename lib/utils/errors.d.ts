export declare enum ErrorType {
    NETWORK = "NETWORK",
    AUTHENTICATION = "AUTHENTICATION",
    VALIDATION = "VALIDATION",
    RATE_LIMIT = "RATE_LIMIT",
    FILE_SYSTEM = "FILE_SYSTEM",
    PARSING = "PARSING",
    UNKNOWN = "UNKNOWN"
}
export interface AppError {
    type: ErrorType;
    message: string;
    userMessage: string;
    emoji: string;
    code?: string;
    details?: any;
    retryable: boolean;
}
export declare class DocusaurusPluginError extends Error {
    readonly type: ErrorType;
    readonly userMessage: string;
    readonly emoji: string;
    readonly code?: string;
    readonly details?: any;
    readonly retryable: boolean;
    constructor(error: AppError);
}
export declare function createError(type: ErrorType, message: string, userMessage: string, options?: {
    emoji?: string;
    code?: string;
    details?: any;
    retryable?: boolean;
}): DocusaurusPluginError;
export declare function handleOpenAIError(error: any): DocusaurusPluginError;
export declare function handleFileSystemError(error: any, filePath?: string): DocusaurusPluginError;
export declare function handleValidationError(field: string, value: any, requirement: string): DocusaurusPluginError;
export declare function logError(error: DocusaurusPluginError | Error, context?: string): void;
export declare function formatUserError(error: DocusaurusPluginError | Error): string;
export declare function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, delayMs?: number): Promise<T>;
