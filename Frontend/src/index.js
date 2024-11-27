import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './Componentes/Chatbot/Context/Contexto_Aunteticacion.jsx';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <AuthProvider>
      <App />
    </AuthProvider>
 
);


