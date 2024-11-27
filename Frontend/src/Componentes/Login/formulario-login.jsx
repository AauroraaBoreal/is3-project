import React, { useState } from 'react';
import { useAuth } from '../Chatbot/Context/Contexto_Aunteticacion';
import { useNavigate } from 'react-router-dom';
import './login.css';
import imgRegistro from './Imagenes/imgRegistro.jpg';

export default function Formulariologin() {
  const { login } = useAuth();
  const navigate = useNavigate(); //Aca se inicia el hook useNavigate
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores anteriores
    try {
      // Usar la función login del contexto
      await login(formData.email, formData.password);
      console.log('Inicio de sesión exitoso');

      // Redirigir al chatbot después del inicio de sesión exitoso
      navigate('/chatbot');
    } catch (error) {
      console.error('Error en handleSubmit:', error.response?.data || error.message);
      setError(error.response?.data?.mensaje || 'Error al conectar con el servidor');
    }
  };

  return (
    <div className="contenedor_form_login">
      <div className="imagen">
        <img src={imgRegistro} alt="Doctores" className="form-image" />
      </div>
      <div className="login-container">
        <form id="loginForm" onSubmit={handleSubmit}>
          <h2 className="titulo_login">Iniciar Sesión</h2>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Ingrese su e-mail"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Ingrese su contraseña"
            />
          </div>
          <div className="input-group">
            <button type="submit" className="boton-Ingresar">
              Ingresar
            </button>
          </div>
          {error && <p id="errorMessage" className="error-message">{error}</p>}
          <div className="regis">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/registro');
              }}
            >
              Crear una cuenta
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
