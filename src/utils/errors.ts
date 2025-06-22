export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  VALIDATION = "VALIDATION",
  RATE_LIMIT = "RATE_LIMIT",
  FILE_SYSTEM = "FILE_SYSTEM",
  PARSING = "PARSING",
  UNKNOWN = "UNKNOWN",
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

export class DocusaurusPluginError extends Error {
  public readonly type: ErrorType;
  public readonly userMessage: string;
  public readonly emoji: string;
  public readonly code?: string;
  public readonly details?: any;
  public readonly retryable: boolean;

  constructor(error: AppError) {
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

export function createError(type: ErrorType, message: string, userMessage: string, options: {
  emoji?: string;
  code?: string;
  details?: any;
  retryable?: boolean;
} = {}): DocusaurusPluginError {
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

export function handleOpenAIError(error: any): DocusaurusPluginError {
  console.error("🔥❌ OpenAI API Error:", error);

  if (error?.code === "invalid_api_key" || error?.status === 401) {
    return createError(
      ErrorType.AUTHENTICATION,
      `OpenAI API key invalid: ${error.message}`,
      "Invalid OpenAI API key. Please check your configuration.",
      { 
        emoji: "🔑❌",
        code: error.code,
        retryable: false 
      }
    );
  }

  if (error?.status === 429 || error?.code === "rate_limit_exceeded") {
    return createError(
      ErrorType.RATE_LIMIT,
      `OpenAI rate limit exceeded: ${error.message}`,
      "OpenAI API rate limit reached. Please wait a moment and try again.",
      { 
        emoji: "🚫⏱️",
        code: error.code,
        retryable: true 
      }
    );
  }

  if (error?.status >= 500) {
    return createError(
      ErrorType.NETWORK,
      `OpenAI server error: ${error.message}`,
      "OpenAI service is temporarily unavailable. Please try again later.",
      { 
        emoji: "🌐💥",
        code: error.code,
        retryable: true 
      }
    );
  }

  if (!navigator.onLine) {
    return createError(
      ErrorType.NETWORK,
      "Network connection lost",
      "No internet connection. Please check your network and try again.",
      { 
        emoji: "📡❌",
        retryable: true 
      }
    );
  }

  return createError(
    ErrorType.UNKNOWN,
    `Unexpected OpenAI error: ${error.message || error}`,
    "Something went wrong with the AI service. Please try again.",
    { 
      emoji: "🤖💥",
      details: error,
      retryable: true 
    }
  );
}

export function handleFileSystemError(error: any, filePath?: string): DocusaurusPluginError {
  console.error("📁❌ File System Error:", error, filePath ? `(${filePath})` : "");

  if (error.code === "ENOENT") {
    return createError(
      ErrorType.FILE_SYSTEM,
      `File not found: ${filePath || "unknown file"}`,
      `Required file is missing: ${filePath || "unknown file"}`,
      { 
        emoji: "📄❌",
        code: error.code,
        retryable: false 
      }
    );
  }

  if (error.code === "EACCES" || error.code === "EPERM") {
    return createError(
      ErrorType.FILE_SYSTEM,
      `Permission denied: ${filePath || "unknown file"}`,
      `Cannot access file due to permissions: ${filePath || "unknown file"}`,
      { 
        emoji: "🔒❌",
        code: error.code,
        retryable: false 
      }
    );
  }

  if (error.code === "ENOSPC") {
    return createError(
      ErrorType.FILE_SYSTEM,
      "No space left on device",
      "Disk is full. Please free up some space and try again.",
      { 
        emoji: "💾❌",
        code: error.code,
        retryable: false 
      }
    );
  }

  return createError(
    ErrorType.FILE_SYSTEM,
    `File system error: ${error.message}`,
    `Problem accessing files. Please check file permissions and disk space.`,
    { 
      emoji: "📁💥",
      details: error,
      retryable: false 
    }
  );
}

export function handleValidationError(field: string, value: any, requirement: string): DocusaurusPluginError {
  console.error("⚠️❌ Validation Error:", { field, value, requirement });

  return createError(
    ErrorType.VALIDATION,
    `Validation failed for ${field}: ${requirement}`,
    `Configuration error: ${field} ${requirement}`,
    { 
      emoji: "⚙️❌",
      details: { field, value, requirement },
      retryable: false 
    }
  );
}

export function logError(error: DocusaurusPluginError | Error, context?: string): void {
  const prefix = context ? `[${context}]` : "";
  
  if (error instanceof DocusaurusPluginError) {
    console.error(`${error.emoji} ${prefix} ${error.message}`);
    if (error.details) {
      console.error("📋 Error details:", error.details);
    }
  } else {
    console.error(`❌ ${prefix} Unexpected error:`, error);
  }
}

export function formatUserError(error: DocusaurusPluginError | Error): string {
  if (error instanceof DocusaurusPluginError) {
    return `${error.emoji} ${error.userMessage}`;
  }
  return `❌ An unexpected error occurred. Please try again.`;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof DocusaurusPluginError && !error.retryable) {
        console.error(`🚫 Non-retryable error, stopping attempts:`, error.emoji, error.message);
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`💥 All ${maxRetries} attempts failed`);
        break;
      }

      const delay = delayMs * attempt; // Exponential backoff
      console.warn(`⏳ Attempt ${attempt} failed, retrying in ${delay}ms...`, (error as any)?.message || error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}