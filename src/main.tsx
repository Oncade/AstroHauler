import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/variables.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

// Register the service worker (disabled in dev mode to prevent caching issues)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`)
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW failed:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Unregister service worker in dev mode if it exists
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
    console.log('[Dev] Service worker unregistered to prevent caching');
  });
}
