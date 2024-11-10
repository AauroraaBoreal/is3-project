import React, { useState } from 'react';

function Enviarmensaje({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    onSendMessage(inputValue);
    setInputValue(""); // Limpiar el input después de enviar
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
      <button onClick={handleButtonClick}>Submit</button>
    </div>
  );
}

export default Enviarmensaje;
