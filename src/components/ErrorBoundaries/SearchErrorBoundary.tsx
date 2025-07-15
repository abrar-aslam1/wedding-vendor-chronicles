import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class SearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Search Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service integration
      console.error('Production error in search:', { error, errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Search Error
          </h2>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            We encountered an issue while searching for vendors. This might be due to a temporary network issue or server problem.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={this.handleRetry}
              className="bg-wedding-primary hover:bg-wedding-primary-dark text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Error details (development only)
              </summary>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 border">
                {this.state.error.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 border mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
