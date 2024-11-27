import React from 'react';
import { useAuth } from './Context/Contexto_Aunteticacion';


function Cabecera({LoginClick}) {

  const {usuario, logout} = useAuth();

  return (
    <div className="cabecera">
      <h2 className='page_chat'>Pages / Chat Health</h2>
      <div className="accion-cabecera">
        <input type="text" placeholder="Search" />
        {usuario ?  (
          <button onClick={logout} className='cerrar-sesion'>Cerrar Sesion</button>
        ) : (
        
        <button onClick={LoginClick}>Iniciar Sesion</button> 

        )}
        
      </div>
    </div>
  );
}

export default Cabecera;
