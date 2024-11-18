import React from 'react';

function Conversacion({ messages }) {
  return (
    <div className="conversacion">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={msg.type === 'user' ? 'mensaje-usuario' : 'mensaje-bot'}
        >
          <p>
            {typeof msg.text === "string"
              ? msg.text
              : JSON.stringify(msg.text)} {/* Safely render non-string objects */}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Conversacion;
