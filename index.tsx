import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix: Access document via window (casted to any) to avoid "Cannot find name 'document'" in restricted environments
const rootElement = (window as any).document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);