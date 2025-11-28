// Story Dashboard - Content Management App
// Data Storage using LocalStorage or Supabase

let contents = [];
let editingId = null;
let searchTimeout = null;

// Store references to Supabase database functions (defined in supabase.js)
// We need to store these before we define our own functions with the same names
const supabaseInsertContent = window.insertContent;
const supabaseUpdateContent = window.updateContent;
const supabaseDeleteContent = window.deleteContent;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('📱 Story Dashboard initializing...');

        // Load contents first
        loadContents();
        renderContents();
        updateStats();

        // Initialize calendar if available
        if (typeof initCalendar === 'function') {
            initCalendar();
        } else {
            console.warn('Calendar not loaded yet, will retry...');
            setTimeout(() => {
                if (typeof initCalendar === 'function') initCalendar();
            }, 100);
        }

        // Initialize analytics if available
        if (typeof initAnalytics === 'function') {
            initAnalytics();
        } else {
            console.warn('Analytics not loaded yet, will retry...');
            setTimeout(() => {
                if (typeof initAnalytics === 'function') initAnalytics();
            }, 100);
        }

        console.log('✅ Story Dashboard initialized successfully!');

        // Hide initial loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('initialLoading');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }
        }, 500);
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Show error to user
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center; font-family: system-ui;">
                <h1 style="color: #ef4444;">⚠️ เกิดข้อผิดพลาด</h1>
                <p>ไม่สามารถโหลด Dashboard ได้</p>
                <p style="color: #666;">กรุณา refresh หน้านี้ หรือลองใช้ browser อื่น</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    🔄 Refresh
                </button>
                <details style="margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <summary style="cursor: pointer; color: #666;">Error details</summary>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error.stack}</pre>
                </details>
            </div>
        `;
    }
});

// Load contents from localStorage
function loadContents() {
    const stored = localStorage.getItem('storyDashContents');
    if (stored) {
        contents = JSON.parse(stored);
    } else {
        // Add sample content for first-time users
        contents = getSampleContents();
        saveContents();
    }
}

// Save contents to localStorage
function saveContents() {
    localStorage.setItem('storyDashContents', JSON.stringify(contents));
}

// Get sample contents
function getSampleContents() {
    return [
        {
            id: Date.now(),
            title: 'ทำไมต้องไม่หวีผมตอนเย็น?',
            category: 'superstition',
            platforms: ['tiktok', 'youtube'],
            script: 'Hook: คุณเคยได้ยินคำห้ามว่า "ห้ามหวีผมตอนเย็น" ไหม?\n\nเนื้อหา:\n- ความเชื่อโบราณบอกว่าจะทำให้เสี่ยงตาย\n- แต่ทางวิทยาศาสตร์อธิบายว่า ผมที่หวีตอนเย็นอาจหักง่ายกว่า เพราะผมเปียกชื้นจากเหงื่อ\n\nCTA: คุณเคยได้ยินแบบนี้ไหม? แชร์ความเชื่อในครอบครัวคุณกันเถอะ!',
            duration: 2,
            schedule: null,
            status: 'draft',
            notes: '#ความเชื่อไทย #วิทยาศาสตร์ #เรื่องเล่า',
            createdAt: Date.now() - 86400000
        }
    ];
}

// Render all contents
function renderContents() {
    try {
        const contentList = document.getElementById('contentList');
        if (!contentList) {
            console.error('contentList element not found');
            return;
        }

        const filterStatus = document.getElementById('filterStatus')?.value || 'all';
        const filterCategory = document.getElementById('filterCategory')?.value || 'all';
        const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

        // Filter contents
        let filteredContents = contents.filter(content => {
            const statusMatch = filterStatus === 'all' || content.status === filterStatus;
            const categoryMatch = filterCategory === 'all' || content.category === filterCategory;

            // Search in title, script, and notes
            const searchMatch = !searchQuery ||
                content.title.toLowerCase().includes(searchQuery) ||
                (content.script && content.script.toLowerCase().includes(searchQuery)) ||
                (content.notes && content.notes.toLowerCase().includes(searchQuery));

            return statusMatch && categoryMatch && searchMatch;
        });

    if (filteredContents.length === 0) {
        contentList.innerHTML = `
            <div class="empty-state">
                <h3>😊 ยังไม่มี Content</h3>
                <p>เริ่มเพิ่ม content ideas ของคุณได้เลย!</p>
            </div>
        `;
        return;
    }

    // Sort by creation date (newest first)
    filteredContents.sort((a, b) => b.createdAt - a.createdAt);

    contentList.innerHTML = filteredContents.map(content => {
        const categoryLabels = {
            'superstition': 'ความเชื่อ/งมงาย',
            'science': 'วิทยาศาสตร์',
            'culture': 'วัฒนธรรม',
            'legend': 'ตำนาน',
            'other': 'อื่นๆ'
        };

        const statusLabels = {
            'draft': 'Draft',
            'ready': 'Ready to Post',
            'posted': 'Posted'
        };

        const platformIcons = {
            'tiktok': '🎵 TikTok',
            'youtube': '📹 YouTube',
            'facebook': '👥 Facebook'
        };

        const isSelected = selectedContentIds && selectedContentIds.has(content.id);
        const bulkCheckbox = bulkModeActive ? `
            <div class="bulk-checkbox ${isSelected ? 'checked' : ''}"
                 onclick="event.stopPropagation(); toggleContentSelection(${content.id})">
            </div>
        ` : '';

        return `
            <div class="content-item status-${content.status}"
                 data-content-id="${content.id}"
                 ${bulkModeActive ? `onclick="toggleContentSelection(${content.id})"` : ''}>
                ${bulkCheckbox}
                <div class="content-header">
                    <div>
                        <h3 class="content-title">${escapeHtml(content.title)}</h3>
                        <div class="content-meta">
                            <span class="badge badge-category">${categoryLabels[content.category]}</span>
                            <span class="badge badge-status ${content.status}">${statusLabels[content.status]}</span>
                            ${content.platforms.map(p => `<span class="badge badge-platform">${platformIcons[p]}</span>`).join('')}
                        </div>
                    </div>
                </div>

                ${content.script ? `<div class="content-script">${escapeHtml(content.script)}</div>` : ''}

                <div class="content-info">
                    ${content.duration ? `<span>⏱️ ${content.duration} นาที</span>` : ''}
                    ${content.schedule ? `<span>📅 ${formatDate(content.schedule)}</span>` : ''}
                    <span>🕐 สร้างเมื่อ ${formatDateTime(content.createdAt)}</span>
                </div>

                ${content.notes ? `<div class="content-info"><span>📝 ${escapeHtml(content.notes)}</span></div>` : ''}

                <div class="content-actions">
                    <button class="btn btn-edit" onclick="event.stopPropagation(); editContent(${content.id})">✏️ แก้ไข</button>
                    <button class="btn btn-danger" onclick="event.stopPropagation(); deleteContent(${content.id})">🗑️ ลบ</button>
                    <div class="agent-quick-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); showSEOOptimizer(${content.id})" title="วิเคราะห์ SEO/Viral">🚀</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); showScriptReviewer(${content.id})" title="ตรวจสอบสคริปต์">📝</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    } catch (error) {
        console.error('Error rendering contents:', error);
        const contentList = document.getElementById('contentList');
        if (contentList) {
            contentList.innerHTML = `
                <div class="empty-state">
                    <h3>⚠️ เกิดข้อผิดพลาด</h3>
                    <p>ไม่สามารถแสดง content ได้</p>
                    <button class="btn btn-primary" onclick="location.reload()">🔄 Refresh</button>
                </div>
            `;
        }
    }
}

