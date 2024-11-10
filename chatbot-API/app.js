async function sendMessageToChatbot(message) {
    const response = await fetch('http://127.0.0.1:5001/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
    });
    
    const data = await response.json();
    return data.response;
}

// Llamada a la función cuando el usuario envía un mensaje
document.getElementById('sendButton').addEventListener('click', async () => {
    const message = document.getElementById('inputMessage').value;
    const chatbotResponse = await sendMessageToChatbot(message);
    // Mostrar la respuesta en la interfaz
    document.getElementById('chatBox').innerHTML += `<p>${chatbotResponse}</p>`;
});