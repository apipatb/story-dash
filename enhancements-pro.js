// Enhanced Features: Bulk Actions, Templates, Search/Filter, Dark Mode
// Advanced productivity features for Story Dashboard

// ==================== Bulk Actions ====================

let bulkModeActive = false;
let selectedContentIds = new Set();

function toggleBulkMode() {
    bulkModeActive = !bulkModeActive;
    selectedContentIds.clear();

    const bulkBtn = document.getElementById('bulkModeBtn');
    const bulkBar = document.getElementById('bulkActionsBar');

    if (bulkModeActive) {
        bulkBtn.textContent = '☑️ ยกเลิกโหมดเลือก';
        bulkBtn.classList.add('active');
        if (bulkBar) bulkBar.style.display = 'flex';
        showToast('โหมดเลือกหลายรายการ: คลิกที่ content เพื่อเลือก', 'info');
    } else {
        bulkBtn.textContent = '☐ เลือกหลายรายการ';
        bulkBtn.classList.remove('active');
        if (bulkBar) bulkBar.style.display = 'none';
    }

    renderContents();
    updateBulkCount();
}

function toggleContentSelection(id) {
    if (!bulkModeActive) return;

    if (selectedContentIds.has(id)) {
        selectedContentIds.delete(id);
    } else {
        selectedContentIds.add(id);
    }

    // Update checkbox visual
    const checkbox = document.querySelector(`[data-content-id="${id}"] .bulk-checkbox`);
    if (checkbox) {
        checkbox.classList.toggle('checked', selectedContentIds.has(id));
    }

    updateBulkCount();
}

function updateBulkCount() {
    const countEl = document.getElementById('bulkSelectedCount');
    if (countEl) {
        countEl.textContent = selectedContentIds.size;
    }
}

function bulkChangeStatus(newStatus) {
    if (selectedContentIds.size === 0) {
        showToast('กรุณาเลือก content ก่อน', 'warning');
        return;
    }

    const confirmMsg = `เปลี่ยนสถานะ ${selectedContentIds.size} รายการเป็น "${newStatus}"?`;
    if (!confirm(confirmMsg)) return;

    let updatedCount = 0;
    selectedContentIds.forEach(id => {
        const content = contents.find(c => c.id === id);
        if (content) {
            content.status = newStatus;
            updatedCount++;

            // Update in Supabase if available
            if (typeof updateContent === 'function' && currentUser) {
                updateContent(id, content);
            }
        }
    });

    saveContents();
    renderContents();
    updateStats();

    selectedContentIds.clear();
    updateBulkCount();

    showToast(`อัพเดท ${updatedCount} รายการสำเร็จ!`, 'success');
}

function bulkDelete() {
    if (selectedContentIds.size === 0) {
        showToast('กรุณาเลือก content ก่อน', 'warning');
        return;
    }

    const confirmMsg = `ลบ ${selectedContentIds.size} รายการถาวร?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!`;
    if (!confirm(confirmMsg)) return;

    selectedContentIds.forEach(id => {
        const index = contents.findIndex(c => c.id === id);
        if (index !== -1) {
            contents.splice(index, 1);

            // Delete from Supabase if available
            if (typeof deleteContent === 'function' && currentUser) {
                deleteContent(id);
            }
        }
    });

    saveContents();
    renderContents();
    updateStats();

    selectedContentIds.clear();
    updateBulkCount();

    showToast('ลบสำเร็จ!', 'success');
}

function selectAllContents() {
    selectedContentIds.clear();
    contents.forEach(c => selectedContentIds.add(c.id));
    updateBulkCount();
    renderContents();
}

function deselectAllContents() {
    selectedContentIds.clear();
    updateBulkCount();
    renderContents();
}

// ==================== Content Templates ====================

