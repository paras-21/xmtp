import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  blockAddress, 
  unblockAddress, 
  isAddressBlocked, 
  isAllowed,
  allowAddress,
  refreshConsentList 
} from '../services/xmtpService';
import Message from './Message';

const Inbox = () => {
  const [conversations, setConversations] = useState({
    primary: [],
    requests: [],
    blocked: []
  });
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentInbox, setCurrentInbox] = useState('primary');
  const { xmtpClient, account } = useContext(Web3Context);

  useEffect(() => {
    const fetchConversations = async () => {
      if (xmtpClient && account) {
        try {
          await refreshConsentList(xmtpClient);
          const fetchedConversations = await getConversations(xmtpClient);
          const categorizedConversations = await categorizeConversations(fetchedConversations);
          setConversations(categorizedConversations);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      }
    };
    fetchConversations();
  }, [xmtpClient, account]);

  const categorizeConversations = async (convos) => {
    const categorized = { primary: [], requests: [], blocked: [] };
    for (const conversation of convos) {
      const isBlocked = await isAddressBlocked(xmtpClient, conversation.peerAddress);
      if (isBlocked) {
        categorized.blocked.push(conversation);
      } else {
        const allowed = await isAllowed(xmtpClient, conversation.peerAddress);
        if (allowed) {
          categorized.primary.push(conversation);
        } else {
          categorized.requests.push(conversation);
        }
      }
    }
    return categorized;
  };

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

  const handleBlock = async (conversation) => {
    try {
      await blockAddress(xmtpClient, conversation.peerAddress);
      const updatedConversations = await categorizeConversations(await getConversations(xmtpClient));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error blocking address:', error);
      alert('Failed to block address. Please try again.');
    }
  };

  const handleUnblock = async (conversation) => {
    try {
      await unblockAddress(xmtpClient, conversation.peerAddress);
      const updatedConversations = await categorizeConversations(await getConversations(xmtpClient));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error unblocking address:', error);
      alert('Failed to unblock address. Please try again.');
    }
  };

  const handleAllow = async (conversation) => {
    try {
      await allowAddress(xmtpClient, conversation.peerAddress);
      const updatedConversations = await categorizeConversations(await getConversations(xmtpClient));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error allowing address:', error);
      alert('Failed to allow address. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Inbox</h2>
      <div className="flex mb-4">
        {['primary', 'requests', 'blocked'].map((inbox) => (
          <button
            key={inbox}
            className={`mr-2 px-4 py-2 rounded ${currentInbox === inbox ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentInbox(inbox)}
          >
            {inbox.charAt(0).toUpperCase() + inbox.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex">
        <div className="w-1/3 pr-4">
          <h3 className="text-xl font-semibold mb-2">Conversations</h3>
          {conversations[currentInbox].length === 0 ? (
            <p>No conversations in this inbox.</p>
          ) : (
            conversations[currentInbox].map((conversation, index) => (
              <div
                key={index}
                className={`cursor-pointer p-4 hover:bg-gray-100 border-b ${
                  selectedConversation === conversation ? 'bg-blue-100' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <span>{conversation.peerAddress}</span>
                {currentInbox === 'requests' && (
                  <button
                    className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAllow(conversation);
                    }}
                  >
                    Allow
                  </button>
                )}
                {currentInbox !== 'blocked' ? (
                  <button
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlock(conversation);
                    }}
                  >
                    Block
                  </button>
                ) : (
                  <button
                    className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnblock(conversation);
                    }}
                  >
                    Unblock
                  </button>
                )}
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
          {selectedConversation && currentInbox !== 'blocked' && (
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
