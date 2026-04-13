import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR WebSocket errors that can cause unhandled rejections in some environments
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    (event.reason.message && event.reason.message.includes('WebSocket')) ||
    (typeof event.reason === 'string' && event.reason.includes('WebSocket'))
  )) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
