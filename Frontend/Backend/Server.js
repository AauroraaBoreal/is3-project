const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Permitir solicitudes desde el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
}));
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'registrodb'
});

// Estructura de la base de datos: /(Si no han creado la base de datos!!)
/*
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100),
    nombre_usuario VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    PASSWORD VARCHAR(255),
    fecha_nacimiento DATE,
    sexo ENUM('masculino', 'femenino', 'otro'),
    terminos_aceptados BOOLEAN DEFAULT FALSE,
    tratamiento_datos BOOLEAN DEFAULT FALSE,
    consentimiento_terceros BOOLEAN DEFAULT FALSE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE mensajes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversacion_id INT,
    tipo ENUM('user', 'bot'),
    mensaje TEXT,
    fecha_mensaje DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id)
);
*/

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensaje: 'No hay token proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'tu_clave_secreta');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

// Ruta de login
app.post('/api/login', async (req, res) => {
  console.log('Solicitud de login recibida:', req.body);
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      if (results.length === 0) {
        console.log('Usuario no encontrado:', email);
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      } 

      const usuario = results[0];
      const passwordValida = await bcrypt.compare(password, usuario.password);

      if (!passwordValida) {
        console.log('Contraseña incorrecta para el usuario:', email);
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        'tu_clave_secreta',
        { expiresIn: '24h' }
      );
      console.log('Usuario autenticado:', usuario.email);
      res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
    }
  );
});


// Ruta para obtener información del usuario autenticado
app.get('/api/usuario', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    'SELECT id, nombres, nombre_usuario, email, fecha_nacimiento, sexo FROM usuarios WHERE id = ?',
    [usuarioId],
    (error, results) => {
      if (error) {
        console.error('Error al obtener información del usuario:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      const usuario = results[0];
      res.json(usuario);
    }
  );
});


// Ruta para guardar mensajes
app.post('/api/mensajes', verificarToken, (req, res) => {
  const { mensaje, tipo, conversacionId } = req.body;
  const usuarioId = req.usuario.id;

  const guardarMensaje = (conversacionId) => {
    db.query(
      'INSERT INTO mensajes (conversacion_id, tipo, mensaje) VALUES (?, ?, ?)',
      [conversacionId, tipo, mensaje],
      (error) => {
        if (error) {
          return res.status(500).json({ mensaje: 'Error al guardar mensaje' });
        }
        res.json({ mensaje: 'Mensaje guardado exitosamente', conversacionId });
      }
    );
  };

  if (conversacionId) {
    // Verificar que la conversación pertenece al usuario
    db.query(
      'SELECT * FROM conversaciones WHERE id = ? AND usuario_id = ?',
      [conversacionId, usuarioId],
      (error, results) => {
        if (error) {
          return res.status(500).json({ mensaje: 'Error en el servidor' });
        }
        if (results.length === 0) {
          return res.status(403).json({ mensaje: 'Acceso no autorizado a esta conversación' });
        }
        guardarMensaje(conversacionId);
      }
    );
  } else {
    // Crear nueva conversación
    db.query(
      'INSERT INTO conversaciones (usuario_id) VALUES (?)',
      [usuarioId],
      (error, result) => {
        if (error) {
          return res.status(500).json({ mensaje: 'Error al crear conversación' });
        }
        const newConversacionId = result.insertId;
        guardarMensaje(newConversacionId);
      }
    );
  }
});

// Ruta para obtener conversaciones del usuario
app.get('/api/conversaciones', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT c.id, c.fecha_inicio, 
     (SELECT mensaje FROM mensajes WHERE conversacion_id = c.id ORDER BY fecha_mensaje ASC LIMIT 1) as primer_mensaje
     FROM conversaciones c 
     WHERE c.usuario_id = ?
     ORDER BY c.fecha_inicio DESC`,
    [usuarioId],
    (error, results) => {
      if (error) {
        return res.status(500).json({ mensaje: 'Error al obtener conversaciones' });
      }
      res.json(results);
    }
  );
});

// Ruta para crear una nueva conversación
app.post('/api/conversaciones', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    'INSERT INTO conversaciones (usuario_id) VALUES (?)',
    [usuarioId],
    (error, result) => {
      if (error) {
        return res.status(500).json({ mensaje: 'Error al crear conversación' });
      }
      const conversacionId = result.insertId;
      res.status(201).json({ 
        id: conversacionId, 
        usuario_id: usuarioId, 
        fecha_inicio: new Date().toISOString() // Convertimos a ISO string para consistencia
      });
    }
  );
});

// Ruta para obtener mensajes de una conversación
app.get('/api/conversaciones/:id/mensajes', verificarToken, (req, res) => {
  const conversacionId = req.params.id;
  const usuarioId = req.usuario.id;

  // Verificar que la conversación pertenece al usuario
  db.query(
    'SELECT * FROM conversaciones WHERE id = ? AND usuario_id = ?',
    [conversacionId, usuarioId],
    (error, results) => {
      if (error || results.length === 0) {
        return res.status(403).json({ mensaje: 'Acceso no autorizado' });
      }

      db.query(
        'SELECT * FROM mensajes WHERE conversacion_id = ? ORDER BY fecha_mensaje ASC',
        [conversacionId],
        (error, mensajes) => {
          if (error) {
            return res.status(500).json({ mensaje: 'Error al obtener mensajes' });
          }
          res.json(mensajes);
        }
      );
    }
  );
});

// Ruta de registro
app.post('/api/registro', async (req, res) => {
  const {
    nombres,
    nombreUsuario,
    email,
    password,
    fechaNacimiento,
    sexo,
    terminos,
    tratamientoDatos,
    consentimientoTerceros
  } = req.body;

  // Validaciones básicas
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$/;
  const passwordRegex = /(?=.*\d)(?=.*[a-zA-Z]).{8,}/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensaje: 'El correo debe ser de Gmail o Hotmail' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      mensaje: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números' 
    });
  }

  try {
    // Verificar si el email ya existe
    db.query('SELECT id FROM usuarios WHERE email = ?', [email], async (error, results) => {
      if (error) {
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      if (results.length > 0) {
        return res.status(400).json({ mensaje: 'El email ya está registrado' });
      }

      // Verificar si el nombre de usuario ya existe
      db.query('SELECT id FROM usuarios WHERE nombre_usuario = ?', [nombreUsuario], async (error, results) => {
        if (error) {
          return res.status(500).json({ mensaje: 'Error en el servidor' });
        }

        if (results.length > 0) {
          return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        db.query(
          `INSERT INTO usuarios (
            nombres, 
            nombre_usuario, 
            email, 
            password, 
            fecha_nacimiento, 
            sexo, 
            terminos_aceptados, 
            tratamiento_datos, 
            consentimiento_terceros
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nombres,
            nombreUsuario,
            email,
            hashedPassword,
            fechaNacimiento,
            sexo,
            terminos,
            tratamientoDatos,
            consentimientoTerceros
          ],
          (error, result) => {
            if (error) {
              return res.status(500).json({ 
                mensaje: 'Error al registrar usuario',
                error: error.message 
              });
            }

            // Generar token para el nuevo usuario
            const token = jwt.sign(
              { id: result.insertId, email },
              'tu_clave_secreta',
              { expiresIn: '24h' }
            );

            res.status(201).json({
              mensaje: 'Usuario registrado exitosamente',
              token,
              usuario: {
                id: result.insertId,
                nombres,
                email
              }
            });
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ 
      mensaje: 'Error en el servidor',
      error: error.message 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});