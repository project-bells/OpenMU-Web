import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[MU Origins] Uncaught error captured by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 text-white">
          <div className="fantasy-panel gold-border max-w-md w-full rounded-3xl p-8 text-center shadow-2xl">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400">
              <AlertTriangle className="h-8 w-8" />
            </span>
            <h1 className="font-display mt-5 text-2xl font-black text-white">
              ANOMALY DETECTED IN LORENCIA
            </h1>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              The portal encountered an unexpected runtime exception. The sanctuary ward has contained the disturbance.
            </p>
            {this.state.error?.message && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-left font-mono text-xs text-red-300 break-words">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="btn-shine mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-3.5 text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Respawn Portal (Reload)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
