import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Buffer } from 'buffer';
import './global';
// Add Buffer to the global object
window.Buffer = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
