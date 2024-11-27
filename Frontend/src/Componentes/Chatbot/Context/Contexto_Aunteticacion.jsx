import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [conversacionActual, setConversacionActual] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Validar el token y cargar datos del usuario al iniciar el contexto
  useEffect(() => {
    const validarToken = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const ahora = Date.now() / 1000;

          // Verificar si el token ha expirado
          if (decoded.exp < ahora) {
            logout();
            return;
          }

          // Obtener información del usuario desde el backend
          const response = await axios.get('/api/usuario', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsuario(response.data);
        } catch (error) { 
          console.error('Error al validar el token:', error);
          logout();
        }
      }
      setCargando(false);
    };

    validarToken();
  }, [token]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { token, usuario } = response.data;

      setToken(token);
      setUsuario(usuario);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      throw error; // Permite manejar el error desde el componente que llama a login
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setToken(null);
    setUsuario(null);
    setConversacionActual(null);
    localStorage.removeItem('token');
    console.log('Usuario a salido de sesion!')
  };

  // Función para establecer los datos de autenticación directamente
  const setAuthData = (usuario, token) => {
    setToken(token);
    setUsuario(usuario);
    localStorage.setItem('token', token);
  };

  // Función para cargar las conversaciones del usuario
  const cargarConversaciones = async () => {
    if (token) {
      try {
        const response = await axios.get('/api/conversaciones', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // Devuelve las conversaciones para usarlas en los componentes
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
        throw error;
      }
    }
  };

  // Función para cargar los mensajes de una conversación
  const cargarMensajes = async (conversacionId) => {
    if (token) {
      try {
        const response = await axios.get(`/api/conversaciones/${conversacionId}/mensajes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // Devuelve los mensajes para usarlos en los componentes
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
        throw error;
      }
    }
  };

  // Función para guardar un nuevo mensaje
  const guardarMensaje = async (mensaje, tipo) => {
    if (token) {
      try {
        const response = await axios.post('/api/mensajes', 
          { mensaje, tipo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        console.error('Error al guardar mensaje:', error);
        throw error;
      }
    }
  };

  if (cargando) {
    // Puedes mostrar un spinner o una pantalla de carga mientras se valida el token
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        setAuthData,
        conversacionActual,
        setConversacionActual,
        cargarConversaciones,
        cargarMensajes,
        guardarMensaje,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
