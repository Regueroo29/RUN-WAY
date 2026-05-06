import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Lazy load heavy components
const ToastProvider = React.lazy(() => import('./components/ToastProvider.jsx'));
const SocketProvider = React.lazy(() => import('./context/SocketContext.jsx'));

// Simple Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, textAlign: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <button onClick={() => window.location.reload()}>Refresh Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <Suspense fallback={<div>Loading...</div>}>
                    <SocketProvider>
                        <ToastProvider>
                            <App />
                        </ToastProvider>
                    </SocketProvider>
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);