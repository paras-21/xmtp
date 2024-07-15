import React, { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { initializeXmtp, newConversation, sendMessage } from '../services/xmtpService';

const Compose = () => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const { signer } = useContext(Web3Context);

  const handleSend = async () => {
    if (signer && recipient && content) {
      try {
        const xmtp = await initializeXmtp(signer);
        const conversation = await newConversation(xmtp, recipient);
        await sendMessage(conversation, content);
        alert('Message sent successfully!');
        setRecipient('');
        setContent('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Compose Message</h2>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        className="w-full p-2 mb-2 border rounded"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Message content"
        className="w-full p-2 mb-2 border rounded"
        rows="4"
      ></textarea>
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
};

export default Compose;