const contentTemplates = [
    {
        id: 'superstition-why',
        name: 'ความเชื่อ: ทำไมต้อง/ห้าม...',
        category: 'superstition',
        icon: '🪬',
        description: 'Template สำหรับอธิบายความเชื่อโบราณ',
        scriptTemplate: `Hook: คุณเคยได้ยินว่า "[ใส่ความเชื่อ]" ไหม?

เนื้อหา:
• ความเชื่อโบราณบอกว่า [อธิบายความเชื่อ]
• เหตุผลที่คนเชื่อเพราะ [ที่มาของความเชื่อ]
• แต่ทางวิทยาศาสตร์อธิบายว่า [มุมมองวิทยาศาสตร์]

Twist: จริง ๆ แล้ว [ข้อเท็จจริงที่น่าสนใจ]

CTA: คุณเชื่อไหม? แชร์ความคิดเห็นกันเถอะ!`,
        platforms: ['tiktok', 'youtube'],
        duration: 2
    },
    {
        id: 'science-myth',
        name: 'วิทยาศาสตร์ vs ความเชื่อ',
        category: 'science',
        icon: '🔬',
        description: 'เปรียบเทียบความเชื่อกับวิทยาศาสตร์',
        scriptTemplate: `Hook: "คนโบราณว่า [ความเชื่อ]" แต่วิทยาศาสตร์บอกอะไร?

ส่วนที่ 1 - ความเชื่อ:
• [อธิบายความเชื่อโบราณ]
• ที่มาจาก [แหล่งที่มา]

ส่วนที่ 2 - วิทยาศาสตร์:
• การศึกษาพบว่า [ข้อค้นพบ]
• เหตุผลคือ [คำอธิบายทางวิทยาศาสตร์]

สรุป: [ข้อสรุปที่สมเหตุสมผล]

CTA: ฝั่งไหนน่าเชื่อกว่า? Comment มาคุย!`,
        platforms: ['youtube', 'facebook'],
        duration: 3
    },
    {
        id: 'story-telling',
        name: 'เล่าเรื่อง/ตำนาน',
        category: 'legend',
        icon: '📖',
        description: 'เล่าเรื่องราวตำนานแบบน่าติดตาม',
        scriptTemplate: `Hook: เคยได้ยินเรื่อง [ชื่อตำนาน] ไหม?

เนื้อเรื่อง:
• มีคนเล่าว่า [เริ่มเรื่อง]
• แล้วก็เกิดเหตุการณ์ [เนื้อเรื่องหลัก]
• สุดท้าย [ตอนจบ]

บทสรุป:
• เรื่องนี้สอนให้รู้ว่า [คุณค่าที่ได้]
• หลายคนยังเชื่อถึงทุกวันนี้

CTA: ใครเคยได้ยินเรื่องนี้บ้าง? เล่าต่อกันมา!`,
        platforms: ['tiktok', 'youtube', 'facebook'],
        duration: 2.5
    },
    {
        id: 'quick-facts',
        name: 'Quick Facts / รู้หรือไม่',
        category: 'other',
        icon: '💡',
        description: 'ข้อเท็จจริงสั้น ๆ น่าสนใจ',
        scriptTemplate: `Hook: รู้หรือไม่? [ข้อเท็จจริงน่าสนใจ]

Fact #1: [ข้อเท็จจริงที่ 1]
Fact #2: [ข้อเท็จจริงที่ 2]
Fact #3: [ข้อเท็จจริงที่ 3]

Extra: ที่น่าสนใจคือ [bonus fact]

CTA: บอกต่อเพื่อน ๆ ด้วย! กด share!`,
        platforms: ['tiktok', 'facebook'],
        duration: 1
    },
    {
        id: 'comparison',
        name: 'เปรียบเทียบ / A vs B',
        category: 'other',
        icon: '⚖️',
        description: 'เปรียบเทียบ 2 สิ่ง',
        scriptTemplate: `Hook: [A] vs [B] - อันไหนดีกว่า?

[A]:
✅ [จุดแข็งที่ 1]
✅ [จุดแข็งที่ 2]
❌ [จุดอ่อนที่ 1]

[B]:
✅ [จุดแข็งที่ 1]
✅ [จุดแข็งที่ 2]
❌ [จุดอ่อนที่ 1]

ผลสรุป: [คำแนะนำ]

CTA: คุณชอบแบบไหน? โหวตที่ comment!`,
        platforms: ['tiktok', 'youtube'],
        duration: 2
    }
];

function openTemplateLibrary() {
    const modal = document.getElementById('templateLibraryModal');
    const container = document.getElementById('templateLibraryContainer');

    if (!modal || !container) return;

    container.innerHTML = contentTemplates.map(template => `
        <div class="template-card" onclick="useTemplate('${template.id}')">
            <div class="template-icon">${template.icon}</div>
            <h4>${template.name}</h4>
            <p>${template.description}</p>
            <div class="template-meta">
                <span class="template-category">${getCategoryName(template.category)}</span>
                <span class="template-duration">${template.duration} นาที</span>
            </div>
        </div>
    `).join('');

    modal.style.display = 'block';
}

function closeTemplateLibrary() {
    const modal = document.getElementById('templateLibraryModal');
    if (modal) modal.style.display = 'none';
}

function useTemplate(templateId) {
    const template = contentTemplates.find(t => t.id === templateId);
    if (!template) return;

    closeTemplateLibrary();

    // Open add modal with template
    openAddModal();

    // Fill in template data
    document.getElementById('contentCategory').value = template.category;
    document.getElementById('contentScript').value = template.scriptTemplate;
    document.getElementById('contentDuration').value = template.duration;

    // Set platforms
    template.platforms.forEach(platform => {
        const checkbox = document.getElementById(`platform${capitalize(platform)}`);
        if (checkbox) checkbox.checked = true;
    });

    showToast(`ใช้ template: ${template.name}`, 'success');
}

