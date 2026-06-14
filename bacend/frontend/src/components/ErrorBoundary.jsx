import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ ERROR CAUGHT:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#030303',
                    color: '#fff',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '20px'
                }}>
                    <h1 style={{ color: '#ef4444' }}>❌ Xatolik yuz berdi!</h1>
                    <p>{this.state.error?.message}</p>
                    <pre style={{
                        background: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        maxWidth: '500px',
                        fontSize: '12px',
                        color: '#10b981',
                        maxHeight: '300px'
                    }}>
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#8b5cf6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Sahifani Yangilash
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
