import React, { createContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { initializeXmtp, wipeKeys } from '../services/xmtpService';

export const Web3Context = createContext();

const providerOptions = {
  // Add more providers here as needed
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // This is important to cache the provider
  providerOptions // required
});

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [xmtpClient, setXmtpClient] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(network.chainId);

      // Initialize XMTP client
      const client = await initializeXmtp(signer);
      setXmtpClient(client);

      instance.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

      instance.on("chainChanged", (chainId) => {
        setChainId(chainId);
      });

      instance.on("disconnect", () => {
        disconnect();
      });

    } catch (error) {
      console.error("Failed to connect wallet or initialize XMTP:", error);
    }
  }, []);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    if (account) {
      wipeKeys(account);
    }
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setXmtpClient(null);
  }, [account]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet]);

  return (
    <Web3Context.Provider value={{ 
      provider, 
      signer, 
      account, 
      chainId, 
      xmtpClient, 
      connectWallet, 
      disconnect
    }}>
      {children}
    </Web3Context.Provider>
  );
};
