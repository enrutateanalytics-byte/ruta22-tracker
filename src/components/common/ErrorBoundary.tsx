import React from 'react'

type ErrorBoundaryState = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md w-full border rounded-lg p-6 shadow-sm bg-background">
            <h1 className="text-lg font-semibold mb-2">Se produjo un error</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Intenta recargar la página. Si el problema persiste, revisa la consola del navegador.
            </p>
            {this.state.error && (
              <pre className="text-xs overflow-auto p-3 rounded bg-muted">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
