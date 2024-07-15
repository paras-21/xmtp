import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import ConnectWallet from './components/ConnectWallet';
import Compose from './components/Compose';
import Inbox from './components/Inbox';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <ConnectWallet />
        <div className="flex">
          <div className="w-1/2">
            <Compose />
          </div>
          <div className="w-1/2">
            <Inbox />
          </div>
        </div>
      </div>
    </Web3Provider>
  );
}

export default App;
