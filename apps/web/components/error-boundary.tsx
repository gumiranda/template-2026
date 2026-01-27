"use client";

import { Component, ReactNode } from "react";
<<<<<<< HEAD
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle} from "@workspace/ui/components/card";
=======
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
>>>>>>> fe0794d531a172778829b2cff8e0fa808249e12e
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface FallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={resetError}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

<<<<<<< HEAD
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={({ error , resetError }: any ) =>
        fallback ? (
          <>{fallback}</>
        ) : (
          <ErrorFallback error={error} resetError={resetError} />
        )
      }
    >
      {children}
    </ReactErrorBoundary>
  );
=======
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
>>>>>>> fe0794d531a172778829b2cff8e0fa808249e12e
}
