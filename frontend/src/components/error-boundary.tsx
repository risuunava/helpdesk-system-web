'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {this.state.error?.message ?? 'Silakan muat ulang halaman'}
              </p>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Muat Ulang
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
