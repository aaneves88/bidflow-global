import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-level error boundary. Catches render-time crashes (including failed
 * dynamic imports while offline) and shows a recoverable fallback instead
 * of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background text-foreground">
        <h1 className="text-2xl font-bold">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Não foi possível carregar a tela. Verifique sua conexão e tente novamente.
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
}
