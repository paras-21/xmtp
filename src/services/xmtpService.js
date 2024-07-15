import { Client } from '@xmtp/xmtp-js';

const ENCODING = "binary";

export const getEnv = () => {
  return "production";
};

export const buildLocalStorageKey = (walletAddress) =>
  walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress) => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress, keys) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING),
  );
};

export const wipeKeys = (walletAddress) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};

export const initializeXmtp = async (signer, forceNewKeys = false) => {
  try {
    const address = await signer.getAddress();
    let keys = loadKeys(address);

    if (!keys || forceNewKeys) {
      const options = {
        env: getEnv(),
        skipContactPublishing: true,
        persistConversations: false,
      };
      keys = await Client.getKeys(signer, options);
      storeKeys(address, keys);
    }

    const client = await Client.create(null, { env: getEnv(), privateKeyOverride: keys });
    return client;
  } catch (error) {
    console.error('Error initializing XMTP client:', error);
    throw error;
  }
};

export const sendMessage = async (conversation, content) => {
  try {
    await conversation.send(content);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getConversations = async (xmtp) => {
  try {
    return await xmtp.conversations.list();
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

export const getMessages = async (conversation) => {
  try {
    return await conversation.messages();
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const newConversation = async (xmtp, address) => {
  try {
    return await xmtp.conversations.newConversation(address);
  } catch (error) {
    console.error('Error creating new conversation:', error);
    throw error;
  }
};

// New functions for consent management
export const blockAddress = async (xmtp, address) => {
  try {
    await xmtp.contacts.deny([address]);
  } catch (error) {
    console.error('Error blocking address:', error);
    throw error;
  }
};

export const unblockAddress = async (xmtp, address) => {
  try {
    await xmtp.contacts.allow([address]);
  } catch (error) {
    console.error('Error unblocking address:', error);
    throw error;
  }
};

export const isAddressBlocked = async (xmtp, address) => {
  try {
    return await xmtp.contacts.isDenied(address);
  } catch (error) {
    console.error('Error checking if address is blocked:', error);
    throw error;
  }
};

export const refreshConsentList = async (xmtp) => {
  try {
    await xmtp.contacts.refreshConsentList();
  } catch (error) {
    console.error('Error refreshing consent list:', error);
    throw error;
  }
};
export const isAllowed = async (xmtp, address) => {
  try {
    return await xmtp.contacts.isAllowed(address);
  } catch (error) {
    console.error('Error checking if address is allowed:', error);
    throw error;
  }
};

export const allowAddress = async (xmtp, address) => {
  try {
    await xmtp.contacts.allow([address]);
  } catch (error) {
    console.error('Error allowing address:', error);
    throw error;
  }
};