import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getConversations, getMessages, sendMessage } from '../services/xmtpService';
import Message from './Message';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { xmtpClient } = useContext(Web3Context);

  useEffect(() => {
    const fetchConversations = async () => {
      if (xmtpClient) {
        try {
          const fetchedConversations = await getConversations(xmtpClient);
          setConversations(fetchedConversations);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      }
    };
    fetchConversations();
  }, [xmtpClient]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        const fetchedMessages = await getMessages(selectedConversation);
        setMessages(fetchedMessages);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (selectedConversation && newMessage.trim() !== '') {
      try {
        await sendMessage(selectedConversation, newMessage);
        setNewMessage('');
        const updatedMessages = await getMessages(selectedConversation);
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Inbox</h2>
      <div className="flex">
        <div className="w-1/3 pr-4">
          <h3 className="text-xl font-semibold mb-2">Conversations</h3>
          {conversations.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            conversations.map((conversation, index) => (
              <div
                key={index}
                className={`cursor-pointer p-4 hover:bg-gray-100 border-b ${
                  selectedConversation === conversation ? 'bg-blue-100' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                {conversation.peerAddress}
              </div>
            ))
          )}
        </div>
        <div className="w-2/3">
          <h3 className="text-xl font-semibold mb-2">Messages</h3>
          {selectedConversation ? (
            messages.length === 0 ? (
              <p>No messages in this conversation.</p>
            ) : (
              messages.map((message, index) => (
                <Message key={index} message={message} />
              ))
            )
          ) : (
            <p>Select a conversation to view messages.</p>
          )}
          {selectedConversation && (
            <div className="mt-4">
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
