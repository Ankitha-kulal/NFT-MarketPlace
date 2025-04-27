import React from 'react';
import ReactDOM from 'react-dom/client';
import 'materialize-css/dist/css/materialize.min.css';
import './index.css';
import App from './App';
import { ProfileProvider } from './context/ProfileContext';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <ProfileProvider>
        <App /> 
      </ProfileProvider>
    </React.StrictMode>
  );
  