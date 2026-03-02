/**
 * Form Validation Utilities
 * Real-time validation functions for forms
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation functions
const Validation = {
    // Validate email format
    validateEmail(email) {
        if (!email || email.trim() === '') {
            return { valid: false, message: 'Email is required' };
        }
        if (!EMAIL_REGEX.test(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        return { valid: true, message: '' };
    },

    // Validate password strength
    validatePassword(password) {
        if (!password || password.trim() === '') {
            return { valid: false, message: 'Password is required', strength: 0 };
        }
        
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters', strength: 1 };
        }

        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) {
            feedback.push('Weak password');
        } else if (strength <= 3) {
            feedback.push('Medium strength');
        } else {
            feedback.push('Strong password');
        }

        return { 
            valid: true, 
            message: feedback[0], 
            strength: strength 
        };
    },

    // Validate password match
    validatePasswordMatch(password, confirmPassword) {
        if (!confirmPassword || confirmPassword.trim() === '') {
            return { valid: false, message: 'Please confirm your password' };
        }
        if (password !== confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }
        return { valid: true, message: 'Passwords match' };
    },

    // Validate name (first/last name)
    validateName(name, fieldName = 'Name') {
        if (!name || name.trim() === '') {
            return { valid: false, message: `${fieldName} is required` };
        }
        if (name.trim().length < 2) {
            return { valid: false, message: `${fieldName} must be at least 2 characters` };
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
            return { valid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
        }
        return { valid: true, message: '' };
    },

    // Validate username
    validateUsername(username) {
        if (!username || username.trim() === '') {
            return { valid: false, message: 'Username is required' };
        }
        if (username.trim().length < 3) {
            return { valid: false, message: 'Username must be at least 3 characters' };
        }
        if (username.trim().length > 20) {
            return { valid: false, message: 'Username must be less than 20 characters' };
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
            return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
        }
        return { valid: true, message: '' };
    },

    // Check if username is available (async)
    async checkUsernameAvailability(username) {
        if (!username || username.trim() === '') {
            return { available: false, message: '' };
        }
        
        // Small delay to avoid checking on every keystroke
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (usernameExists(username)) {
            return { available: false, message: 'This username is already taken' };
        }
        return { available: true, message: 'Username is available' };
    },

    // Check if email exists (async)
    async checkEmailExists(email) {
        if (!email || email.trim() === '') {
            return { exists: false, message: '' };
        }
        
        // Small delay to avoid checking on every keystroke
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (emailExists(email)) {
            return { exists: true, message: 'An account with this email already exists' };
        }
        return { exists: false, message: '' };
    }
};

// Helper function to show validation message
function showValidationMessage(input, isValid, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    let messageElement = formGroup.querySelector('.validation-message');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'validation-message';
        formGroup.appendChild(messageElement);
    }

    messageElement.textContent = message;
    messageElement.className = 'validation-message ' + (isValid ? 'success' : 'error');
    
    // Update input classes
    input.classList.remove('valid', 'invalid');
    input.classList.add(isValid ? 'valid' : 'invalid');
}

// Helper function to clear validation message
function clearValidationMessage(input) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    const messageElement = formGroup.querySelector('.validation-message');
    if (messageElement) {
        messageElement.remove();
    }
    input.classList.remove('valid', 'invalid');
}

// Helper function to show password strength indicator
function showPasswordStrength(input, strength) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    let strengthIndicator = formGroup.querySelector('.password-strength');
    
    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        formGroup.appendChild(strengthIndicator);
    }

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    
    strengthIndicator.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const bar = document.createElement('div');
        bar.className = 'strength-bar';
        if (i <= strength) {
            bar.style.backgroundColor = strengthColors[strength] || '#28a745';
        }
        strengthIndicator.appendChild(bar);
    }
    
    if (strength > 0) {
        const label = document.createElement('span');
        label.className = 'strength-label';
        label.textContent = strengthLabels[strength] || '';
        label.style.color = strengthColors[strength] || '#28a745';
        strengthIndicator.appendChild(label);
    }
}

