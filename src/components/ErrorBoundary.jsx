import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1326] to-[#1a1f35] text-white p-10 text-center">
          <span className="material-symbols-outlined text-error text-6xl mb-4 animate-pulse">crisis_alert</span>
          <h2 className="font-headline font-black text-3xl mb-2 text-error uppercase tracking-widest">System Node Failure</h2>
          <p className="text-on-surface-variant font-medium max-w-lg mb-8">
            An unforeseen anomaly occurred during the rendering sequence. The system intercepted the thread safely.
          </p>
          
          {/* Error Details (Development Only) */}
          {isDevelopment && this.state.error && (
            <div className="bg-error/10 border border-error/30 p-6 rounded-2xl mb-8 max-w-2xl w-full text-left overflow-x-auto">
              <p className="text-[0.65rem] font-bold text-error mb-2">Error Details:</p>
              <code className="text-[0.65rem] text-error align-baseline break-words">
                {this.state.error?.toString()}
              </code>
              {isDevelopment && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="text-[0.65rem] font-bold text-primary cursor-pointer hover:text-indigo-300">View Stack Trace</summary>
                  <pre className="text-[0.55rem] text-on-surface-variant mt-2 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Recovery Suggestions */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-8 max-w-md">
            <p className="text-[0.65rem] font-bold text-primary uppercase tracking-widest mb-2">💡 Recovery Steps:</p>
            <ul className="text-xs text-on-surface-variant space-y-1 text-left">
              <li>• Refresh the page</li>
              <li>• Clear your browser cache</li>
              <li>• Check your internet connection</li>
              <li>• Try again in a few moments</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 max-w-md w-full">
            <button 
              onClick={this.handleReset}
              className="flex-1 bg-primary hover:bg-indigo-400 text-white font-bold font-headline uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(195,192,255,0.3)] hover:scale-105 active:scale-95"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold font-headline uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95"
            >
              Reload
            </button>
          </div>

          {/* Error Tracking */}
          <p className="text-[0.6rem] text-on-surface-variant mt-6">
            Error ID: #{this.state.errorCount} • Error logged for analysis
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
