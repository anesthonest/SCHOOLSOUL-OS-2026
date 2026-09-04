import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { reportTechnicalError } from '../../services/feedbackApi';

interface Props {
  children: ReactNode;
  fallbackView?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, errorId: null };
  }

  public override async componentDidCatch(error: Error, errorInfo: any) {
    console.error('SchoolSoul Uncaught Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });

    try {
      const generatedId = await reportTechnicalError('ReactErrorBoundary', error, {
        componentStack: errorInfo?.componentStack?.substring(0, 1000),
      });
      if (generatedId) {
        this.setState({ errorId: generatedId });
      }
    } catch {
      // Ignore background telemetry errors
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallbackView) {
        return this.props.fallbackView;
      }

      return (
        <div className="min-h-[400px] w-full p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl my-6 shadow-sm">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Module Error Intercepted
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mb-2 leading-relaxed">
            SchoolSoul's enterprise error guard safely isolated a localized view runtime exception to prevent data corruption or application crash.
          </p>

          {this.state.errorId && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-full text-xs font-mono font-bold text-rose-700 dark:text-rose-300 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Error ID: {this.state.errorId}
            </div>
          )}

          {this.state.error && (
            <div className="w-full max-w-lg p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-left font-mono text-[11px] text-rose-600 dark:text-rose-400 overflow-x-auto mb-6">
              <p className="font-bold">{this.state.error.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-500 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Module State
            </button>
            <button
              onClick={this.handleReloadPage}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
