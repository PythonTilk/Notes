document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const passwordInput = document.getElementById('password');
    const passwordStrengthElement = document.getElementById('password-strength');
    
    // Password strength checker
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        checkPasswordStrength(password);
    });
    
    function checkPasswordStrength(password) {
        if (!password) {
            passwordStrengthElement.textContent = '';
            passwordStrengthElement.className = 'password-strength';
            return;
        }
        
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Character variety checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        // Display strength
        passwordStrengthElement.className = 'password-strength';
        
        if (strength < 3) {
            passwordStrengthElement.textContent = 'Weak password';
            passwordStrengthElement.classList.add('weak');
        } else if (strength < 5) {
            passwordStrengthElement.textContent = 'Medium strength password';
            passwordStrengthElement.classList.add('medium');
        } else {
            passwordStrengthElement.textContent = 'Strong password';
            passwordStrengthElement.classList.add('strong');
        }
    }
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Validate password strength
        if (password.length < 8) {
            errorMessage.textContent = 'Password must be at least 8 characters long';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);
        
        // Send register request
        fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message and redirect to login page
                alert(data.message || 'Registration successful! Please check your email to verify your account.');
                window.location.href = '/login?registered=true';
            } else {
                // Show error message
                errorMessage.textContent = data.message || 'Registration failed';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
    });
});