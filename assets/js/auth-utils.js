/**
 * Authentication Utility Functions
 * Shared password hashing and user management utilities
 */

// Password hashing utility using Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Get all registered users from localStorage
function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem('registeredUsers')) || [];
    } catch (error) {
        console.error('Error reading users from localStorage:', error);
        return [];
    }
}

// Save users array to localStorage
function saveRegisteredUsers(users) {
    try {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('Error saving users to localStorage:', error);
        return false;
    }
}

// Find user by email
function findUserByEmail(email) {
    const users = getRegisteredUsers();
    return users.find(user => user.email === email.toLowerCase().trim());
}

// Find user by username
function findUserByUsername(username) {
    const users = getRegisteredUsers();
    return users.find(user => user.username.toLowerCase() === username.toLowerCase().trim());
}

// Check if email exists
function emailExists(email) {
    return findUserByEmail(email) !== undefined;
}

// Check if username exists
function usernameExists(username) {
    return findUserByUsername(username) !== undefined;
}

