import { AuthProvider } from 'react-auth-kit';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  
    <AuthProvider
      authType={'cookie'}
      authName={'_auth'}
      cookieDomain={window.location.hostname}
      cookieSecure={window.location.protocol === 'https:'}
    >
      <App />
    </AuthProvider>

);
