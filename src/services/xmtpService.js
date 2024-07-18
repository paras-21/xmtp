import { Client } from '@xmtp/xmtp-js';
import { encodeBase64, decodeBase64 } from 'ethers';

const DAPP_IDENTIFIER = 'XMTP_PrivateApp_7f3a9b2c';
const ENCRYPTION_KEY = 'K8hX6pL2mN4qR9tY3wZ7vF1jC5bA0eD6';

export const initializeXmtp = async (signer) => {
  try {
    return await Client.create(signer, { env: 'production' });
  } catch (error) {
    console.error('Error initializing XMTP client:', error);
    throw error;
  }
};

const encryptMessage = async (message) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  return encodeBase64(new Uint8Array([...iv, ...new Uint8Array(encrypted)]));
};

const decryptMessage = async (encryptedMessage) => {
  try {
    const decoder = new TextDecoder();
    const data = decodeBase64(encryptedMessage);
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Failed to decrypt message:', error);
    return null;
  }
};

export const sendMessage = async (conversation, content) => {
  try {
    const encryptedContent = await encryptMessage(content);
    await conversation.send(JSON.stringify({
      type: DAPP_IDENTIFIER,
      content: encryptedContent
    }));
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
    const allMessages = await conversation.messages();
    return Promise.all(allMessages.map(async message => {
      try {
        const parsedContent = JSON.parse(message.content);
        if (parsedContent.type === DAPP_IDENTIFIER) {
          const decryptedContent = await decryptMessage(parsedContent.content);
          return { ...message, content: decryptedContent || 'Unable to decrypt message' };
        }
        return null; // Ignore messages not from your dApp
      } catch {
        return null; // Ignore messages that can't be parsed
      }
    })).then(messages => messages.filter(Boolean)); // Remove null messages
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

export const streamMessages = async (conversation, callback) => {
  try {
    const stream = await conversation.streamMessages();
    for await (const message of stream) {
      try {
        const parsedContent = JSON.parse(message.content);
        if (parsedContent.type === DAPP_IDENTIFIER) {
          const decryptedContent = await decryptMessage(parsedContent.content);
          callback({
            ...message,
            content: decryptedContent || 'Unable to decrypt message'
          });
        }
      } catch {
        // Ignore messages that can't be parsed or don't match our format
      }
    }
  } catch (error) {
    console.error('Error streaming messages:', error);
    throw error;
  }
};

export const isOnNetwork = async (address, xmtp) => {
  try {
    return await xmtp.canMessage(address);
  } catch (error) {
    console.error('Error checking if address is on network:', error);
    return false;
  }
};

const buildLocalStorageKey = (walletAddress) =>
  walletAddress ? `xmtp:keys:${walletAddress}` : "";

export const wipeKeys = (walletAddress) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
