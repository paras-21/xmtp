import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import Compose from './components/Compose';
import Inbox from './components/Inbox';

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <Header />
        <main className="container mx-auto p-4">
          <Compose />
          <Inbox />
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;
