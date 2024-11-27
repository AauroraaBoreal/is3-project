import React, { useState, useEffect, useCallback   } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Componentes/Chatbot/Context/Contexto_Aunteticacion';
import Formulariologin from './Componentes/Login/formulario-login';
import Formularioregistro from './Componentes/Login/formulario-registro';
import BarraLateral from './Componentes/Chatbot/barralateral';
import Cabecera from './Componentes/Chatbot/cabecera';
import Conversacion from './Componentes/Chatbot/conversacion';
import EnviarMensaje from './Componentes/Chatbot/enviar_mensaje';
import './App.css';

// Componente principal del chatbot
function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActual, setConversacionActual] = useState(null);
  const { token, usuario } = useAuth();

  // Función para cargar conversaciones
  const cargarConversaciones = useCallback( async () => {
    try {
      const response = await fetch('http://localhost:5000/api/conversaciones', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversaciones(data);
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    }
  }, [token]);

  // Cargar lista de conversaciones al montar el componente o cuando el token cambie
  useEffect(() => {
    if (!token) return;
    cargarConversaciones();
  }, [token, cargarConversaciones]);

  // Cargar mensajes de la conversación actual
  useEffect(() => { 
    if (!token || !conversacionActual) return;

    const cargarMensajesConversacion = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversaciones/${conversacionActual}/mensajes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.map(msg => ({
            type: msg.tipo,
            text: msg.mensaje
          })));
        }
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      }
    };

    cargarMensajesConversacion();
  }, [token, conversacionActual]);

  // Verifica que haya un usuario autenticado
  if (!token || !usuario) {
    return <Navigate to="/" />;
  }

  // Función para crear una nueva conversación
  const handleNuevaConversacion = async () => {
    try {
      // Llamada al backend para crear una nueva conversación
      const response = await fetch('http://localhost:5000/api/conversaciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newConversation = await response.json();
        // Actualizar la lista de conversaciones
        setConversaciones((prevConversations) => [newConversation, ...prevConversations]);
        // Establecer la nueva conversación como la actual
        setConversacionActual(newConversation.id);
        // Limpiar los mensajes
        setMessages([]);
      } else {
        console.error('Error al crear una nueva conversación');
      }
    } catch (error) {
      console.error('Error al crear una nueva conversación:', error);
    }
  };

  const handleSendMessage = async (messageText, messageType = 'user') => {
    if (messageText.trim() !== '') {
      try {
        const body = {
          mensaje: messageText,
          tipo: messageType,
          conversacionId: conversacionActual,
        };

        // Enviar el mensaje al backend
        const response = await fetch('http://localhost:5000/api/mensajes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        // Si no hay una conversación actual, establecerla
        if (!conversacionActual && data.conversacionId) {
          setConversacionActual(data.conversacionId);
          // Actualizar la lista de conversaciones
          cargarConversaciones();
        }

        // Añade el mensaje al estado
        setMessages((prev) => [...prev, { type: messageType, text: messageText }]);

        if (messageType === 'user') {
          // Verifica si el mensaje es de tipo "Uploaded file:"
          const isUploadMessage = messageText.startsWith("Uploaded file:");
          if (!isUploadMessage) {
            // Llamada al chatbot backend
            const botResponse = await fetch('http://127.0.0.1:5001/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inputCode: messageText }),
            });
            const botData = await botResponse.json();
            const botMessage = botData.response;

            // Guarda el mensaje del bot en el backend
            const botBody = {
              mensaje: botMessage,
              tipo: 'bot',
              conversacionId: conversacionActual,
            };

            await fetch('http://localhost:5000/api/mensajes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(botBody),
            });

            // Añade el mensaje del bot al estado
            setMessages((prev) => [...prev, { type: 'bot', text: botMessage }]);
          }
        }
      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
      }
    }
  };

  return (
    <div className="contenedor-app">
      <BarraLateral 
        conversaciones={conversaciones}
        setConversacionActual={setConversacionActual}
        handleNuevaConversacion={handleNuevaConversacion}
      />
      <div className="contenido-principal">
        <Cabecera />
        <Conversacion messages={messages} />
        <EnviarMensaje onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

// Componente principal
function App() {
  const { token, usuario } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Añadir la ruta al componente Registro */}
        <Route path="/registro" element={<Formularioregistro />} />

        {/* Ruta para el formulario de login */}
        <Route 
          path="/" 
          element={token && usuario ? <Navigate to="/chatbot" /> : <Formulariologin />} 
        />

        {/* Ruta para el chatbot, accesible solo si el usuario está autenticado */}
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Redirección para rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
