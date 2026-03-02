/**
 * Forgot Password Page JavaScript with Real-time Validation
 */

document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetForm');
    const emailInput = document.getElementById('resetEmail');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');

    let emailCheckTimeout;

    // Real-time validation for Email
    if (emailInput) {
        emailInput.addEventListener('blur', async function() {
            const result = Validation.validateEmail(this.value);
            if (this.value.trim() !== '') {
                if (result.valid) {
                    // Check if email exists
                    const emailCheck = await Validation.checkEmailExists(this.value);
                    if (emailCheck.exists) {
                        showValidationMessage(this, true, 'Email found');
                    } else {
                        showValidationMessage(this, false, 'No account found with this email');
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
                        showValidationMessage(this, true, 'Email found');
                    } else {
                        showValidationMessage(this, false, 'No account found with this email');
                    }
                }, 500);
            }
        });
    }

    // Real-time validation for New Password
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
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

        newPasswordInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                clearValidationMessage(this);
            }
        });
    }

    // Real-time validation for Confirm Password
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = newPasswordInput.value;
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
    if (resetForm) {
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = emailInput.value.trim().toLowerCase();
            const newPass = newPasswordInput.value;
            const confirmPass = confirmPasswordInput.value;

            // Validate all fields
            let isValid = true;

            // Validate email
            const emailResult = Validation.validateEmail(email);
            if (!emailResult.valid) {
                showValidationMessage(emailInput, false, emailResult.message);
                isValid = false;
            } else if (!emailExists(email)) {
                showValidationMessage(emailInput, false, 'No account found with this email address');
                isValid = false;
            }

            // Validate password
            const passwordResult = Validation.validatePassword(newPass);
            if (!passwordResult.valid) {
                showValidationMessage(newPasswordInput, false, passwordResult.message);
                isValid = false;
            }

            // Validate password match
            const matchResult = Validation.validatePasswordMatch(newPass, confirmPass);
            if (!matchResult.valid) {
                showValidationMessage(confirmPasswordInput, false, matchResult.message);
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Get all registered users
            let users = getRegisteredUsers();

            // Find user by email
            const userIndex = users.findIndex(user => user.email === email);

            if (userIndex === -1) {
                showValidationMessage(emailInput, false, 'No account found with this email address');
                return;
            }

            // Hash the new password
            const hashedPassword = await hashPassword(newPass);

            // Update the password hash in the users array
            users[userIndex].passwordHash = hashedPassword;
            users[userIndex].passwordUpdatedAt = new Date().toISOString();

            // Save updated users array back to localStorage
            if (saveRegisteredUsers(users)) {
                alert("Success! Your password has been updated.");
                window.location.href = 'login.html';
            } else {
                alert("Error updating password. Please try again.");
            }
        });
    }
});

