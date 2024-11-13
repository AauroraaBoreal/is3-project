import React, { useState } from 'react';
import './App.css';
import BarraLateral from './Componentes/Chatbot/barralateral';
import Cabecera from './Componentes/Chatbot/cabecera';
import Conversacion from './Componentes/Chatbot/conversacion';
import Enviarmensaje from './Componentes/Chatbot/enviar_mensaje';
import Login from './Componentes/Login/login';

function App() {
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [messages, setMessages] = useState([]);

  const manejarMostrarLogin = () => {
    setMostrarLogin(true);
  };

  // const handleSendMessage = (userMessage) => {
  //   if (userMessage.trim() !== "") {
  //     // Agregar mensaje del usuario
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { type: 'user', text: userMessage }
  //     ]);

  //     // Simular respuesta del bot
  //     setTimeout(() => {
  //       setMessages((prevMessages) => [
  //         ...prevMessages,
  //         { type: 'bot', text: "Hola, ¿en qué puedo ayudarte?" }
  //       ]);
  //     }, 1000);
  //   }
  // };
  // 
  // 
  const handleSendMessage = async (userMessage) => {
    if (userMessage.trim() !== "") {
      // Add user message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'user', text: userMessage }
      ]);
  
      try {
        // Send the message to the chatbot API
        const response = await fetch('http://127.0.0.1:5001/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputCode: userMessage }),
        });
  
        const data = await response.json();
  
        // Log the received data to ensure it's correct
        console.log('Received from API:', data);
  
        // Add chatbot response to chat
        setMessages((prevMessages) => {
          console.log("Updating messages:", [...prevMessages, { type: 'bot', text: data }]);
          return [...prevMessages, { type: 'bot', text: data }];
        });
  
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
