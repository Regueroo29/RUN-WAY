import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#2a2a2a',
          color: '#fff',
          border: '1px solid rgba(200, 180, 160, 0.3)',
        },
        success: {
          iconTheme: {
            primary: 'rgba(200, 180, 160, 1)',
            secondary: '#2a2a2a',
          },
        },
        error: {
          iconTheme: {
            primary: '#ff6b6b',
            secondary: '#2a2a2a',
          },
        },
      }}
    />
  );
}