// Update statistics
function updateStats() {
    try {
        const draftCount = contents.filter(c => c.status === 'draft').length;
        const readyCount = contents.filter(c => c.status === 'ready').length;
        const postedCount = contents.filter(c => c.status === 'posted').length;
        const totalCount = contents.length;

        const draftEl = document.getElementById('draftCount');
        const readyEl = document.getElementById('readyCount');
        const postedEl = document.getElementById('postedCount');
        const totalEl = document.getElementById('totalCount');

        if (draftEl) draftEl.textContent = draftCount;
        if (readyEl) readyEl.textContent = readyCount;
        if (postedEl) postedEl.textContent = postedCount;
        if (totalEl) totalEl.textContent = totalCount;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Open add modal
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'เพิ่ม Content ใหม่';
    document.getElementById('contentForm').reset();
    document.getElementById('contentId').value = '';
    document.getElementById('contentModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('contentModal').style.display = 'none';
    editingId = null;
}

// Edit content
function editContent(id) {
    const content = contents.find(c => c.id === id);
    if (!content) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'แก้ไข Content';
    document.getElementById('contentId').value = content.id;
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentCategory').value = content.category;
    document.getElementById('contentScript').value = content.script || '';
    document.getElementById('contentDuration').value = content.duration || '';
    document.getElementById('contentSchedule').value = content.schedule || '';
    document.getElementById('contentStatus').value = content.status;
    document.getElementById('contentNotes').value = content.notes || '';

    // Set platforms
    document.getElementById('platformTikTok').checked = content.platforms.includes('tiktok');
    document.getElementById('platformYouTube').checked = content.platforms.includes('youtube');
    document.getElementById('platformFacebook').checked = content.platforms.includes('facebook');

    // Set monetization data
    document.getElementById('viewsTikTok').value = content.monetization?.views?.tiktok || '';
    document.getElementById('viewsYouTube').value = content.monetization?.views?.youtube || '';
    document.getElementById('viewsFacebook').value = content.monetization?.views?.facebook || '';
    document.getElementById('revenueAds').value = content.monetization?.revenue?.ads || '';
    document.getElementById('revenueBrand').value = content.monetization?.revenue?.brand || '';
    document.getElementById('revenueAffiliate').value = content.monetization?.revenue?.affiliate || '';
    document.getElementById('brandDealInfo').value = content.monetization?.brandDeal || '';

    document.getElementById('contentModal').style.display = 'block';
}

// Save content
async function saveContent(event) {
    event.preventDefault();

    const platforms = [];
    if (document.getElementById('platformTikTok').checked) platforms.push('tiktok');
    if (document.getElementById('platformYouTube').checked) platforms.push('youtube');
    if (document.getElementById('platformFacebook').checked) platforms.push('facebook');

    const contentData = {
        title: document.getElementById('contentTitle').value,
        category: document.getElementById('contentCategory').value,
        platforms: platforms,
        script: document.getElementById('contentScript').value,
        duration: parseFloat(document.getElementById('contentDuration').value) || null,
        schedule: document.getElementById('contentSchedule').value || null,
        status: document.getElementById('contentStatus').value,
        notes: document.getElementById('contentNotes').value,
        monetization: {
            views: {
                tiktok: parseInt(document.getElementById('viewsTikTok').value) || 0,
                youtube: parseInt(document.getElementById('viewsYouTube').value) || 0,
                facebook: parseInt(document.getElementById('viewsFacebook').value) || 0
            },
            revenue: {
                ads: parseFloat(document.getElementById('revenueAds').value) || 0,
                brand: parseFloat(document.getElementById('revenueBrand').value) || 0,
                affiliate: parseFloat(document.getElementById('revenueAffiliate').value) || 0
            },
            brandDeal: document.getElementById('brandDealInfo').value || ''
        }
    };

    if (editingId) {
        // Update existing content
        if (isSupabaseConfigured() && currentUser) {
            // Use Supabase
            const result = await supabaseUpdateContent(editingId, contentData);
            if (result.success) {
                const index = contents.findIndex(c => c.id === editingId);
                if (index !== -1) {
                    contents[index] = result.data;
                }
            }
        } else {
            // Use localStorage
            const index = contents.findIndex(c => c.id === editingId);
            if (index !== -1) {
                contents[index] = { ...contents[index], ...contentData };
            }
        }
    } else {
        // Add new content
        const newContent = {
            id: Date.now(),
            ...contentData,
            createdAt: Date.now()
        };

        if (isSupabaseConfigured() && currentUser) {
            // Use Supabase
            const result = await supabaseInsertContent(newContent);
            if (result.success) {
                contents.push(result.data);
            }
        } else {
            // Use localStorage
            contents.push(newContent);
        }
    }

    saveContents();
    renderContents();
    updateStats();

    // Update revenue stats if on revenue view
    if (typeof updateRevenueStats === 'function') {
        updateRevenueStats();
    }

    closeModal();
}

// Delete content
async function deleteContent(id) {
    if (!confirm('คุณแน่ใจว่าต้องการลบ content นี้?')) return;

    if (isSupabaseConfigured() && currentUser) {
        // Use Supabase
        const result = await supabaseDeleteContent(id);
        if (result.success) {
            contents = contents.filter(c => c.id !== id);
        }
    } else {
        // Use localStorage
        contents = contents.filter(c => c.id !== id);
    }

    saveContents();
    renderContents();
    updateStats();

    // Update revenue stats if on revenue view
    if (typeof updateRevenueStats === 'function') {
        updateRevenueStats();
    }
}

// Filter content
// Debounced search to improve performance
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterContent();
    }, 300); // Wait 300ms after user stops typing
}

