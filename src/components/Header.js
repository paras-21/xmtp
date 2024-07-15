import React, { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const Header = () => {
  const { account, chainId, connectWallet, disconnect } = useContext(Web3Context);

  return (
    <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">XMTP Email App</h1>
      {account ? (
        <div>
          <span className="mr-4">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          <span className="mr-4">Chain ID: {chainId}</span>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
};

export default Header;
