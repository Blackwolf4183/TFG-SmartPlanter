import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './global.css';

import Main from './pages/Main';
import customTheme from './theme';
import Login from './pages/Login';

import { ChakraProvider } from '@chakra-ui/react';
import { RequireAuth } from 'react-auth-kit';

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth loginPath="/auth">
                <Main />
              </RequireAuth>
            }
          />
          
          <Route path="/auth" element={<Login />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
