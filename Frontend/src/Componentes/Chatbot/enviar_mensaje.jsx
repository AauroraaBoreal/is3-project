import React, { useState } from 'react';

function Enviarmensaje({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleButtonClick();
    }
  };

  return (
    <div className="enviar-mensaje">
      <input
        type="text"
        placeholder="Escribe el mensaje..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleButtonClick}>Enviar</button>
    </div>
  );
}

export default Enviarmensaje;