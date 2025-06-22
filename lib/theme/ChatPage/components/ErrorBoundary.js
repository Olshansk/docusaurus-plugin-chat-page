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
exports.ErrorBoundary = void 0;
const react_1 = __importStar(require("react"));
const errors_1 = require("../../../utils/errors");
const styles_module_css_1 = __importDefault(require("../styles.module.css"));
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.handleRetry = () => {
            console.log("🔄 User retrying after error...");
            this.setState({ hasError: false, error: null });
        };
        this.handleReload = () => {
            console.log("🔄 User reloading page after error...");
            window.location.reload();
        };
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // Log the error with context
        (0, errors_1.logError)(error, "React ErrorBoundary");
        console.error("⚛️❌ React Error Boundary caught error:", error);
        console.error("📋 Component stack:", errorInfo.componentStack);
        // Call optional error handler
        this.props.onError?.(error, errorInfo);
        // Convert to our error type if needed
        if (!(error instanceof errors_1.DocusaurusPluginError)) {
            const pluginError = (0, errors_1.createError)(errors_1.ErrorType.UNKNOWN, `React component error: ${error.message}`, "A component crashed. Please refresh the page and try again.", {
                emoji: "⚛️💥",
                details: { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack },
                retryable: true
            });
            (0, errors_1.logError)(pluginError, "ErrorBoundary");
        }
    }
    render() {
        if (this.state.hasError) {
            const error = this.state.error;
            const isPluginError = error instanceof errors_1.DocusaurusPluginError;
            const userMessage = isPluginError ? (0, errors_1.formatUserError)(error) : "⚛️❌ Something went wrong with the chat interface.";
            const canRetry = isPluginError ? error.retryable : true;
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (react_1.default.createElement("div", { className: styles_module_css_1.default.errorBoundary },
                react_1.default.createElement("div", { className: styles_module_css_1.default.errorIcon }, "\uD83D\uDCA5"),
                react_1.default.createElement("h3", null, "\uD83D\uDEA8 Chat Interface Error"),
                react_1.default.createElement("p", { className: styles_module_css_1.default.errorMessage }, userMessage),
                error && (react_1.default.createElement("details", { className: styles_module_css_1.default.errorDetails },
                    react_1.default.createElement("summary", null, "\uD83D\uDD0D Technical Details"),
                    react_1.default.createElement("pre", { className: styles_module_css_1.default.errorStack },
                        error.name,
                        ": ",
                        error.message,
                        error.stack && `\n\nStack trace:\n${error.stack}`))),
                react_1.default.createElement("div", { className: styles_module_css_1.default.errorActions },
                    canRetry && (react_1.default.createElement("button", { onClick: this.handleRetry, className: styles_module_css_1.default.retryButton }, "\uD83D\uDD04 Try Again")),
                    react_1.default.createElement("button", { onClick: this.handleReload, className: styles_module_css_1.default.reloadButton }, "\uD83D\uDD04 Reload Page")),
                react_1.default.createElement("div", { className: styles_module_css_1.default.errorTips },
                    react_1.default.createElement("h4", null, "\uD83D\uDCA1 Troubleshooting Tips:"),
                    react_1.default.createElement("ul", null,
                        react_1.default.createElement("li", null, "\uD83D\uDD11 Check that your OpenAI API key is valid"),
                        react_1.default.createElement("li", null, "\uD83C\uDF10 Verify your internet connection"),
                        react_1.default.createElement("li", null, "\uD83D\uDD04 Try refreshing the page"),
                        react_1.default.createElement("li", null, "\uD83D\uDCF1 If the problem persists, try clearing your browser cache")))));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map