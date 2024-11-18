import React, { useState } from 'react';
import './App.css';
import BarraLateral from './Componentes/barralateral';
import Cabecera from './Componentes/cabecera';
import Conversacion from './Componentes/conversacion';
import Enviarmensaje from './Componentes/enviar_mensaje';
import Login from '../Login/login';

function App() {
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [messages, setMessages] = useState([]);

  const manejarMostrarLogin = () => {
    setMostrarLogin(true);
  };
  const handleSendMessage = async (userMessage) => {
    if (userMessage.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'user', text: userMessage }
      ]);
  
      // Track if the last message was an upload type
      const isUploadMessage = userMessage.startsWith("Uploaded file:");
  
      try {
        const response = await fetch('http://127.0.0.1:5001/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputCode: userMessage }),
        });
  
        const data = await response.json();
        console.log("API Response:", data); // Debug log for API response
  
        // Ensure the response is a string before rendering
        if (data.response && typeof data.response === "string") {
          setMessages((prevMessages) => {
            // Check if the last message was an upload type and if we should skip responses
            if (isUploadMessage) {
              const uploadMessageCount = prevMessages.filter(
                (msg) => msg.type === 'bot' && msg.isUploadResponse
              ).length;
  
              // Skip the first two bot responses after upload
              if (uploadMessageCount < 1) {
                return prevMessages; // Do not add this message
              }
            }
  
            return [
              ...prevMessages,
              { type: 'bot', text: data.response, isUploadResponse: isUploadMessage }
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
