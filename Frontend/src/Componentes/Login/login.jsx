import React, {useState} from 'react' 
import Formulariologin from './formulario-login';
import Formularioregistro from './formulario-registro';

function Login() {
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  return (
    <div>
        {mostrarRegistro ? (
        <Formularioregistro onVolverLogin={() => setMostrarRegistro(false)} />
      ) : (
        <Formulariologin onRegistroClick={() => setMostrarRegistro(true)} />
      )}
    </div>
  );
} 

export default Login;