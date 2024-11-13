import React from "react";
import ImgRegistro from './Imagenes/imgRegistro.jpg'

export default function Formularioregistro({onVolverLogin}){
    return(
        <div className="registro-container">
            <div class="left-section">
                <h1>Registro de Usuarios</h1>
                <img src={ImgRegistro} alt="doctores" class="form-image" />

            </div>
            <div class="right-section">
                <h2>¡Empezar a usar ChatHealth!</h2>
                <form id="registrationForm" className="Formulario-Registro">
                    <label for="nombres">Nombres:</label>
                    <input type="text" id="nombres" name="nombres" required />

                    <label for="nombreUsuario">Nombre de Usuario:</label>
                    <input type="text" id="nombreUsuario" name="nombreUsuario" required minlength="3" maxlength="20" title="Debe tener entre 3 y 20 caracteres"/>

                    <label for="email">Correo electrónico:</label>
                    <input type="email" id="email" name="email" required pattern="^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$" title="Solo se permiten correos de Gmail o Hotmail"/>

                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required pattern="(?=.*\d)(?=.*[a-zA-Z]).{8,}" title="La contraseña debe tener al menos 8 caracteres, incluyendo letras y números"/>

                    <label for="fechaNacimiento">Fecha de nacimiento:</label>
                    <input type="date" id="fechaNacimiento" name="fechaNacimiento" required />

                    <label for="sexo">Sexo:</label>
                    <select id="sexo" name="sexo" required>
                        <option value="">Seleccione...</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                    </select>

                    <div class="checkbox-label">
                        <input type="checkbox" id="terminos" name="terminos"/>
                        <label for="terminos">Acepto los <a  >términos y condiciones</a>.</label>
                    </div>
                
                    <div class="checkbox-label">
                        <input type="checkbox" id="tratamiento" name="tratamiento"/>
                        <label for="tratamiento">Autorizo el tratamiento de mis datos personales.</label>
                    </div>
                
                    <div class="checkbox-label">
                        <input type="checkbox" id="tratamiento" name="tratamiento"/>
                        <label htmlFor="terceros">Consentimiento para compartir datos con terceros.</label>
                    </div>

                    <button type="submit">Registrarse</button>
                </form>

                <div class="signup">
                    <p>¿Ya tienes una cuenta? <a  onClick={(e) => {
                        e.preventDefault();
                        onVolverLogin();
                    }}>Iniciar sesión</a></p>
                </div>
            </div>
        </div>
    )
}