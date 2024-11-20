import React, { useState } from 'react';

function Enviarmensaje({ onSendMessage }) {
  // Recibe 'onSendMessage' como prop para manejar el envio de mensajes

  const [inputValue, setInputValue] = useState("");
  // Controlar el valor del campo de entrada de texto
  const [uploading, setUploading] = useState(false);
  // Estado para mostrar un indicador mientras se sube un archivo

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Actualiza el estado 'inputValue' con el valor del campo de entrada.
  };

  const handleButtonClick = () => {
    onSendMessage(inputValue);
    // Llama a la función pasando el mensaje del usuario
    setInputValue(""); // Limpia el input despues de enviar
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Detecta si se presiona la tecla "Enter"
      handleButtonClick();
      // Llama a la funcion para enviar el mensaje
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    // Obtiene el archivo seleccionado por el usuario
    if (file) {
      // Comprueba si un archivo fue seleccionado.
      onSendMessage(`Uploaded file: ${file.name}`);
      // Informa al usuario sobre el archivo subido
  
      const formData = new FormData();
      // Crea un objeto para enviar el archivo

      formData.append('file', file);
      // Añade el archivo al objeto
  
      try {
        // Step 2: Send the file to the backend
        const response = await fetch('http://127.0.0.1:5001/upload', {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
  
        if (data.error) {
          // Step 3a: Send an error message if something goes wrong
          onSendMessage(`Error: ${data.error}`);
        } else {
          // Step 3b: Format the extracted information and send it as a bot message
          const extractedInfo = data.medicamentos
            .map(
              (med) =>
                `${med.medicamento}: ${med.dosis || "Details not available"}`
            )
            .join("\n");
          const responseMessage = `
            Extracted Info:\n
            Condition: ${data.condicion || "Not Identified"}\n
            Age: ${data.edad || "Not Identified"}\n
            Date: ${data.fecha || "Not Identified"}\n
            Sex: ${data.sexo || "Not Identified"}\n
            Medications:\n${extractedInfo}
          `;
  
          // Send the formatted response
          onSendMessage(responseMessage.trim());
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        onSendMessage("Error uploading file.");
      }
    }
  };

  return (
    <div className="enviar-mensaje">
      <div className="upload-button">
        {uploading && <div className="upload-bar">Uploading file...</div>}
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          📁
        </label>
      </div>
      <input
        type="text"
        placeholder="Escribe el mensaje..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleButtonClick}>Submit</button>
    </div>
  );
}

export default Enviarmensaje;