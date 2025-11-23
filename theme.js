// Theme Management - Dark Mode & Color Themes

let themeSettings = {
    mode: 'light', // light, dark, auto
    color: 'blue'  // blue, purple, green, orange, pink, red
};

// Color theme definitions
const colorThemes = {
    blue: {
        primary: '#6366f1',
        secondary: '#8b5cf6'
    },
    purple: {
        primary: '#8b5cf6',
        secondary: '#a855f7'
    },
    green: {
        primary: '#10b981',
        secondary: '#059669'
    },
    orange: {
        primary: '#f59e0b',
        secondary: '#d97706'
    },
    pink: {
        primary: '#ec4899',
        secondary: '#db2777'
    },
    red: {
        primary: '#ef4444',
        secondary: '#dc2626'
    }
};

// Initialize theme IMMEDIATELY (before DOMContentLoaded to prevent flash)
(function() {
    try {
        loadThemeSettings();
        applyTheme();
    } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to light mode
        document.body.classList.remove('dark-mode');
    }
})();

// Also apply on DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', function() {
    try {
        updateThemeUI();
    } catch (error) {
        console.error('Error updating theme UI:', error);
    }
});

// Load theme settings
function loadThemeSettings() {
    const stored = localStorage.getItem('themeSettings');
    if (stored) {
        themeSettings = JSON.parse(stored);
    } else {
        // Check system preference for dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            themeSettings.mode = 'dark';
        }
    }
}

// Save theme settings
function saveThemeSettings() {
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
}

// Set theme mode
function setThemeMode(mode) {
    themeSettings.mode = mode;
    saveThemeSettings();
    applyTheme();
    updateThemeUI();
    showToast(`🎨 เปลี่ยนเป็น ${mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Auto'} Mode แล้ว`);
}

// Set color theme
function setColorTheme(color) {
    themeSettings.color = color;
    saveThemeSettings();
    applyColorTheme();
    updateColorThemeUI();
    showToast(`🎨 เปลี่ยนสีธีมเป็น ${color} แล้ว`);
}

// Apply theme
function applyTheme() {
    let actualMode = themeSettings.mode;

    // If auto, detect system preference
    if (themeSettings.mode === 'auto') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            actualMode = 'dark';
        } else {
            actualMode = 'light';
        }
    }

    // Apply dark/light mode
    if (actualMode === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Apply color theme
    applyColorTheme();
}

// Apply color theme
function applyColorTheme() {
    const theme = colorThemes[themeSettings.color];
    if (theme) {
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    }
}

// Update theme UI in settings
function updateThemeUI() {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        if (btn.dataset.theme === themeSettings.mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Update color theme UI in settings
function updateColorThemeUI() {
    const buttons = document.querySelectorAll('.color-theme');
    buttons.forEach(btn => {
        if (btn.dataset.color === themeSettings.color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Toast Notifications System
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Loading overlay
function showLoading(message = 'กำลังโหลด...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    text.textContent = message;
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'none';
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (themeSettings.mode === 'auto') {
            applyTheme();
        }
    });
}

// Update settings modal when opened
function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    loadAISettings();
    updateThemeUI();
    updateColorThemeUI();
}
