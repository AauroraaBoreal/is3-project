import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Chatbot/Context/Contexto_Aunteticacion';
import ImgRegistro from './Imagenes/imgRegistro.jpg'



export default function Formularioregistro(){
    const [formData, setFormData] = useState({
        nombres: '',
        nombreUsuario: '',
        email: '',
        password: '',
        fechaNacimiento: '',
        sexo: '',
        terminos: false,
        tratamientoDatos: false,
        consentimientoTerceros: false,
      });
      const [error, setError] = useState('');
      const { setAuthData } = useAuth(); // Usaremos setAuthData para actualizar el contexto
      const navigate = useNavigate();

    // Función para manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        }));
    };
    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
        const response = await fetch('http://localhost:5000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al registrar usuario');
        }

        const data = await response.json();
        const { token, usuario } = data;

        // Actualizar el contexto de autenticación
        setAuthData(usuario, token);

        // Redirigir al chatbot
        navigate('/chatbot');
        } catch (error) {
        console.error('Error en el registro:', error);
        setError(error.message);
        }
    };

    
    return(
        <div className="registro-container">
            <div class="left-section">
                <h1>Registro de Usuarios</h1>
                <img src={ImgRegistro} alt="doctores" class="form-image" />

            </div>
            <div class="right-section">
                <h2>¡Empezar a usar ChatHealth!</h2>
                <form id="registrationForm" className="Formulario-Registro" onSubmit={handleSubmit}>
                    <label for="nombres">Nombres:</label>
                    <input type="text" id="nombres" name="nombres" value={formData.nombres} onChange={handleChange} required />

                    <label for="nombreUsuario">Nombre de Usuario:</label>
                    <input type="text" id="nombreUsuario" name="nombreUsuario" checked={formData.nombreUsuario} onChange={handleChange} required minlength="3" maxlength="20" title="Debe tener entre 3 y 20 caracteres"/>

                    <label for="email">Correo electrónico:</label>
                    <input type="email" id="email" name="email" checked={formData.email} onChange={handleChange} required pattern="^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$" title="Solo se permiten correos de Gmail o Hotmail"/>

                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" checked={formData.password} onChange={handleChange} required pattern="(?=.*\d)(?=.*[a-zA-Z]).{8,}" title="La contraseña debe tener al menos 8 caracteres, incluyendo letras y números"/>

                    <label for="fechaNacimiento">Fecha de nacimiento:</label>
                    <input type="date" id="fechaNacimiento" name="fechaNacimiento" checked={formData.fechaNacimiento} onChange={handleChange} required />

                    <label for="sexo">Sexo:</label>
                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required>
                        <option value="">Seleccione...</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                    </select>

                    <div class="checkbox-label">
                        <input type="checkbox" id="terminos" name="terminos" checked={formData.terminos} onChange={handleChange}/>
                        <label htmlFor="terminos">Acepto los <a  href="#">términos y condiciones</a>.</label>
                    </div>
                
                    <div class="checkbox-label">
                        <input type="checkbox" id="tratamiento" name="tratamiento" checked={formData.tratamientoDatos} onChange={handleChange}/>
                        <label htmlFor="tratamientoDatos">Autorizo el tratamiento de mis datos personales.</label>
                    </div>
                
                    <div class="checkbox-label">
                        <input type="checkbox" id="consentimientoTerceros" name="consentimientoTerceros" checked={formData.consentimientoTerceros} onChange={handleChange}/>
                        <label htmlFor="consentimientoTerceros">Consentimiento para compartir datos con terceros.</label>
                    </div>

                    <button type="submit">Registrarse</button>
                </form>

                <div class="signup">
                    <p>
                        ¿Ya tienes una cuenta? 
                        <a  onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                    }}>Iniciar sesión</a></p>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    )
}