document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const resendVerificationLink = document.getElementById('resend-verification-link');
    const verificationForm = document.getElementById('verification-form');
    const sendVerificationBtn = document.getElementById('send-verification-btn');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Create form data
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        // Send login request
        fetch('/api/auth/login', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to board page
                window.location.href = '/board';
            } else {
                // Show error message
                errorMessage.textContent = data.message || 'Invalid username or password';
                errorMessage.style.display = 'block';
                
                // If email verification is needed, pre-fill the email field
                if (data.needsVerification && data.email) {
                    document.getElementById('verification-email').value = data.email;
                    verificationForm.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
    });
    
    // Resend verification email link
    resendVerificationLink.addEventListener('click', function(e) {
        e.preventDefault();
        verificationForm.style.display = verificationForm.style.display === 'none' ? 'block' : 'none';
    });
    
    // Send verification email button
    sendVerificationBtn.addEventListener('click', function() {
        const email = document.getElementById('verification-email').value;
        
        if (!email) {
            errorMessage.textContent = 'Please enter your email address';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('email', email);
        
        // Send resend verification request
        fetch('/api/auth/resend-verification', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
                alert(data.message || 'Verification email sent! Please check your inbox.');
                verificationForm.style.display = 'none';
            } else {
                errorMessage.textContent = data.message || 'Failed to send verification email';
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