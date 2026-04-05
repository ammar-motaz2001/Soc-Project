import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0F1722] flex items-center justify-center p-6">
          <div className="bg-[#19232C] rounded-xl p-8 max-w-md w-full border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FF6B6B]/20 rounded-lg p-3">
                <AlertTriangle className="text-[#FF6B6B]" size={24} />
              </div>
              <div>
                <h3 className="text-xl text-[#E6EEF6] mb-1">Something went wrong</h3>
                <p className="text-[#98A0AC] text-sm">The application encountered an error</p>
              </div>
            </div>
            
            {this.state.error && (
              <div className="bg-[#0F1722] rounded-lg p-4 mb-4">
                <div className="text-[#FF6B6B] text-sm mb-2">Error Details:</div>
                <code className="text-xs text-[#98A0AC] block overflow-auto">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="w-full bg-[#A7EA3B] text-[#0F1722] px-4 py-3 rounded-lg hover:bg-[#98d932] transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
