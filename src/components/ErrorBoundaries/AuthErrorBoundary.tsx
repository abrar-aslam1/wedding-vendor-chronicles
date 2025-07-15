import React, { Component, ReactNode } from 'react';
import { Shield, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onAuthError?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isAuthError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is an authentication-related error
    const isAuthError = error.message.includes('auth') || 
                       error.message.includes('unauthorized') ||
                       error.message.includes('token') ||
                       error.message.includes('session');
    
    return { hasError: true, error, isAuthError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    // Call auth error handler if provided
    if (this.state.isAuthError && this.props.onAuthError) {
      this.props.onAuthError();
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service integration
      console.error('Production auth error:', { error, errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isAuthError: false });
  };

  handleSignIn = () => {
    window.location.href = '/auth';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-orange-200">
          <Shield className="h-12 w-12 text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {this.state.isAuthError ? 'Authentication Error' : 'Access Error'}
          </h2>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            {this.state.isAuthError 
              ? 'There was an issue with your authentication. Please sign in again to continue.'
              : 'We encountered an issue while processing your request. This might be a temporary problem.'
            }
          </p>
          <div className="flex gap-3">
            {this.state.isAuthError ? (
              <Button
                onClick={this.handleSignIn}
                className="bg-wedding-primary hover:bg-wedding-primary-dark text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            ) : (
              <Button
                onClick={this.handleRetry}
                className="bg-wedding-primary hover:bg-wedding-primary-dark text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
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
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
