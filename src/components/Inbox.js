import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { initializeXmtp, getConversations, getMessages, sendMessage } from '../services/xmtpService';
import Message from './Message';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { signer } = useContext(Web3Context);
  const [xmtpClient, setXmtpClient] = useState(null);

  useEffect(() => {
    const initXmtp = async () => {
      if (signer) {
        const client = await initializeXmtp(signer);
        setXmtpClient(client);
        const fetchedConversations = await getConversations(client);
        setConversations(fetchedConversations);
      }
    };
    initXmtp();
  }, [signer]);

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
      await sendMessage(selectedConversation, newMessage);
      setNewMessage('');
      const updatedMessages = await getMessages(selectedConversation);
      setMessages(updatedMessages);
      alert('Message sent successfully!');
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Inbox</h2>
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-1/3 border-r">
          <h3 className="text-lg font-semibold p-4 bg-gray-200">Conversations</h3>
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500">No conversations yet.</p>
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
        </div>
        <div className="w-2/3 flex flex-col">
          <h3 className="text-lg font-semibold p-4 bg-gray-200">Messages</h3>
          <div className="flex-grow overflow-y-auto p-4 h-[calc(100vh-300px)]">
            {selectedConversation ? (
              messages.length === 0 ? (
                <p className="text-gray-500">No messages in this conversation.</p>
              ) : (
                messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))
              )
            ) : (
              <p className="text-gray-500">Select a conversation to view messages.</p>
            )}
          </div>
          {selectedConversation && (
            <div className="p-4 border-t">
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              ></textarea>
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
