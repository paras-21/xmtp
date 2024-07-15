import { Client } from '@xmtp/xmtp-js';

const KEYS_STORAGE_KEY = 'xmtp-keys';

export const initializeXmtp = async (signer, forceNewKeys = false) => {
  if (!forceNewKeys) {
    const storedKeys = localStorage.getItem(KEYS_STORAGE_KEY);
    if (storedKeys) {
      try {
        const keys = JSON.parse(storedKeys);
        return await Client.create(null, { env: 'production', privateKeyOverride: keys });
      } catch (error) {
        console.error('Error parsing stored keys:', error);
        localStorage.removeItem(KEYS_STORAGE_KEY);
      }
    }
  }
  
  // If there are no stored keys, parsing failed, or forceNewKeys is true, create a new client
  const xmtp = await Client.create(signer, { env: 'production' });
  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(xmtp.keys));
  return xmtp;
};

export const clearXmtpKeys = () => {
  localStorage.removeItem(KEYS_STORAGE_KEY);
};

export const sendMessage = async (conversation, content) => {
  await conversation.send(content);
};

export const getConversations = async (xmtp) => {
  return await xmtp.conversations.list();
};

export const getMessages = async (conversation) => {
  return await conversation.messages();
};

export const newConversation = async (xmtp, address) => {
  return await xmtp.conversations.newConversation(address);
};
