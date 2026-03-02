/**
 * Signup Page JavaScript with Real-time Validation
 */

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const fnameInput = document.getElementById('fname');
    const lnameInput = document.getElementById('lname');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    let usernameCheckTimeout;
    let emailCheckTimeout;

    // Real-time validation for First Name
    if (fnameInput) {
        fnameInput.addEventListener('blur', function() {
            const result = Validation.validateName(this.value, 'First name');
            if (this.value.trim() !== '') {
                showValidationMessage(this, result.valid, result.message);
            } else {
                clearValidationMessage(this);
            }
        });

        fnameInput.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                const result = Validation.validateName(this.value, 'First name');
                showValidationMessage(this, result.valid, result.message);
            }
        });
    }

    // Real-time validation for Last Name
    if (lnameInput) {
        lnameInput.addEventListener('blur', function() {
            const result = Validation.validateName(this.value, 'Last name');
            if (this.value.trim() !== '') {
                showValidationMessage(this, result.valid, result.message);
            } else {
                clearValidationMessage(this);
            }
        });

        lnameInput.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                const result = Validation.validateName(this.value, 'Last name');
                showValidationMessage(this, result.valid, result.message);
            }
        });
    }

    // Real-time validation for Username
    if (usernameInput) {
        usernameInput.addEventListener('blur', async function() {
            const result = Validation.validateUsername(this.value);
            if (this.value.trim() !== '') {
                if (result.valid) {
                    // Check availability
                    const availability = await Validation.checkUsernameAvailability(this.value);
                    if (!availability.available) {
                        showValidationMessage(this, false, availability.message);
                    } else {
                        showValidationMessage(this, true, availability.message);
                    }
                } else {
                    showValidationMessage(this, false, result.message);
                }
            } else {
                clearValidationMessage(this);
            }
        });

        usernameInput.addEventListener('input', function() {
            clearTimeout(usernameCheckTimeout);
            const result = Validation.validateUsername(this.value);
            
            if (this.value.trim() === '') {
                clearValidationMessage(this);
                return;
            }

            if (!result.valid) {
                showValidationMessage(this, false, result.message);
            } else {
                // Debounce availability check
                usernameCheckTimeout = setTimeout(async () => {
                    const availability = await Validation.checkUsernameAvailability(this.value);
                    if (!availability.available) {
                        showValidationMessage(this, false, availability.message);
                    } else {
                        showValidationMessage(this, true, availability.message);
                    }
                }, 500);
            }
        });
    }

    // Real-time validation for Email
    if (emailInput) {
        emailInput.addEventListener('blur', async function() {
            const result = Validation.validateEmail(this.value);
            if (this.value.trim() !== '') {
                if (result.valid) {
                    // Check if email exists
                    const emailCheck = await Validation.checkEmailExists(this.value);
                    if (emailCheck.exists) {
                        showValidationMessage(this, false, emailCheck.message);
                    } else {
                        showValidationMessage(this, true, 'Email is available');
                    }
                } else {
                    showValidationMessage(this, false, result.message);
                }
            } else {
                clearValidationMessage(this);
            }
        });

        emailInput.addEventListener('input', function() {
            clearTimeout(emailCheckTimeout);
            const result = Validation.validateEmail(this.value);
            
            if (this.value.trim() === '') {
                clearValidationMessage(this);
                return;
            }

            if (!result.valid) {
                showValidationMessage(this, false, result.message);
            } else {
                // Debounce email existence check
                emailCheckTimeout = setTimeout(async () => {
                    const emailCheck = await Validation.checkEmailExists(this.value);
                    if (emailCheck.exists) {
                        showValidationMessage(this, false, emailCheck.message);
                    } else {
                        showValidationMessage(this, true, 'Email is available');
                    }
                }, 500);
            }
        });
    }

    // Real-time validation for Password
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const result = Validation.validatePassword(this.value);
            if (this.value.trim() !== '') {
                showValidationMessage(this, result.valid, result.message);
                showPasswordStrength(this, result.strength);
                
                // Re-validate confirm password if it has a value
                if (confirmPasswordInput.value.trim() !== '') {
                    const matchResult = Validation.validatePasswordMatch(this.value, confirmPasswordInput.value);
                    showValidationMessage(confirmPasswordInput, matchResult.valid, matchResult.message);
                }
            } else {
                clearValidationMessage(this);
                const formGroup = this.closest('.form-group') || this.parentElement;
                const strengthIndicator = formGroup.querySelector('.password-strength');
                if (strengthIndicator) {
                    strengthIndicator.remove();
                }
            }
        });

        passwordInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                clearValidationMessage(this);
            }
        });
    }

    // Real-time validation for Confirm Password
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const result = Validation.validatePasswordMatch(password, this.value);
            if (this.value.trim() !== '') {
                showValidationMessage(this, result.valid, result.message);
            } else {
                clearValidationMessage(this);
            }
        });

        confirmPasswordInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                clearValidationMessage(this);
            }
        });
    }

    // Form submission with final validation
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 

            // Fetching values by ID
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPass = confirmPasswordInput.value;
            const firstName = fnameInput.value.trim();
            const lastName = lnameInput.value.trim();
            const username = usernameInput.value.trim();

            // Validate all fields
            let isValid = true;

            // Validate first name
            const fnameResult = Validation.validateName(firstName, 'First name');
            if (!fnameResult.valid) {
                showValidationMessage(fnameInput, false, fnameResult.message);
                isValid = false;
            }

            // Validate last name
            const lnameResult = Validation.validateName(lastName, 'Last name');
            if (!lnameResult.valid) {
                showValidationMessage(lnameInput, false, lnameResult.message);
                isValid = false;
            }

            // Validate username
            const usernameResult = Validation.validateUsername(username);
            if (!usernameResult.valid) {
                showValidationMessage(usernameInput, false, usernameResult.message);
                isValid = false;
            } else if (usernameExists(username)) {
                showValidationMessage(usernameInput, false, 'This username is already taken');
                isValid = false;
            }

            // Validate email
            const emailResult = Validation.validateEmail(email);
            if (!emailResult.valid) {
                showValidationMessage(emailInput, false, emailResult.message);
                isValid = false;
            } else if (emailExists(email)) {
                showValidationMessage(emailInput, false, 'An account with this email already exists');
                isValid = false;
            }

            // Validate password
            const passwordResult = Validation.validatePassword(password);
            if (!passwordResult.valid) {
                showValidationMessage(passwordInput, false, passwordResult.message);
                isValid = false;
            }

            // Validate password match
            const matchResult = Validation.validatePasswordMatch(password, confirmPass);
            if (!matchResult.valid) {
                showValidationMessage(confirmPasswordInput, false, matchResult.message);
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Hash the password
            const hashedPassword = await hashPassword(password);

            // Create user data object
            const userData = {
                id: Date.now().toString(),
                fullname: `${firstName} ${lastName}`,
                username: username,
                email: email,
                passwordHash: hashedPassword,
                createdAt: new Date().toISOString(),
                isLoggedIn: false 
            };

            // Get existing users array or create new one
            let users = getRegisteredUsers();
            users.push(userData);

            // Save updated users array to localStorage
            if (saveRegisteredUsers(users)) {
                alert(`Account created successfully for ${firstName}! Please login to continue.`);
                window.location.href = 'login.html';
            } else {
                alert("Error saving account. Please try again.");
            }
        });
    }
});

