/**
 * Login Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Animation and Speed controls logic
    const animationToggle = document.getElementById('animationToggle');
    const gradientBg = document.querySelector('.gradient-bg');
    let animationDuration = 18;

    // Real-time validation for Email
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const result = Validation.validateEmail(this.value);
            if (this.value.trim() !== '') {
                showValidationMessage(this, result.valid, result.message);
            } else {
                clearValidationMessage(this);
            }
        });

        emailInput.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                const result = Validation.validateEmail(this.value);
                if (this.value.trim() !== '') {
                    showValidationMessage(this, result.valid, result.message);
                } else {
                    clearValidationMessage(this);
                }
            }
        });
    }

    // Real-time validation for Password
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                clearValidationMessage(this);
            } else if (this.value.length < 6) {
                showValidationMessage(this, false, 'Password must be at least 6 characters');
            }
        });

        passwordInput.addEventListener('input', function() {
            if (this.value.trim() !== '' && this.value.length < 6) {
                showValidationMessage(this, false, 'Password must be at least 6 characters');
            } else if (this.value.length >= 6) {
                clearValidationMessage(this);
            }
        });
    }

    // Login Logic
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        // Validate fields
        let isValid = true;

        const emailResult = Validation.validateEmail(email);
        if (!emailResult.valid) {
            showValidationMessage(emailInput, false, emailResult.message);
            isValid = false;
        }

        if (!password || password.length < 6) {
            showValidationMessage(passwordInput, false, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Get all registered users
        let users = getRegisteredUsers();

        // Check if users array is empty
        if (users.length === 0) {
            showValidationMessage(emailInput, false, 'No accounts found. Please sign up first!');
            return;
        }

        // Find user by email
        const user = findUserByEmail(email);

        if (!user) {
            showValidationMessage(emailInput, false, 'Invalid email or password');
            showValidationMessage(passwordInput, false, 'Invalid email or password');
            return;
        }

        // Hash the entered password and compare with stored hash
        const hashedPassword = await hashPassword(password);

        if (hashedPassword === user.passwordHash) {
            // Update user's login status
            user.isLoggedIn = true;
            user.lastLogin = new Date().toISOString();
            
            // Update user in array
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                saveRegisteredUsers(users);
            }

            // Set active user (without password hash for security)
            const activeUser = {
                id: user.id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                isLoggedIn: true
            };
            localStorage.setItem('activeUser', JSON.stringify(activeUser));

            // Handle "Remember me" checkbox
            const rememberMe = document.getElementById('remember').checked;
            if (rememberMe) {
                // Store expiration date (30 days from now)
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 30);
                activeUser.expiresAt = expirationDate.toISOString();
                localStorage.setItem('activeUser', JSON.stringify(activeUser));
            }

            window.location.href = 'index.html';
        } else {
            showValidationMessage(emailInput, false, 'Invalid email or password');
            showValidationMessage(passwordInput, false, 'Invalid email or password');
        }
    });
    

    // Animation Controls
    if (animationToggle) {
        animationToggle.addEventListener('change', function() {
            if (this.checked) {
                gradientBg.style.animation = `gradient ${animationDuration}s ease infinite`;
            } else {
                gradientBg.style.animation = 'none';
            }
        });
    }

    const speedDown = document.getElementById('speedDown');
    const speedUp = document.getElementById('speedUp');
    const speedDisplay = document.getElementById('speedDisplay');

    if (speedDown) {
        speedDown.addEventListener('click', function() {
            if (animationDuration > 6) {
                animationDuration -= 2;
                updateAnimationSpeed();
            }
        });
    }

    if (speedUp) {
        speedUp.addEventListener('click', function() {
            if (animationDuration < 30) {
                animationDuration += 2;
                updateAnimationSpeed();
            }
        });
    }

    function updateAnimationSpeed() {
        if (animationToggle && animationToggle.checked) {
            gradientBg.style.animation = `gradient ${animationDuration}s ease infinite`;
        }
        if (speedDisplay) {
            speedDisplay.textContent = `${animationDuration}s`;
        }
    }

    // Check if user session expired (for "Remember me" feature)
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (activeUser && activeUser.expiresAt) {
        const expirationDate = new Date(activeUser.expiresAt);
        if (new Date() > expirationDate) {
            localStorage.removeItem('activeUser');
        }
    }
});

