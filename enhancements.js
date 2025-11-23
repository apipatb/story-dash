// Story Dashboard - Enhancement Features
// All new features in one place for easy management

// ==================== 1. FORGOT PASSWORD ====================

async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail')?.value.trim();

    if (!email) {
        showToast('กรุณากรอกอีเมล', 'warning');
        return;
    }

    if (!isSupabaseConfigured()) {
        showToast('กรุณาตั้งค่า Supabase ก่อน', 'warning');
        return;
    }

    showLoading('กำลังส่งอีเมลรีเซ็ตรหัสผ่าน...');

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/index.html',
        });

        hideLoading();

        if (error) throw error;

        showToast('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว กรุณาตรวจสอบอีเมล', 'success');
        showLoginForm();
    } catch (error) {
        hideLoading();
        console.error('Forgot password error:', error);
        showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
}

function showForgotPasswordForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
}

function hideForgotPasswordForm() {
    document.getElementById('forgotPasswordForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// ==================== 2. PROFILE EDITING ====================

let userProfile = {
    displayName: '',
    avatar: '',
    bio: '',
    website: ''
};

function openProfileEditor() {
    if (!currentUser) return;

    // Load current profile
    const savedProfile = localStorage.getItem(`profile_${currentUser.id}`);
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    } else {
        userProfile.displayName = currentUser.email?.split('@')[0] || 'User';
    }

    // Fill form
    document.getElementById('profileDisplayName').value = userProfile.displayName || '';
    document.getElementById('profileBio').value = userProfile.bio || '';
    document.getElementById('profileWebsite').value = userProfile.website || '';

    // Show modal
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfileEditor() {
    document.getElementById('profileModal').style.display = 'none';
}

async function saveProfile() {
    const displayName = document.getElementById('profileDisplayName').value.trim();
    const bio = document.getElementById('profileBio').value.trim();
    const website = document.getElementById('profileWebsite').value.trim();

    userProfile = {
        ...userProfile,
        displayName,
        bio,
        website
    };

    // Save to localStorage
    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(userProfile));

    // Update UI
    updateUserDisplay();

    showToast('บันทึกโปรไฟล์สำเร็จ', 'success');
    closeProfileEditor();
}

function updateUserDisplay() {
    const displayName = userProfile.displayName || currentUser.email?.split('@')[0] || 'User';
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
        avatarEl.textContent = displayName.charAt(0).toUpperCase();
    }

    const nameEl = document.getElementById('userDisplayName');
    if (nameEl) {
        nameEl.textContent = displayName;
    }
}

// ==================== 3. ONBOARDING TUTORIAL ====================

const tutorialSteps = [
    {
        target: '.add-content-btn',
        title: 'สร้าง Content ใหม่',
        message: 'คลิกที่นี่เพื่อเพิ่มไอเดีย content ใหม่ พร้อมกรอก script และกำหนดตารางโพสต์',
        position: 'bottom'
    },
    {
        target: '#filterStatus',
        title: 'กรอง Content',
        message: 'กรองตามสถานะ: Draft (ร่าง), Ready (พร้อมโพสต์), Posted (โพสต์แล้ว)',
        position: 'bottom'
    },
    {
        target: '.nav-tab:nth-child(2)',
        title: 'ติดตามรายได้',
        message: 'ดูสถิติรายได้จากวิดีโอของคุณ และวิเคราะห์ performance',
        position: 'bottom'
    },
    {
        target: '.nav-tab:nth-child(5)',
        title: 'AI Assistant',
        message: 'ใช้ AI ช่วยสร้าง script, hook, hashtags และอื่นๆ อัตโนมัติ',
        position: 'bottom'
    },
    {
        target: '#themeSelector',
        title: 'ปรับแต่งธีม',
        message: 'เปลี่ยนสี และโหมดสว่าง/มืด ตามความชอบ',
        position: 'left'
    }
];

let currentTutorialStep = 0;

function startTutorial() {
    if (localStorage.getItem('tutorial_completed')) {
        return;
    }

    currentTutorialStep = 0;
    showTutorialStep();
}

