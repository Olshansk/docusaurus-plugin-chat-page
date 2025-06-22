import React, { Component, ReactNode } from "react";
import { logError, formatUserError, DocusaurusPluginError, ErrorType, createError } from "../../../utils/errors";
import styles from "../styles.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error with context
    logError(error, "React ErrorBoundary");
    console.error("⚛️❌ React Error Boundary caught error:", error);
    console.error("📋 Component stack:", errorInfo.componentStack);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Convert to our error type if needed
    if (!(error instanceof DocusaurusPluginError)) {
      const pluginError = createError(
        ErrorType.UNKNOWN,
        `React component error: ${error.message}`,
        "A component crashed. Please refresh the page and try again.",
        {
          emoji: "⚛️💥",
          details: { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack },
          retryable: true
        }
      );
      logError(pluginError, "ErrorBoundary");
    }
  }

  private handleRetry = () => {
    console.log("🔄 User retrying after error...");
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    console.log("🔄 User reloading page after error...");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isPluginError = error instanceof DocusaurusPluginError;
      const userMessage = isPluginError ? formatUserError(error) : "⚛️❌ Something went wrong with the chat interface.";
      const canRetry = isPluginError ? error.retryable : true;

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorIcon}>💥</div>
          <h3>🚨 Chat Interface Error</h3>
          <p className={styles.errorMessage}>{userMessage}</p>
          
          {error && (
            <details className={styles.errorDetails}>
              <summary>🔍 Technical Details</summary>
              <pre className={styles.errorStack}>
                {error.name}: {error.message}
                {error.stack && `\n\nStack trace:\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className={styles.errorActions}>
            {canRetry && (
              <button onClick={this.handleRetry} className={styles.retryButton}>
                🔄 Try Again
              </button>
            )}
            <button onClick={this.handleReload} className={styles.reloadButton}>
              🔄 Reload Page
            </button>
          </div>

          <div className={styles.errorTips}>
            <h4>💡 Troubleshooting Tips:</h4>
            <ul>
              <li>🔑 Check that your OpenAI API key is valid</li>
              <li>🌐 Verify your internet connection</li>
              <li>🔄 Try refreshing the page</li>
              <li>📱 If the problem persists, try clearing your browser cache</li>
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}