function filterContent() {
    renderContents();
}

// Add series idea
function addSeriesIdea(title) {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'เพิ่ม Content ใหม่';
    document.getElementById('contentForm').reset();
    document.getElementById('contentId').value = '';

    if (title !== 'Custom Idea') {
        document.getElementById('contentTitle').value = title;
        document.getElementById('contentCategory').value = 'superstition';
    }

    document.getElementById('contentModal').style.display = 'block';
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contentModal');
    if (event.target === modal) {
        closeModal();
    }
    const aiModal = document.getElementById('aiModal');
    if (event.target === aiModal) {
        closeAIModal();
    }
    const settingsModal = document.getElementById('settingsModal');
    if (event.target === settingsModal) {
        closeSettings();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
        closeModal();
        closeAIModal();
        closeSettings();
    }

    // Ctrl/Cmd + N to add new content
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }
});

// View Switching
function switchView(view) {
    // Hide all views
    document.querySelectorAll('.view-container').forEach(v => {
        v.classList.remove('active');
    });

    // Remove active from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected view
    const viewMap = {
        dashboard: 'dashboardView',
        revenue: 'revenueView',
        calendar: 'calendarView',
        analytics: 'analyticsView',
        ai: 'aiView',
        abtesting: 'abtestingView',
        competitor: 'competitorView'
    };

    const viewId = viewMap[view];
    if (viewId) {
        document.getElementById(viewId).classList.add('active');

        // Update active tab
        const tabIndex = Object.keys(viewMap).indexOf(view);
        if (tabIndex >= 0) {
            document.querySelectorAll('.nav-tab')[tabIndex].classList.add('active');
        }

        // Initialize view-specific content
        if (view === 'calendar') {
            renderCalendar();
        } else if (view === 'analytics') {
            renderAnalytics();
        } else if (view === 'revenue') {
            if (typeof initRevenue === 'function') {
                initRevenue();
            }
        } else if (view === 'abtesting') {
            if (typeof renderABTestingView === 'function') {
                renderABTestingView();
            }
        } else if (view === 'competitor') {
            if (typeof renderCompetitorView === 'function') {
                renderCompetitorView();
            }
        }
    }
}

