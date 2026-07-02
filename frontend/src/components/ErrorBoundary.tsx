import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere in the tree and shows a cyberpunk-themed
 * fallback instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#0b0c10',
            color: '#e5e7eb',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <h1 style={{ color: '#ff007a', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Algo deu errado
            </h1>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                border: '1px solid #00f0ff',
                color: '#00f0ff',
                background: 'transparent',
                padding: '0.6rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
