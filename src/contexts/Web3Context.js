import React, { createContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { initializeXmtp, wipeKeys } from '../services/xmtpService';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export const Web3Context = createContext();

const providerOptions = {
  // Add more providers here as needed
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // This is important to cache the provider
  providerOptions // required
});

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
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

  const isSpam = useCallback(async (senderAddress) => {
    try {
      // Check if the sender has any ETH balance
      const balance = await publicClient.getBalance({ address: senderAddress });
      
      // Check if the sender has any transactions
      const transactionCount = await publicClient.getTransactionCount({ address: senderAddress });
      
      // If the sender has no balance and no transactions, consider it potential spam
      if (balance === 0n && transactionCount === 0) {
        return 'requests';
      }
      
      // Check if there's any transaction history between the user and sender
      const userTransactions = await publicClient.getTransactionCount({ address: account });
      const senderTransactions = await publicClient.getTransactionCount({ address: senderAddress });
      
      if (userTransactions > 0 && senderTransactions > 0) {
        return 'primary';
      }
      
      // If none of the above conditions are met, categorize as general
      return 'general';
    } catch (error) {
      console.error("Error categorizing address:", error);
      return 'requests'; // Default to requests if there's an error
    }
  }, [account]);

  return (
    <Web3Context.Provider value={{ 
      provider, 
      signer, 
      account, 
      chainId, 
      xmtpClient, 
      connectWallet, 
      disconnect,
      isSpam 
    }}>
      {children}
    </Web3Context.Provider>
  );
};
