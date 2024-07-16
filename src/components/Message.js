import React from 'react';

const Message = ({ message }) => {
  return (
    <div className="mb-2 p-2 bg-gray-100 rounded">
      <p className="text-sm text-gray-600">{message.senderAddress}</p>
      <p>{message.content}</p>
      <p className="text-xs text-gray-400">{new Date(message.sent).toLocaleString()}</p>
    </div>
  );
};

export default Message;
