/**
 * Accessibility Utilities
 * Keyboard navigation, focus management, and ARIA helpers
 */

// Focus trap for modals
function trapFocus(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element when modal opens
    if (firstElement) {
        firstElement.focus();
    }
    
    // Handle Tab key
    function handleTabKey(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    // Handle Escape key
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
    
    function closeModal() {
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Remove event listeners
        modalElement.removeEventListener('keydown', handleTabKey);
        modalElement.removeEventListener('keydown', handleEscapeKey);
        
        // Return focus to trigger element
        const trigger = document.activeElement;
        if (trigger) {
            trigger.focus();
        }
    }
    
    // Add event listeners
    modalElement.addEventListener('keydown', handleTabKey);
    modalElement.addEventListener('keydown', handleEscapeKey);
    
    // Store close function for external use
    modalElement._closeModal = closeModal;
    
    return closeModal;
}

// Open modal with accessibility features
function openModal(modalElement, triggerElement) {
    modalElement.style.display = 'flex';
    modalElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Trap focus
    trapFocus(modalElement);
}

// Close modal with accessibility features
function closeModal(modalElement) {
    if (modalElement._closeModal) {
        modalElement._closeModal();
    } else {
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Announce to screen readers
function announceToScreenReader(message, priority = 'polite') {
    let announcement = document.getElementById('aria-live-announcements');
    
    if (!announcement) {
        announcement = document.createElement('div');
        announcement.id = 'aria-live-announcements';
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        document.body.appendChild(announcement);
    }
    
    announcement.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
        announcement.textContent = '';
    }, 1000);
}

// Initialize skip navigation
function initSkipNavigation() {
    const skipLink = document.getElementById('skip-navigation');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Remove tabindex after focus
                setTimeout(() => {
                    target.removeAttribute('tabindex');
                }, 1000);
            }
        });
    }
}

// Make buttons keyboard accessible
function makeButtonAccessible(button, label) {
    if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
        button.setAttribute('aria-label', label);
    }
    
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
        }
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initSkipNavigation();
    
    // Make all icon-only buttons accessible
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
        const icon = button.querySelector('i');
        if (icon && !button.textContent.trim()) {
            const iconClass = icon.className;
            let label = 'Button';
            
            if (iconClass.includes('search')) label = 'Search';
            else if (iconClass.includes('cart') || iconClass.includes('shopping')) label = 'Shopping cart';
            else if (iconClass.includes('user')) label = 'User account';
            else if (iconClass.includes('close') || iconClass.includes('times')) label = 'Close';
            else if (iconClass.includes('menu')) label = 'Menu';
            
            button.setAttribute('aria-label', label);
        }
    });
});

