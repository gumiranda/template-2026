"use client";

import { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

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
            {errorMessage}
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={resetErrorBoundary}
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

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={(props: FallbackProps) =>
        fallback ? (
          <>{fallback}</>
        ) : (
          <ErrorFallback {...props} />
        )
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}
