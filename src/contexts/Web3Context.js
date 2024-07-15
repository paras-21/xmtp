import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const ethersSigner = await ethersProvider.getSigner();
          setSigner(ethersSigner);
          const address = await ethersSigner.getAddress();
          setAccount(address);
        } catch (error) {
          console.error("User denied account access");
        }
      }
    };
    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, account }}>
      {children}
    </Web3Context.Provider>
  );
};
