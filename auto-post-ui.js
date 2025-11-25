// Auto-Post UI Controller - จัดการ UI สำหรับ Auto-Posting System

// ===========================================
// INITIALIZATION
// ===========================================

let autoPostUIInitialized = false;

function initAutoPostUI() {
    if (autoPostUIInitialized) return;

    console.log('🎨 Initializing Auto-Post UI...');

    // โหลดและแสดงสถานะปัจจุบัน
    updateAutoPostUI();

    // Set up intervals สำหรับอัพเดท UI
    setInterval(updateAutoPostUI, 5000); // อัพเดททุก 5 วินาที

    // โหลด config ไปที่ form
    loadConfigToForm();

    // ตรวจสอบ setup status
    checkSetupStatus();

    autoPostUIInitialized = true;
    console.log('✅ Auto-Post UI initialized');
}

// ===========================================
// TOGGLE AUTO-POST
// ===========================================

function toggleAutoPost() {
    if (!autoPostManager) {
        showToast('❌ Auto-Post Manager ยังไม่พร้อม', 'error');
        return;
    }

    // ตรวจสอบว่า setup พร้อมหรือยัง
    const readiness = autoPostManager.checkReadiness();

    if (!readiness.ready) {
        showToast('⚠️ กรุณาตั้งค่าก่อนเริ่มใช้งาน', 'warning');
        showSetupGuide(readiness.missing);
        return;
    }

    // Toggle
    if (autoPostManager.isRunning) {
        // Stop
        if (confirm('⏸️ หยุด Auto-Posting?\n\nระบบจะหยุดสร้าง content อัตโนมัติ')) {
            autoPostManager.stop();
            showToast('⏸️ Auto-Posting หยุดทำงานแล้ว', 'info');
        }
    } else {
        // Start
        autoPostManager.start();
        showToast('🚀 Auto-Posting เริ่มทำงานแล้ว!', 'success');
    }

    // อัพเดท UI
    updateAutoPostUI();
}

// ===========================================
// UPDATE UI
// ===========================================

