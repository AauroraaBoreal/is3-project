import React, { useState } from 'react';
import './App.css';
import BarraLateral from './Componentes/barralateral';
import Cabecera from './Componentes/cabecera';
import Conversacion from './Componentes/conversacion';
import Enviarmensaje from './Componentes/enviar_mensaje';
import Login from '../Login/login';

function App() {
  const [mostrarLogin, setMostrarLogin] = useState(false);
  // Estado para controlar si se muestra la pantalla del login
  const [messages, setMessages] = useState([]);
  // Manejar los mensajes en la conversacion, inicialmente vacio

  const manejarMostrarLogin = () => {
    setMostrarLogin(true);
    // Estado para mostrar la pantalla de inicio de sesion
  };
  const handleSendMessage = async (userMessage) => {
    // Maneja el envío de un mensaje
    if (userMessage.trim() !== "") {
      // Comprueba que el mensaje no este vacio
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'user', text: userMessage }
        // Añade el mensaje del usuario al estado messages
      ]);
  
      // Verifica si el mensaje es del tipo de subida de archivo (comienza con "Uploaded file:")
      const isUploadMessage = userMessage.startsWith("Uploaded file:");
  
      try {
        const response = await fetch('http://127.0.0.1:5001/chatbot', { 
          // Hace una peticion HTTP POST al endpoint del chatbot

          method: 'POST', 
          // Metodo HTTP utilizado para la solicitud

          headers: {
            'Content-Type': 'application/json', 
            // Establece el tipo de contenido como JSON
          },

          body: JSON.stringify({ inputCode: userMessage }), 
          // Envia el mensaje del usuario como un JSON en el cuerpo de la solicitud
        });
  
        const data = await response.json(); 
        // Parsea la respuesta del servidor a un objeto JSON.

        console.log("API Response:", data); 
        // Imprime en consola la respuesta de la API para propósitos de depuracion
  
        // Se asegura de que la respuesta es una cadena
        if (data.response && typeof data.response === "string") {
          setMessages((prevMessages) => {
            
            if (isUploadMessage) {
              const uploadMessageCount = prevMessages.filter(
                (msg) => msg.type === 'bot' && msg.isUploadResponse
              ).length;
  
              if (uploadMessageCount < 1) {
                return prevMessages; 
              }
            }
  
            return [
              ...prevMessages,
              { type: 'bot', text: data.response, isUploadResponse: isUploadMessage }
              // Añade la respuesta del bot al estado 'messages'
            ];
          });
        } else {
          console.warn("Invalid response format from API:", data);
        }
      } catch (error) {
        console.error("Error fetching chatbot response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: "Error: Could not connect to chatbot." }
        ]);
      }
    }
  };
  return (
    <div>
      {mostrarLogin ? ( 
        <Login />
      ) : (
        <>
          <div className='contenedor-app'>
            <BarraLateral />
            <div className="contenido-principal">
              <Cabecera LoginClick={manejarMostrarLogin} />
              <Conversacion messages={messages} />
              <Enviarmensaje onSendMessage={handleSendMessage} />
            </div>
          </div>
        </>
      )} 
    </div>
  );
} 

export default App;
