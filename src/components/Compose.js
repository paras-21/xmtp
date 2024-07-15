import React, { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { newConversation, sendMessage } from '../services/xmtpService';

const Compose = () => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const { xmtpClient } = useContext(Web3Context);

  const handleSend = async () => {
    if (xmtpClient && recipient && content) {
      try {
        const conversation = await newConversation(xmtpClient, recipient);
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Compose Message</h2>
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
      />
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
