import { Component, ErrorInfo, ReactNode } from "react";
import { ThemeContext } from "../ThemeContext";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ThemeContext.Consumer>
          {(themeCtx) => {
            const theme = themeCtx?.theme;
            return (
              <div
                className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
                style={{
                  background: theme?.bg || "#000",
                  color: theme?.text || "#fff",
                }}
              >
                <div
                  className="max-w-md rounded-2xl border p-8 shadow-2xl"
                  style={{
                    borderColor: theme?.border || "#333",
                    background: theme?.mode === "light" ? "#fff" : "#111",
                  }}
                >
                  <div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "rgba(239, 68, 68, 0.1)" }}
                  >
                    <svg
                      className="h-8 w-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
                  <p
                    className="mb-6 text-sm"
                    style={{ color: theme?.textMuted || "#888" }}
                  >
                    We encountered an unexpected error. Please try reloading the
                    page or contact support if the issue persists.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full rounded-xl px-4 py-3 font-semibold text-white transition hover:opacity-90"
                    style={{ background: `rgb(${theme?.c1 || "59, 130, 246"})` }}
                  >
                    Reload Page
                  </button>
                  <div className="mt-4 text-left text-xs opacity-50">
                    <pre className="overflow-auto max-h-32 p-2 bg-black/10 rounded">
                      {this.state.error?.toString()}
                    </pre>
                  </div>
                </div>
              </div>
            );
          }}
        </ThemeContext.Consumer>
      );
    }

    return this.props.children;
  }
}
