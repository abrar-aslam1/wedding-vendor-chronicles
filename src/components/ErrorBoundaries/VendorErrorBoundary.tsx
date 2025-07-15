import React, { Component, ReactNode } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  vendorId?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class VendorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Vendor Error Boundary caught an error:', error, errorInfo);
    console.error('Vendor ID:', this.props.vendorId);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service integration
      console.error('Production error in vendor component:', { 
        error, 
        errorInfo, 
        vendorId: this.props.vendorId 
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Vendor Display Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Unable to display this vendor. The data may be corrupted or incomplete.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Retry
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={this.toggleDetails}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-100"
                  >
                    {this.state.showDetails ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show Details
                      </>
                    )}
                  </Button>
                )}
              </div>
              {process.env.NODE_ENV === 'development' && this.state.showDetails && this.state.error && (
                <div className="mt-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-red-600 mb-2">
                      Error Stack Trace
                    </summary>
                    <pre className="bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
                      {this.state.error.stack}
                    </pre>
                  </details>
                  {this.props.vendorId && (
                    <p className="text-xs text-red-600 mt-2">
                      Vendor ID: {this.props.vendorId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
