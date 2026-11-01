import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e1e30',
          color: '#f1f5f9',
          border: '1px solid rgba(247,201,72,0.2)',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#f7c948', secondary: '#0a0a0f' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
      }}
    />
  </React.StrictMode>
);
