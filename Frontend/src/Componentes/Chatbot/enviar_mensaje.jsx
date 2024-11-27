import React, { useState } from 'react';

function Enviarmensaje({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, 'user');
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleButtonClick();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Indicar que se está cargando el archivo
      setUploading(true);
      onSendMessage(`Uploaded file: ${file.name}`, 'user');

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://127.0.0.1:5001/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.error) {
          onSendMessage(`Error: ${data.error}`, 'bot');
        } else {
          const extractedInfo = data.medicamentos
            .map(
              (med) =>
                `${med.medicamento}: ${med.dosis || "Detalles no disponibles"}`
            )
            .join("\n");
          const responseMessage = `
            Información Extraída:

            Condición: ${data.condicion || "No identificada"}
            Edad: ${data.edad || "No identificada"}
            Fecha: ${data.fecha || "No identificada"}
            Sexo: ${data.sexo || "No identificado"}
            Medicamentos:
            ${extractedInfo}
          `;

          // Enviar la respuesta formateada
          onSendMessage(responseMessage.trim(), 'bot');
        }
      } catch (error) {
        console.error("Error al cargar el archivo:", error);
        onSendMessage("Error al cargar el archivo.", 'bot');
      } finally {
        // Indicar que se ha terminado de cargar el archivo
        setUploading(false);
      }
    }
  };

  return (
    <div className="enviar-mensaje">
      <div className="upload-button">
        {uploading && <div className="upload-bar">Cargando archivo...</div>}
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload" className='carpeta'>
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
      <button onClick={handleButtonClick}>Enviar</button>
    </div>
  );
}

export default Enviarmensaje;
