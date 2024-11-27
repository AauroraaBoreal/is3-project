// src/Componentes/Chatbot/barralateral.jsx
import React, {useState} from 'react';

function BarraLateral({ conversaciones, setConversacionActual, handleNuevaConversacion }) {
  // Estado para manejar la conversación seleccionada
  const [seleccionado, setSeleccionado] = useState(null);

  // Manejar clic en una conversación
  const manejarClick = (id) => {
    setSeleccionado(id); // Establece el id de la conversación seleccionada
    setConversacionActual(id); // Llama a la función pasada por props para actualizar la conversación actual
  };
  return (
    <div className="barralateral">
      <h2>Chat Health</h2>
      <button className="Boton-NuevaConversacion" onClick={handleNuevaConversacion}>Nueva Conversación</button>
      <div className="conversaciones-lista">
        {conversaciones.map(conv => (
          <div 
            key={conv.id} 
            className= {`conversacion-item ${seleccionado === conv.id ? 'seleccionado' : ''}`}
            onClick={() => manejarClick(conv.id)}
          >
            <span>{new Date(conv.fecha_inicio).toLocaleDateString()}</span>
            <p>{conv.primer_mensaje?.substring(0, 30)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export default BarraLateral;