function updateAutoPostUI() {
    if (!autoPostManager) return;

    const status = autoPostManager.getStatus();

    // Update toggle button
    const toggleBtn = document.getElementById('auto-post-toggle');
    const toggleText = document.getElementById('auto-post-toggle-text');

    if (toggleBtn && toggleText) {
        if (status.isRunning) {
            toggleBtn.className = 'btn btn-large btn-stop';
            toggleText.textContent = '⏸️ Stop Auto-Post';
        } else {
            toggleBtn.className = 'btn btn-large btn-start';
            toggleText.textContent = '▶️ Start Auto-Post';
        }
    }

    // Update status badge
    const statusBadge = document.getElementById('auto-post-status');
    const statusDetail = document.getElementById('auto-post-status-detail');

    if (statusBadge) {
        if (status.isRunning) {
            statusBadge.className = 'status-badge running';
            statusBadge.innerHTML = '🟢 Running';
            if (statusDetail) {
                statusDetail.textContent = 'ระบบกำลังทำงานอัตโนมัติ';
            }
        } else {
            statusBadge.className = 'status-badge stopped';
            statusBadge.innerHTML = '⚪ Stopped';
            if (statusDetail) {
                statusDetail.textContent = 'ระบบยังไม่เริ่มทำงาน';
            }
        }
    }

    // Update next run
    const nextRunEl = document.getElementById('auto-post-next-run');
    if (nextRunEl && status.stats.nextRun) {
        const nextRun = new Date(status.stats.nextRun);
        nextRunEl.textContent = nextRun.toLocaleString('th-TH', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    }

    // Update stats
    const stats = status.stats || {};

    // Today stats
    const todayGenerated = document.getElementById('today-generated');
    const todayPosted = document.getElementById('today-posted');

    if (todayGenerated) {
        const today = getTodayStats();
        todayGenerated.textContent = today.generated || 0;
    }

    if (todayPosted) {
        const today = getTodayStats();
        todayPosted.textContent = today.posted || 0;
    }

    // Total stats
    const totalGenerated = document.getElementById('total-generated');
    const totalPosted = document.getElementById('total-posted');

    if (totalGenerated) totalGenerated.textContent = stats.totalGenerated || 0;
    if (totalPosted) totalPosted.textContent = stats.totalPosted || 0;
}

// ===========================================
// CONFIG MANAGEMENT
// ===========================================

function loadConfigToForm() {
    if (!autoPostManager) return;

    const config = autoPostManager.config;

    // Videos per day
    const videosInput = document.getElementById('videos-per-day');
    if (videosInput) {
        videosInput.value = config.videosPerDay || 3;
    }

    // Daily run time
    const timeInput = document.getElementById('daily-run-time');
    if (timeInput) {
        timeInput.value = config.dailyRunTime || '06:00';
    }

    // Platforms
    const platformsSelect = document.getElementById('auto-platforms');
    if (platformsSelect) {
        const platforms = config.platforms || ['youtube', 'facebook', 'tiktok'];
        Array.from(platformsSelect.options).forEach(option => {
            option.selected = platforms.includes(option.value);
        });
    }
}

function updateAutoPostConfig() {
    if (!autoPostManager) return;

    // Get values from form
    const videosPerDay = parseInt(document.getElementById('videos-per-day')?.value || 3);
    const dailyRunTime = document.getElementById('daily-run-time')?.value || '06:00';

    const platformsSelect = document.getElementById('auto-platforms');
    const platforms = Array.from(platformsSelect?.selectedOptions || [])
        .map(option => option.value);

    // Update config
    const newConfig = {
        videosPerDay,
        dailyRunTime,
        platforms
    };

    autoPostManager.saveConfig(newConfig);

    showToast('✅ บันทึกการตั้งค่าแล้ว', 'success');
}

// ===========================================
// SETUP GUIDE
// ===========================================

function checkSetupStatus() {
    if (!autoPostManager) return;

    const readiness = autoPostManager.checkReadiness();
    const setupGuide = document.getElementById('auto-post-setup-guide');

    if (readiness.ready) {
        // Hide setup guide
        if (setupGuide) {
            setupGuide.style.display = 'none';
        }
    } else {
        // Show setup guide
        showSetupGuide(readiness.missing);
    }
}

function showSetupGuide(missing) {
    const setupGuide = document.getElementById('auto-post-setup-guide');
    const checklist = document.getElementById('setup-checklist');

    if (!setupGuide || !checklist) return;

    // Update checklist
    const items = [];

    // OpenAI API Key
    const hasOpenAI = !missing.includes('OpenAI API Key');
    items.push(`<li class="${hasOpenAI ? 'complete' : 'incomplete'}">
        ${hasOpenAI ? '✓' : '✗'} OpenAI API Key (จำเป็น)
    </li>`);

    // Videos per day
    const hasVideos = !missing.includes('Videos per day setting');
    items.push(`<li class="${hasVideos ? 'complete' : 'incomplete'}">
        ${hasVideos ? '✓' : '✗'} กำหนดจำนวน videos/วัน
    </li>`);

    // Platforms
    const hasPlatforms = !missing.includes('Target platforms');
    items.push(`<li class="${hasPlatforms ? 'complete' : 'incomplete'}">
        ${hasPlatforms ? '✓' : '✗'} เลือก platforms
    </li>`);

    checklist.innerHTML = items.join('');

    // Show guide
    setupGuide.style.display = 'block';
}

function openAutoPostSettings() {
    // เปิด Settings modal และไปที่ Auto-Posting tab
    openSettings();

    // สร้าง Auto-Posting settings section ถ้ายังไม่มี
    setTimeout(() => {
        showToast('⚙️ กำลังพาไปที่ Settings...', 'info');
    }, 100);
}

// ===========================================
// ACTIONS
// ===========================================

async function runAutoPostNow() {
    if (!autoPostManager) {
        showToast('❌ Auto-Post Manager ยังไม่พร้อม', 'error');
        return;
    }

    const readiness = autoPostManager.checkReadiness();

    if (!readiness.ready) {
        showToast('⚠️ กรุณาตั้งค่าก่อนใช้งาน', 'warning');
        showSetupGuide(readiness.missing);
        return;
    }

    if (confirm('🚀 Run Auto-Post ทันที?\n\nระบบจะสร้าง content และ schedule posts ทันที')) {
        showToast('🚀 กำลัง Run Auto-Post...', 'info');

        try {
            await autoPostManager.runNow();
            showToast('✅ Run สำเร็จ!', 'success');
            updateAutoPostUI();
        } catch (error) {
            showToast(`❌ Error: ${error.message}`, 'error');
        }
    }
}

function viewAutoPostLogs() {
    // แสดง logs modal
    const logs = autoPostManager ? autoPostManager.errors : [];

    if (logs.length === 0) {
        showToast('✅ ไม่มี errors', 'success');
        return;
    }

    // สร้าง modal สำหรับแสดง logs
    const logsHTML = logs.slice(-20).reverse().map(log => `
        <div class="log-entry ${log.step}">
            <div class="log-time">${new Date(log.time).toLocaleString('th-TH')}</div>
            <div class="log-step">${log.step}</div>
            <div class="log-message">${log.error}</div>
        </div>
    `).join('');

    showModal({
        title: '📋 Auto-Post Logs',
        content: `
            <div class="logs-container">
                ${logsHTML || '<p>ไม่มี logs</p>'}
            </div>
        `,
        actions: [
            { label: 'ปิด', action: 'close' }
        ]
    });
}

// ===========================================
// HELPERS
// ===========================================

function getTodayStats() {
    // คำนวณ stats วันนี้จาก localStorage
    const today = new Date().toDateString();
    const lastRun = localStorage.getItem('auto_gen_last_run');

    if (lastRun === today) {
        return {
            generated: parseInt(localStorage.getItem('auto_gen_count') || '0'),
            posted: parseInt(localStorage.getItem('auto_posted_count') || '0')
        };
    }

    return { generated: 0, posted: 0 };
}

function showModal(options) {
    // Simple modal helper
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${options.title}</h2>
            <div>${options.content}</div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initAutoPostUI, 1000); // รอให้ autoPostManager โหลดก่อน
    });
} else {
    setTimeout(initAutoPostUI, 1000);
}

// Export functions
window.toggleAutoPost = toggleAutoPost;
window.updateAutoPostConfig = updateAutoPostConfig;
window.openAutoPostSettings = openAutoPostSettings;
window.runAutoPostNow = runAutoPostNow;
window.viewAutoPostLogs = viewAutoPostLogs;

console.log('💫 Auto-Post UI Controller loaded');
