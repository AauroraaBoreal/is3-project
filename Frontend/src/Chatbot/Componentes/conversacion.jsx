import React from 'react';

function Conversacion({ messages }) {
  return (
    <div className="conversacion">
      {messages.map((msg, index) => (
        // Mapea cada mensaje en el array 'messages'
        <div
          key={index}
          // Asigna una clave unica para cada mensaje usando el indice del array

          className={msg.type === 'user' ? 'mensaje-usuario' : 'mensaje-bot'}
          // Define la clase CSS basada en el tipo de mensaje, user o bot 
        >
          <p>
            {typeof msg.text === "string"
              ? msg.text
              : JSON.stringify(msg.text)} {/* Si el texto no es una cadena, lo convierte a JSON para evitar errores al renderizar */}             
          </p>
        </div>
      ))}
    </div>
  );
}

export default Conversacion;