// Settings functions
function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    loadAISettings();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    saveAISettings();
    closeSettings();
    showToast('บันทึกการตั้งค่าแล้ว', 'success');
}

// Export/Import functionality
function exportToJSON() {
    const dataStr = JSON.stringify(contents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `story-dash-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Export JSON สำเร็จ!', 'success');
}

function exportToCSV() {
    const headers = ['Title', 'Category', 'Status', 'Platforms', 'Duration', 'Schedule', 'Script', 'Notes'];
    const rows = contents.map(c => [
        c.title,
        c.category,
        c.status,
        c.platforms.join(';'),
        c.duration || '',
        c.schedule || '',
        c.script || '',
        c.notes || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `story-dash-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV สำเร็จ!', 'success');
}

function printContent() {
    window.print();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                if (confirm('คุณต้องการแทนที่ข้อมูลเดิมทั้งหมดหรือไม่?')) {
                    contents = imported;
                    saveContents();
                    renderContents();
                    updateStats();
                    refreshAnalytics();
                    renderCalendar();
                    showToast('นำเข้าข้อมูลสำเร็จ!', 'success');
                }
            }
        } catch (error) {
            showToast('ไม่สามารถนำเข้าข้อมูลได้: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('⚠️ คุณแน่ใจว่าต้องการลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
        if (confirm('❗ยืนยันอีกครั้ง: ลบข้อมูลทั้งหมดจริงหรือไม่?')) {
            contents = [];
            saveContents();
            renderContents();
            updateStats();
            refreshAnalytics();
            renderCalendar();
            showToast('ลบข้อมูลทั้งหมดแล้ว', 'success');
        }
    }
}

// ===========================================
// UNIVERSAL MODAL CLOSE HANDLER
// ===========================================

// Close any modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        
        // Clean up any specific modals
        if (event.target.id === 'contentModal') {
            editingId = null;
        }
    }
});

// Close any modal with Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                
                // Clean up
                if (modal.id === 'contentModal') {
                    editingId = null;
                }
            }
        });
    }
});

console.log('🔒 Universal modal handlers loaded');