function getCategoryName(category) {
    const categories = {
        'superstition': 'ความเชื่อ',
        'science': 'วิทยาศาสตร์',
        'culture': 'วัฒนธรรม',
        'legend': 'ตำนาน',
        'other': 'อื่นๆ'
    };
    return categories[category] || category;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== Advanced Search & Filter ====================

function debounceSearch() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterContent();
    }, 300);
}

function filterContent() {
    renderContents();
}

// Add advanced filter options
function showAdvancedFilters() {
    const html = `
        <div class="advanced-filters">
            <h2>🔍 Advanced Filters</h2>

            <div class="filter-section">
                <h3>วันที่</h3>
                <div class="form-group">
                    <label>จาก</label>
                    <input type="date" id="filterDateFrom" onchange="applyAdvancedFilters()">
                </div>
                <div class="form-group">
                    <label>ถึง</label>
                    <input type="date" id="filterDateTo" onchange="applyAdvancedFilters()">
                </div>
            </div>

            <div class="filter-section">
                <h3>แพลตฟอร์ม</h3>
                <div class="checkbox-group">
                    <label><input type="checkbox" value="tiktok" class="platform-filter" onchange="applyAdvancedFilters()"> TikTok</label>
                    <label><input type="checkbox" value="youtube" class="platform-filter" onchange="applyAdvancedFilters()"> YouTube</label>
                    <label><input type="checkbox" value="facebook" class="platform-filter" onchange="applyAdvancedFilters()"> Facebook</label>
                </div>
            </div>

            <div class="filter-section">
                <h3>รายได้</h3>
                <div class="form-group">
                    <label>มีรายได้</label>
                    <select id="filterRevenue" onchange="applyAdvancedFilters()">
                        <option value="all">ทั้งหมด</option>
                        <option value="hasRevenue">มีรายได้</option>
                        <option value="noRevenue">ยังไม่มีรายได้</option>
                    </select>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="resetAdvancedFilters()">รีเซ็ต</button>
                <button class="btn btn-primary" onclick="closeAgentModal()">ใช้ Filter</button>
            </div>
        </div>
    `;

    showAgentModal('Advanced Filters', html);
}

function applyAdvancedFilters() {
    // This function will be called when filters change
    // For now, we'll just re-render
    renderContents();
}

function resetAdvancedFilters() {
    // Reset all filter inputs
    const filterInputs = document.querySelectorAll('.advanced-filters input, .advanced-filters select');
    filterInputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });

    applyAdvancedFilters();
}

// ==================== Dark Mode ====================

function setThemeMode(mode) {
    localStorage.setItem('theme-mode', mode);

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === mode) {
            btn.classList.add('active');
        }
    });

    applyTheme(mode);
}

function applyTheme(mode) {
    const root = document.documentElement;

    if (mode === 'dark') {
        root.style.setProperty('--bg-color', '#0f172a');
        root.style.setProperty('--card-bg', '#1e293b');
        root.style.setProperty('--text-primary', '#f1f5f9');
        root.style.setProperty('--text-secondary', '#cbd5e1');
        root.style.setProperty('--border-color', '#334155');
        document.body.classList.add('dark-mode');
        showToast('เปลี่ยนเป็น Dark Mode', 'success');
    } else if (mode === 'light') {
        root.style.setProperty('--bg-color', '#f7f9fc');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#64748b');
        root.style.setProperty('--border-color', '#e2e8f0');
        document.body.classList.remove('dark-mode');
        showToast('เปลี่ยนเป็น Light Mode', 'success');
    } else if (mode === 'auto') {
        // Auto mode based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
        showToast('เปลี่ยนเป็น Auto Mode (ตามระบบ)', 'success');
    }
}

function setColorTheme(color) {
    const colors = {
        blue: { primary: '#6366f1', secondary: '#764ba2' },
        purple: { primary: '#8b5cf6', secondary: '#a855f7' },
        green: { primary: '#10b981', secondary: '#059669' },
        orange: { primary: '#f59e0b', secondary: '#ea580c' },
        pink: { primary: '#ec4899', secondary: '#f43f5e' },
        red: { primary: '#ef4444', secondary: '#dc2626' }
    };

    const theme = colors[color];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`);

    localStorage.setItem('color-theme', color);

    // Update active button
    document.querySelectorAll('.color-theme').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });

    showToast(`เปลี่ยนสีธีมเป็น ${color}`, 'success');
}

// ==================== Initialize ====================

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme-mode') || 'light';
    const savedColor = localStorage.getItem('color-theme') || 'blue';

    // Don't show toast on initial load
    const originalShowToast = window.showToast;
    window.showToast = () => {};

    applyTheme(savedTheme);
    setColorTheme(savedColor);

    window.showToast = originalShowToast;
});

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});
