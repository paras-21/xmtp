import React, { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const ConnectWallet = () => {
  const { account } = useContext(Web3Context);

  return (
    <div className="p-4">
      {account ? (
        <p className="text-green-600">Connected: {account}</p>
      ) : (
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
