import { Component, ReactNode } from "react";
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
}
interface State {
    hasError: boolean;
    error: Error | null;
}
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: any): void;
    private handleRetry;
    private handleReload;
    render(): {};
}
export {};
