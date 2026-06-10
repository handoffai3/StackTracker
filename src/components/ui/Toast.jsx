import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#161B28',
                    color: '#E2E8F0',
                    border: '1px solid #2D3748',
                    borderRadius: '12px',
                    fontSize: '13px',
                    padding: '12px 16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#161B28',
                    },
                    style: {
                        borderColor: '#10B981',
                        borderLeftWidth: '3px',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#161B28',
                    },
                    style: {
                        borderColor: '#EF4444',
                        borderLeftWidth: '3px',
                    },
                },
            }}
        />
    );
};

export default ToastProvider;
