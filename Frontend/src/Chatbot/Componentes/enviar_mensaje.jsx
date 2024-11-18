import React, { useState } from 'react';

function Enviarmensaje({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    onSendMessage(inputValue);
    setInputValue(""); // Clear input after sending
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleButtonClick();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Step 1: Inform the user about the file upload
      onSendMessage(`Uploaded file: ${file.name}`);
  
      const formData = new FormData();
      formData.append('file', file);
  
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