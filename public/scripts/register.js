document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login';
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed: ' + error.message);
    });
});
