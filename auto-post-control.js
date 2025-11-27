// Auto-Post Control - Simple UI for controlling auto-posting
// ควบคุม Auto-Post ด้วยปุ่มเดียว ง่ายและชัดเจน

// Toggle Auto-Post on/off
function toggleAutoPost() {
    if (typeof autoPostManager === 'undefined') {
        showToast('⚠️ Auto-Post Manager ยังไม่พร้อม กรุณารอสักครู่', 'warning');
        return;
    }

    const isRunning = autoPostManager.isRunning;

    if (isRunning) {
        // Stop auto-posting
        stopAutoPost();
    } else {
        // Start auto-posting
        startAutoPost();
    }
}

// Start Auto-Post
function startAutoPost() {
    // ตรวจสอบความพร้อม
    const readiness = checkAutoPostReadiness();

    if (!readiness.ready) {
        showAutoPostSetupModal(readiness.missing);
        return;
    }

    // Confirm before starting
    if (confirm('🚀 เริ่ม Auto-Post?\n\nระบบจะทำงานอัตโนมัติ 24/7:\n- สร้าง content\n- สร้าง videos\n- โพสต์ไปทุก platforms\n\nต้องการเริ่มเลยไหม?')) {

        showLoading('กำลังเริ่มระบบ Auto-Post...');

        setTimeout(() => {
            autoPostManager.enable();
            updateAutoPostUI(true);
            hideLoading();

            showToast('✅ Auto-Post เริ่มทำงานแล้ว!', 'success');

            // แสดง notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🚀 Auto-Post Started', {
                    body: 'ระบบกำลังทำงานอัตโนมัติแล้ว',
                    icon: '/icon-192.png'
                });
            }
        }, 1000);
    }
}

// Stop Auto-Post
function stopAutoPost() {
    if (confirm('⏸️ หยุด Auto-Post?\n\nระบบจะหยุดทำงานทันที')) {

        showLoading('กำลังหยุดระบบ...');

        setTimeout(() => {
            autoPostManager.disable();
            updateAutoPostUI(false);
            hideLoading();

            showToast('⏸️ Auto-Post หยุดทำงานแล้ว', 'info');
        }, 500);
    }
}

// Check if Auto-Post is ready
function checkAutoPostReadiness() {
    const missing = [];

    // ตรวจสอบ API Key
    const openaiKey = localStorage.getItem('openai_api_key');
    if (!openaiKey) {
        missing.push({
            name: 'OpenAI API Key',
            description: 'สำหรับสร้าง content',
            action: 'ไปที่ Settings → AI Configuration'
        });
    }

    // ตรวจสอบ config
    const config = autoPostManager.config;

    if (!config.videosPerDay || config.videosPerDay < 1) {
        missing.push({
            name: 'Videos per Day',
            description: 'กำหนดจำนวน videos/วัน',
            action: 'ตั้งค่าใน Auto-Post Settings'
        });
    }

    if (!config.platforms || config.platforms.length === 0) {
        missing.push({
            name: 'Target Platforms',
            description: 'เลือก platforms ที่จะโพสต์',
            action: 'ตั้งค่าใน Auto-Post Settings'
        });
    }

    return {
        ready: missing.length === 0,
        missing: missing
    };
}

// Show setup modal
function showAutoPostSetupModal(missing) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'autoPostSetupModal';
    modal.style.display = 'block';

    let missingHtml = missing.map(item => `
        <div class="setup-item">
            <div class="setup-icon">⚠️</div>
            <div class="setup-details">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <small>${item.action}</small>
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAutoPostSetup()">&times;</span>
            <h2>⚙️ ตั้งค่า Auto-Post</h2>
            <p class="info-text">กรุณาตั้งค่าต่อไปนี้ก่อนเริ่มใช้งาน:</p>

            <div class="setup-list">
                ${missingHtml}
            </div>

            <div class="modal-actions">
                <button class="btn btn-primary" onclick="openAutoPostSettings()">
                    ⚙️ ไปตั้งค่า
                </button>
                <button class="btn btn-secondary" onclick="closeAutoPostSetup()">
                    ปิด
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeAutoPostSetup() {
    const modal = document.getElementById('autoPostSetupModal');
    if (modal) modal.remove();
}

function openAutoPostSettings() {
    closeAutoPostSetup();
    openSettings();

    // Scroll to Auto-Post section (ถ้ามี)
    setTimeout(() => {
        const section = document.querySelector('.auto-post-settings');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }, 300);
}

// Update UI
function updateAutoPostUI(isRunning) {
    const toggleBtn = document.getElementById('autoPostToggle');
    const icon = document.getElementById('autoPostIcon');
    const text = document.getElementById('autoPostText');
    const status = document.getElementById('autoPostStatus');

    if (!toggleBtn) return;

    if (isRunning) {
        // Running state
        toggleBtn.className = 'btn btn-danger';
        icon.textContent = '⏸️';
        text.textContent = 'Stop Auto-Post';

        if (status) {
            status.textContent = '🟢 Running';
            status.className = 'status-badge status-running';
            status.style.display = 'inline-block';
        }
    } else {
        // Stopped state
        toggleBtn.className = 'btn btn-primary';
        icon.textContent = '▶️';
        text.textContent = 'Start Auto-Post';

        if (status) {
            status.textContent = '⚪ Stopped';
            status.className = 'status-badge status-stopped';
            status.style.display = 'inline-block';
        }
    }
}

// Initialize on page load
function initAutoPostControl() {
    // รอให้ autoPostManager โหลด
    if (typeof autoPostManager !== 'undefined') {
        updateAutoPostUI(autoPostManager.isRunning);
    } else {
        // ลองใหม่หลัง 1 วินาที
        setTimeout(initAutoPostControl, 1000);
    }
}

// Auto-initialize
window.addEventListener('load', () => {
    setTimeout(initAutoPostControl, 2000);
});

// Update UI every 5 seconds
setInterval(() => {
    if (typeof autoPostManager !== 'undefined') {
        updateAutoPostUI(autoPostManager.isRunning);
    }
}, 5000);

console.log('🎮 Auto-Post Control loaded');
