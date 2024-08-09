document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        // Si el login es exitoso, redirigir a la página de exámenes
        window.location.href = '/examen'; // Ajusta este enlace según la estructura de tu sitio
    } else {
        alert('Login failed. Please check your username and password.');
    }
});
