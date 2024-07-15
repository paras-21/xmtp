import React from 'react';

const Message = ({ message }) => {
  return (
    <div className="border rounded p-3 mb-2 bg-gray-50">
      <p className="font-semibold text-sm text-gray-600">{message.senderAddress}</p>
      <p className="mt-1">{message.content}</p>
      <p className="text-xs text-gray-400 mt-1">{new Date(message.sent).toLocaleString()}</p>
    </div>
  );
};

export default Message;
