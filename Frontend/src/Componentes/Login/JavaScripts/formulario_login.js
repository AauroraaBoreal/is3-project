document.getElementById("loginForm").addEventListener("submit", function(event) {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var errorMessage = document.getElementById("errorMessage");

    if (username === "" || password === "") {
        event.preventDefault(); // Evita que se envíe el formulario
        errorMessage.textContent = "Por favor, llena todos los campos.";
    } else {
        errorMessage.textContent = "";
    }
});