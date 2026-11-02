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
          background: '#FFFFFF',
          color: '#3B2A1A',
          border: '2px solid #3B2A1A',
          borderRadius: '16px',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 4px 0 #3B2A1A',
        },
        success: { iconTheme: { primary: '#4CAF50', secondary: '#FFF' } },
        error: { iconTheme: { primary: '#FF6B6B', secondary: '#FFF' } },
      }}
    />
  </React.StrictMode>
);
