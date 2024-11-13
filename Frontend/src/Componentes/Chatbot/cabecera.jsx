import React from 'react';


function Cabecera({LoginClick}) {
  return (
    <div className="cabecera">
      <h2 className='page_chat'>Pages / Chat UI</h2>
      <div className="accion-cabecera">
        <input type="text" placeholder="Search" />
        <button onClick={LoginClick}>Iniciar Sesion</button> 
      </div>
    </div>
  );
}

export default Cabecera;
