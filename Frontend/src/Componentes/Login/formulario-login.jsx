import React from 'react'
import './login.css';
import imgRegistro from './Imagenes/imgRegistro.jpg'



export default function Formulariologin({onRegistroClick}) {
  return (
    <div className='contenedor_form_login'>
        <div className="imagen">
            {/*<h1>Registro de Usuarios</h1>*/}
            <img src={imgRegistro} alt="Doctores" className="form-image"/>
        </div>
        <div className="login-container">
            <form id="loginForm" >
                <h2 className='titulo_login'>Iniciar Sesión</h2>
                <div className="input-group">
                    <label htmlFor="email">E-mail</label>
                    <input type="text" id="email" name="email" required placeholder="Ingrese su e-mail" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Contraseña</label>
                    <input type="password" id="password" name="password" required placeholder="Ingrese su contraseña" />
                </div>
                <div className="input-group">
                    <button type="submit" className='boton-Ingresar'>Ingresar</button>
                </div>
                <div className="regis">
                    <a onClick={(e) => {
                        e.preventDefault();
                        onRegistroClick();
                    }}>Crear una cuenta</a>
                </div>  
                <p id="errorMessage" className="error-message"></p>
            </form>
        </div>
    </div>
  )
}