function showTutorialStep() {
    if (currentTutorialStep >= tutorialSteps.length) {
        completeTutorial();
        return;
    }

    const step = tutorialSteps[currentTutorialStep];
    const target = document.querySelector(step.target);

    if (!target) {
        currentTutorialStep++;
        showTutorialStep();
        return;
    }

    // Create tutorial overlay
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.className = 'tutorial-overlay';

    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.innerHTML = `
        <div class="tutorial-header">
            <strong>${step.title}</strong>
            <button onclick="skipTutorial()" class="tutorial-skip">ข้าม</button>
        </div>
        <p>${step.message}</p>
        <div class="tutorial-footer">
            <span class="tutorial-progress">${currentTutorialStep + 1}/${tutorialSteps.length}</span>
            <button onclick="nextTutorialStep()" class="btn btn-primary">ถัดไป</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    switch(step.position) {
        case 'bottom':
            tooltip.style.top = (rect.bottom + 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
            break;
        case 'top':
            tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
            break;
        case 'left':
            tooltip.style.top = (rect.top + rect.height / 2 - tooltipRect.height / 2) + 'px';
            tooltip.style.left = (rect.left - tooltipRect.width - 10) + 'px';
            break;
        case 'right':
            tooltip.style.top = (rect.top + rect.height / 2 - tooltipRect.height / 2) + 'px';
            tooltip.style.left = (rect.right + 10) + 'px';
            break;
    }

    // Highlight target
    target.classList.add('tutorial-highlight');
}

function nextTutorialStep() {
    removeTutorialElements();
    currentTutorialStep++;
    showTutorialStep();
}

function skipTutorial() {
    removeTutorialElements();
    localStorage.setItem('tutorial_completed', 'true');
}

function completeTutorial() {
    removeTutorialElements();
    localStorage.setItem('tutorial_completed', 'true');
    showToast('✨ เรียนรู้การใช้งานเสร็จสิ้น!', 'success');
}

function removeTutorialElements() {
    const overlay = document.getElementById('tutorialOverlay');
    const tooltip = document.querySelector('.tutorial-tooltip');
    const highlights = document.querySelectorAll('.tutorial-highlight');

    if (overlay) overlay.remove();
    if (tooltip) tooltip.remove();
    highlights.forEach(el => el.classList.remove('tutorial-highlight'));
}

// ==================== 4. BULK ACTIONS ====================

let selectedContents = new Set();
let bulkMode = false;

function toggleBulkMode() {
    bulkMode = !bulkMode;
    selectedContents.clear();

    const btn = document.getElementById('bulkModeBtn');
    if (bulkMode) {
        btn.classList.add('active');
        btn.innerHTML = '✓ โหมดเลือกหลายรายการ';
        showBulkActions();
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '☐ เลือกหลายรายการ';
        hideBulkActions();
    }

    renderContents();
}

function showBulkActions() {
    document.getElementById('bulkActionsBar').style.display = 'flex';
}

function hideBulkActions() {
    document.getElementById('bulkActionsBar').style.display = 'none';
}

function toggleContentSelection(id) {
    if (selectedContents.has(id)) {
        selectedContents.delete(id);
    } else {
        selectedContents.add(id);
    }
    updateBulkActionsCount();
    updateContentCheckboxes();
}

function selectAllContents() {
    contents.forEach(c => selectedContents.add(c.id));
    updateBulkActionsCount();
    updateContentCheckboxes();
}

function deselectAllContents() {
    selectedContents.clear();
    updateBulkActionsCount();
    updateContentCheckboxes();
}

function updateBulkActionsCount() {
    const count = document.getElementById('bulkSelectedCount');
    if (count) {
        count.textContent = selectedContents.size;
    }
}

function updateContentCheckboxes() {
    selectedContents.forEach(id => {
        const checkbox = document.getElementById(`checkbox-${id}`);
        if (checkbox) checkbox.checked = true;
    });
}

async function bulkDelete() {
    if (selectedContents.size === 0) {
        showToast('กรุณาเลือก content ก่อน', 'warning');
        return;
    }

    if (!confirm(`คุณแน่ใจว่าต้องการลบ ${selectedContents.size} รายการ?`)) {
        return;
    }

    showLoading('กำลังลบ...');

    for (const id of selectedContents) {
        if (isSupabaseConfigured() && currentUser) {
            await supabaseDeleteContent(id);
        }
        contents = contents.filter(c => c.id !== id);
    }

    saveContents();
    selectedContents.clear();
    hideLoading();
    renderContents();
    updateStats();
    showToast('ลบสำเร็จ', 'success');
}

async function bulkChangeStatus(newStatus) {
    if (selectedContents.size === 0) {
        showToast('กรุณาเลือก content ก่อน', 'warning');
        return;
    }

    showLoading('กำลังอัพเดท...');

    for (const id of selectedContents) {
        const content = contents.find(c => c.id === id);
        if (content) {
            content.status = newStatus;

            if (isSupabaseConfigured() && currentUser) {
                await supabaseUpdateContent(id, content);
            }
        }
    }

    saveContents();
    selectedContents.clear();
    hideLoading();
    renderContents();
    updateStats();
    showToast('อัพเดทสถานะสำเร็จ', 'success');
}

// ==================== 5. CONTENT PREVIEW MODE ====================

function openPreview(contentId) {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const modal = document.getElementById('previewModal');
    document.getElementById('previewTitle').textContent = content.title;
    document.getElementById('previewCategory').textContent = getCategoryLabel(content.category);
    document.getElementById('previewPlatforms').textContent = content.platforms.map(p => getPlatformLabel(p)).join(', ');
    document.getElementById('previewScript').textContent = content.script || 'ไม่มีสคริปต์';
    document.getElementById('previewStatus').textContent = getStatusLabel(content.status);
    document.getElementById('previewDuration').textContent = content.duration ? `${content.duration} นาที` : '-';
    document.getElementById('previewSchedule').textContent = content.schedule ? formatDate(content.schedule) : '-';
    document.getElementById('previewNotes').textContent = content.notes || 'ไม่มีโน้ต';

    modal.style.display = 'block';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

function getCategoryLabel(cat) {
    const labels = {
        'superstition': 'ความเชื่อ/งมงาย',
        'science': 'วิทยาศาสตร์',
        'culture': 'วัฒนธรรม',
        'legend': 'ตำนาน',
        'other': 'อื่นๆ'
    };
    return labels[cat] || cat;
}

function getPlatformLabel(platform) {
    const labels = {
        'tiktok': 'TikTok',
        'youtube': 'YouTube',
        'facebook': 'Facebook'
    };
    return labels[platform] || platform;
}

function getStatusLabel(status) {
    const labels = {
        'draft': 'Draft',
        'ready': 'Ready to Post',
        'posted': 'Posted'
    };
    return labels[status] || status;
}

// ==================== 6. TEMPLATE LIBRARY ====================

const contentTemplates = [
    {
        id: 'myth-vs-fact',
        name: 'Myth vs Fact',
        category: 'superstition',
        template: `Hook: "ความเชื่อนี้จริงหรือไม่? 🤔"

เนื้อหา:
❌ MYTH: คนโบราณเชื่อว่า [ความเชื่อ]
✅ FACT: ตามวิทยาศาสตร์แล้ว [คำอธิบาย]

สรุป: [ข้อสรุป]

CTA: "คุณเคยเชื่อแบบนี้ไหม? คอมเมนต์บอก! 👇"`
    },
    {
        id: 'why-question',
        name: 'Why Question Format',
        category: 'superstition',
        template: `Hook: "ทำไมคนโบราณถึงห้าม [กิจกรรม]? 🤨"

เนื้อหา:
1. ความเชื่อดั้งเดิมบอกว่า...
2. แต่ที่จริงแล้ว...
3. เหตุผลทางวิทยาศาสตร์คือ...

CTA: "แชร์ความเชื่อในครอบครัวคุณกันเถอะ! 💬"`
    },
    {
        id: 'did-you-know',
        name: 'Did You Know?',
        category: 'science',
        template: `Hook: "รู้หรือไม่? [ข้อเท็จจริงที่น่าสนใจ] 🧠"

เนื้อหา:
• Fact 1: [ข้อเท็จจริง]
• Fact 2: [ข้อเท็จจริง]
• Fact 3: [ข้อเท็จจริง]

CTA: "กดไลก์ถ้าไม่เคยรู้มาก่อน! 👍"`
    },
    {
        id: 'comparison',
        name: 'Comparison Format',
        category: 'culture',
        template: `Hook: "[สิ่งที่ 1] vs [สิ่งที่ 2] - อะไรดีกว่ากัน? ⚡"

เนื้อหา:
📌 [สิ่งที่ 1]:
- ข้อดี: ...
- ข้อเสีย: ...

📌 [สิ่งที่ 2]:
- ข้อดี: ...
- ข้อเสีย: ...

สรุป: [ข้อสรุป]

CTA: "คุณชอบแบบไหนมากกว่ากัน? 💭"`
    },
    {
        id: 'story-telling',
        name: 'Story Telling',
        category: 'legend',
        template: `Hook: "เรื่องเล่าจากอดีต... [หัวข้อ] 📖"

เนื้อหา:
กาลครั้งหนึ่ง... [เริ่มเรื่อง]

จากนั้น... [พัฒนาการ]

และสุดท้าย... [บทสรุป]

บทเรียน: [ข้อคิด]

CTA: "มีใครเคยได้ยินเรื่องนี้บ้าง? 🙋"`
    }
];

function openTemplateLibrary() {
    const container = document.getElementById('templateLibraryContainer');
    container.innerHTML = contentTemplates.map(template => `
        <div class="template-card" onclick="useTemplate('${template.id}')">
            <h4>${template.name}</h4>
            <span class="badge badge-category">${getCategoryLabel(template.category)}</span>
            <p class="template-preview">${template.template.substring(0, 100)}...</p>
            <button class="btn btn-sm btn-primary">ใช้ Template นี้</button>
        </div>
    `).join('');

    document.getElementById('templateLibraryModal').style.display = 'block';
}

function closeTemplateLibrary() {
    document.getElementById('templateLibraryModal').style.display = 'none';
}

function useTemplate(templateId) {
    const template = contentTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Fill form with template
    document.getElementById('contentCategory').value = template.category;
    document.getElementById('contentScript').value = template.template;

    closeTemplateLibrary();
    openAddModal();
    showToast('นำ Template มาใช้แล้ว! ปรับแต่งได้เลย', 'success');
}

// ==================== 7. SCRIPT TIMER ====================

function calculateScriptDuration(script) {
    if (!script) return 0;

    // Average reading speed: 150 words per minute (Thai/English)
    // Or ~2.5 words per second
    const words = script.trim().split(/\s+/).length;
    const seconds = Math.ceil(words / 2.5);

    return seconds;
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
}

function updateScriptTimer() {
    const script = document.getElementById('contentScript').value;
    const duration = calculateScriptDuration(script);
    const timer = document.getElementById('scriptTimer');

    if (timer) {
        timer.textContent = `⏱️ ประมาณ ${formatDuration(duration)}`;

        // Color code based on platform optimal length
        if (duration <= 60) {
            timer.className = 'script-timer optimal';
        } else if (duration <= 180) {
            timer.className = 'script-timer good';
        } else {
            timer.className = 'script-timer long';
        }
    }
}

// ==================== 8. CPM CALCULATOR ====================

const platformCPM = {
    tiktok: { min: 0.02, max: 0.10, avg: 0.05 },
    youtube: { min: 0.50, max: 5.00, avg: 2.00 },
    facebook: { min: 0.10, max: 1.00, avg: 0.40 }
};

function openCPMCalculator() {
    document.getElementById('cpmCalculatorModal').style.display = 'block';
}

function closeCPMCalculator() {
    document.getElementById('cpmCalculatorModal').style.display = 'none';
}

function calculateCPM() {
    const platform = document.getElementById('cpmPlatform').value;
    const views = parseInt(document.getElementById('cpmViews').value) || 0;
    const revenue = parseFloat(document.getElementById('cpmRevenue').value) || 0;

    const cpm = (revenue / views) * 1000;
    const rates = platformCPM[platform];

    let rating = 'ต่ำกว่ามาตรฐาน';
    let color = 'red';

    if (cpm >= rates.avg) {
        rating = 'ดีมาก!';
        color = 'green';
    } else if (cpm >= rates.min) {
        rating = 'ปานกลาง';
        color = 'orange';
    }

    document.getElementById('cpmResult').innerHTML = `
        <div class="cpm-result">
            <h3>CPM ของคุณ: <span style="color: ${color}">$${cpm.toFixed(2)}</span></h3>
            <p>การประเมิน: <strong>${rating}</strong></p>
            <div class="cpm-benchmark">
                <p>ค่าเฉลี่ยของ ${getPlatformLabel(platform)}:</p>
                <p>ต่ำสุด: $${rates.min.toFixed(2)} | เฉลี่ย: $${rates.avg.toFixed(2)} | สูงสุด: $${rates.max.toFixed(2)}</p>
            </div>
        </div>
    `;
}

// ==================== 9. ROI TRACKING ====================

function calculateContentROI(content) {
    const totalRevenue =
        (content.monetization?.revenue?.ads || 0) +
        (content.monetization?.revenue?.brand || 0) +
        (content.monetization?.revenue?.affiliate || 0);

    // Estimated cost (time-based)
    const hourlyRate = 500; // THB per hour
    const estimatedHours = 2; // Average time to create content
    const estimatedCost = hourlyRate * estimatedHours;

    const roi = ((totalRevenue - estimatedCost) / estimatedCost) * 100;

    return {
        revenue: totalRevenue,
        cost: estimatedCost,
        profit: totalRevenue - estimatedCost,
        roi: roi
    };
}

function showROIReport() {
    const roiData = contents.map(c => ({
        ...c,
        roi: calculateContentROI(c)
    })).sort((a, b) => b.roi.roi - a.roi.roi);

    const container = document.getElementById('roiReportContainer');
    container.innerHTML = `
        <div class="roi-summary">
            <h3>📊 ROI Summary</h3>
            <div class="roi-stats">
                <div class="roi-stat">
                    <span>รายได้รวม</span>
                    <strong>฿${roiData.reduce((sum, c) => sum + c.roi.revenue, 0).toLocaleString()}</strong>
                </div>
                <div class="roi-stat">
                    <span>กำไรรวม</span>
                    <strong>฿${roiData.reduce((sum, c) => sum + c.roi.profit, 0).toLocaleString()}</strong>
                </div>
            </div>
        </div>
        <table class="roi-table">
            <thead>
                <tr>
                    <th>Content</th>
                    <th>รายได้</th>
                    <th>ต้นทุน</th>
                    <th>กำไร</th>
                    <th>ROI</th>
                </tr>
            </thead>
            <tbody>
                ${roiData.slice(0, 10).map(c => `
                    <tr>
                        <td>${c.title}</td>
                        <td>฿${c.roi.revenue.toLocaleString()}</td>
                        <td>฿${c.roi.cost.toLocaleString()}</td>
                        <td>฿${c.roi.profit.toLocaleString()}</td>
                        <td class="${c.roi.roi > 0 ? 'positive' : 'negative'}">${c.roi.roi.toFixed(0)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('roiReportModal').style.display = 'block';
}

function closeROIReport() {
    document.getElementById('roiReportModal').style.display = 'none';
}

// ==================== 10. BEST TIME TO POST ====================

const bestPostingTimes = {
    tiktok: {
        weekday: ['12:00', '18:00', '21:00'],
        weekend: ['10:00', '14:00', '20:00']
    },
    youtube: {
        weekday: ['14:00', '17:00', '20:00'],
        weekend: ['11:00', '15:00', '19:00']
    },
    facebook: {
        weekday: ['13:00', '15:00', '19:00'],
        weekend: ['12:00', '16:00', '20:00']
    }
};

function recommendBestTime(platforms) {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const timeType = isWeekend ? 'weekend' : 'weekday';

    const recommendations = platforms.map(platform => {
        const times = bestPostingTimes[platform][timeType];
        return {
            platform: getPlatformLabel(platform),
            times: times,
            best: times[0]
        };
    });

    return recommendations;
}

function showBestTimeRecommendation(contentId) {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const recommendations = recommendBestTime(content.platforms);

    const html = `
        <div class="best-time-recommendation">
            <h3>⏰ แนะนำเวลาโพสต์</h3>
            ${recommendations.map(rec => `
                <div class="time-rec-platform">
                    <strong>${rec.platform}</strong>
                    <p>เวลาที่แนะนำ: ${rec.times.join(', ')}</p>
                    <p class="best-time">ดีที่สุด: <strong>${rec.best}</strong></p>
                </div>
            `).join('')}
            <button class="btn btn-primary" onclick="applyBestTime(${contentId}, '${recommendations[0].best}')">
                ใช้เวลา ${recommendations[0].best}
            </button>
        </div>
    `;

    showToast(html, 'info', 10000);
}

function applyBestTime(contentId, time) {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const today = new Date();
    const [hours, minutes] = time.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), 0);

    content.schedule = today.toISOString().slice(0, 16);
    saveContents();
    renderContents();
    showToast('กำหนดเวลาโพสต์แล้ว', 'success');
}

// ==================== 11. ACHIEVEMENT BADGES ====================

const achievements = [
    {
        id: 'first_content',
        name: 'เริ่มต้นแรก',
        icon: '🎯',
        description: 'สร้าง content แรก',
        condition: () => contents.length >= 1
    },
    {
        id: 'ten_contents',
        name: 'นักสร้างสรรค์',
        icon: '📝',
        description: 'สร้าง content ครบ 10 รายการ',
        condition: () => contents.length >= 10
    },
    {
        id: 'first_post',
        name: 'โพสต์แรก',
        icon: '🚀',
        description: 'โพสต์ content แรก',
        condition: () => contents.filter(c => c.status === 'posted').length >= 1
    },
    {
        id: 'viral_king',
        name: 'ไวรัลคิง',
        icon: '👑',
        description: 'ได้ views รวมเกิน 100,000',
        condition: () => {
            const totalViews = contents.reduce((sum, c) => {
                return sum +
                    (c.monetization?.views?.tiktok || 0) +
                    (c.monetization?.views?.youtube || 0) +
                    (c.monetization?.views?.facebook || 0);
            }, 0);
            return totalViews >= 100000;
        }
    },
    {
        id: 'money_maker',
        name: 'นักทำเงิน',
        icon: '💰',
        description: 'รายได้รวมเกิน 10,000 บาท',
        condition: () => {
            const totalRevenue = contents.reduce((sum, c) => {
                return sum +
                    (c.monetization?.revenue?.ads || 0) +
                    (c.monetization?.revenue?.brand || 0) +
                    (c.monetization?.revenue?.affiliate || 0);
            }, 0);
            return totalRevenue >= 10000;
        }
    },
    {
        id: 'consistent',
        name: 'ความสม่ำเสมอ',
        icon: '📅',
        description: 'โพสต์ครบ 7 วันติดกัน',
        condition: () => {
            // Simplified - check if has 7+ posted contents
            return contents.filter(c => c.status === 'posted').length >= 7;
        }
    }
];

function checkAchievements() {
    const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');

    achievements.forEach(achievement => {
        if (!unlockedAchievements.includes(achievement.id) && achievement.condition()) {
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    const unlocked = JSON.parse(localStorage.getItem('achievements') || '[]');
    unlocked.push(achievement.id);
    localStorage.setItem('achievements', JSON.stringify(unlocked));

    showAchievementNotification(achievement);
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <span class="achievement-icon">${achievement.icon}</span>
            <div>
                <strong>Achievement Unlocked!</strong>
                <p>${achievement.name}</p>
                <small>${achievement.description}</small>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function showAchievementsModal() {
    const unlocked = JSON.parse(localStorage.getItem('achievements') || '[]');

    const html = achievements.map(achievement => `
        <div class="achievement-item ${unlocked.includes(achievement.id) ? 'unlocked' : 'locked'}">
            <span class="achievement-icon">${achievement.icon}</span>
            <div class="achievement-details">
                <strong>${achievement.name}</strong>
                <p>${achievement.description}</p>
            </div>
            ${unlocked.includes(achievement.id) ? '<span class="achievement-check">✓</span>' : '<span class="achievement-lock">🔒</span>'}
        </div>
    `).join('');

    document.getElementById('achievementsContainer').innerHTML = html;
    document.getElementById('achievementsModal').style.display = 'block';
}

function closeAchievementsModal() {
    document.getElementById('achievementsModal').style.display = 'none';
}

// ==================== 12. BROWSER NOTIFICATIONS ====================

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

function sendNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
        });
    }
}

function scheduleContentNotifications() {
    // Check for content scheduled for today
    const today = new Date().toISOString().split('T')[0];
    const todayContents = contents.filter(c =>
        c.schedule && c.schedule.startsWith(today) && c.status === 'ready'
    );

    if (todayContents.length > 0) {
        sendNotification('📅 แจ้งเตือนการโพสต์วันนี้', {
            body: `คุณมี ${todayContents.length} content ที่ต้องโพสต์วันนี้`,
            tag: 'daily-reminder'
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
    setInterval(scheduleContentNotifications, 60000 * 60); // Check every hour
});

// ==================== INITIALIZATION ====================

// Initialize enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
    initEnhancements();
}

function initEnhancements() {
    console.log('🎨 Enhancements loaded!');

    // Start tutorial for new users
    setTimeout(() => {
        if (!localStorage.getItem('tutorial_completed')) {
            startTutorial();
        }
    }, 2000);

    // Check achievements periodically
    setInterval(checkAchievements, 30000); // Every 30 seconds

    // Add script timer event listener
    const scriptField = document.getElementById('contentScript');
    if (scriptField) {
        scriptField.addEventListener('input', updateScriptTimer);
    }
}
