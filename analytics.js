// Analytics - Performance Tracking and Statistics

// Render analytics
function renderAnalytics() {
    renderCategoryStats();
    renderStatusStats();
    renderPlatformStats();
    renderTimelineStats();
    renderPerformanceTracking();
}

// Category statistics
function renderCategoryStats() {
    const categoryCount = {};
    const categoryLabels = {
        'superstition': 'ความเชื่อ/งมงาย',
        'science': 'วิทยาศาสตร์',
        'culture': 'วัฒนธรรม',
        'legend': 'ตำนาน',
        'other': 'อื่นๆ'
    };

    contents.forEach(content => {
        categoryCount[content.category] = (categoryCount[content.category] || 0) + 1;
    });

    const statsDiv = document.getElementById('categoryStats');
    let html = '<div class="stats-list">';

    Object.entries(categoryCount).forEach(([category, count]) => {
        const percentage = (count / contents.length * 100).toFixed(1);
        html += `
            <div class="stat-item">
                <div class="stat-label">${categoryLabels[category]}</div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="stat-value">${count} (${percentage}%)</div>
            </div>
        `;
    });

    html += '</div>';
    statsDiv.innerHTML = html;
}

// Status statistics
function renderStatusStats() {
    const statusCount = {
        draft: 0,
        ready: 0,
        posted: 0
    };

    contents.forEach(content => {
        statusCount[content.status]++;
    });

    const statsDiv = document.getElementById('statusStats');
    const total = contents.length || 1;

    const statusLabels = {
        draft: 'Draft',
        ready: 'Ready to Post',
        posted: 'Posted'
    };

    const statusColors = {
        draft: '#f59e0b',
        ready: '#6366f1',
        posted: '#10b981'
    };

    let html = '<div class="stats-list">';

    Object.entries(statusCount).forEach(([status, count]) => {
        const percentage = (count / total * 100).toFixed(1);
        html += `
            <div class="stat-item">
                <div class="stat-label">${statusLabels[status]}</div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%; background: ${statusColors[status]}"></div>
                </div>
                <div class="stat-value">${count} (${percentage}%)</div>
            </div>
        `;
    });

    html += '</div>';

    // Completion rate
    const completionRate = ((statusCount.posted / total) * 100).toFixed(1);
    html += `
        <div class="stat-summary">
            <strong>Completion Rate:</strong> ${completionRate}%
            <br>
            <small>${statusCount.posted} จาก ${total} คอนเทนต์ที่โพสต์แล้ว</small>
        </div>
    `;

    statsDiv.innerHTML = html;
}

// Platform statistics
function renderPlatformStats() {
    const platformCount = {
        tiktok: 0,
        youtube: 0,
        facebook: 0
    };

    contents.forEach(content => {
        content.platforms.forEach(platform => {
            platformCount[platform]++;
        });
    });

    const statsDiv = document.getElementById('platformStats');

    const platformLabels = {
        tiktok: '🎵 TikTok',
        youtube: '📹 YouTube',
        facebook: '👥 Facebook'
    };

    let html = '<div class="stats-list">';

    Object.entries(platformCount).forEach(([platform, count]) => {
        const percentage = contents.length > 0 ? (count / contents.length * 100).toFixed(1) : 0;
        html += `
            <div class="stat-item">
                <div class="stat-label">${platformLabels[platform]}</div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="stat-value">${count} contents</div>
            </div>
        `;
    });

    html += '</div>';

    // Most used platform
    const mostUsed = Object.entries(platformCount).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    if (mostUsed[1] > 0) {
        html += `
            <div class="stat-summary">
                <strong>แพลตฟอร์มที่ใช้บ่อยที่สุด:</strong> ${platformLabels[mostUsed[0]]}
            </div>
        `;
    }

    statsDiv.innerHTML = html;
}

// Timeline statistics
function renderTimelineStats() {
    const statsDiv = document.getElementById('timelineStats');

    // Count by month
    const monthCount = {};
    const now = new Date();

    contents.forEach(content => {
        const date = new Date(content.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
    });

    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months.push({
            key,
            label: d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
            count: monthCount[key] || 0
        });
    }

    const maxCount = Math.max(...months.map(m => m.count), 1);

    let html = '<div class="timeline-chart">';

    months.forEach(month => {
        const height = (month.count / maxCount * 100);
        html += `
            <div class="timeline-bar">
                <div class="bar-fill" style="height: ${height}%">
                    <span class="bar-label">${month.count}</span>
                </div>
                <div class="bar-month">${month.label}</div>
            </div>
        `;
    });

    html += '</div>';

    // Statistics
    const totalThisMonth = months[months.length - 1].count;
    const totalLastMonth = months[months.length - 2]?.count || 0;
    const trend = totalThisMonth - totalLastMonth;

    html += `
        <div class="stat-summary">
            <strong>เดือนนี้:</strong> ${totalThisMonth} contents
            ${trend > 0 ? `<span style="color: #10b981">▲ +${trend}</span>` : trend < 0 ? `<span style="color: #ef4444">▼ ${trend}</span>` : ''}
            <br>
            <small>เฉลี่ย: ${(contents.length / 6).toFixed(1)} contents/เดือน</small>
        </div>
    `;

    statsDiv.innerHTML = html;
}

// Performance tracking
function renderPerformanceTracking() {
    const perfDiv = document.getElementById('performanceList');

    const postedContents = contents.filter(c => c.status === 'posted');

    if (postedContents.length === 0) {
        perfDiv.innerHTML = '<p class="info-text">ยังไม่มีคอนเทนต์ที่โพสต์ ให้เพิ่มข้อมูล views, likes, shares ใน content ที่โพสต์แล้ว</p>';
        return;
    }

    let html = '<div class="performance-table">';
    html += `
        <div class="perf-header">
            <div>Title</div>
            <div>Platform</div>
            <div>Posted</div>
            <div>Status</div>
        </div>
    `;

    postedContents.slice(0, 10).forEach(content => {
        const postedDate = content.schedule ?
            new Date(content.schedule).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) :
            'N/A';

        const platformIcons = {
            tiktok: '🎵',
            youtube: '📹',
            facebook: '👥'
        };

        html += `
            <div class="perf-row">
                <div class="perf-title">${escapeHtml(content.title)}</div>
                <div class="perf-platforms">
                    ${content.platforms.map(p => platformIcons[p]).join(' ')}
                </div>
                <div class="perf-date">${postedDate}</div>
                <div class="perf-status">
                    <span class="badge badge-status posted">Posted</span>
                </div>
            </div>
        `;
    });

    html += '</div>';

    html += `
        <div class="info-text" style="margin-top: 20px;">
            💡 <strong>Next Feature:</strong> เพิ่มการติดตาม views, likes, shares และ engagement rate
            ในแต่ละ content เพื่อวิเคราะห์ performance ได้ดียิ่งขึ้น
        </div>
    `;

    perfDiv.innerHTML = html;
}

// Initialize analytics
function initAnalytics() {
    renderAnalytics();
}

// Refresh analytics when contents change
function refreshAnalytics() {
    if (document.getElementById('analyticsView').classList.contains('active')) {
        renderAnalytics();
    }
}
