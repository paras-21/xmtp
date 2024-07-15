import { Client } from '@xmtp/xmtp-js';

export const initializeXmtp = async (signer) => {
  const xmtp = await Client.create(signer);
  return xmtp;
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
