// Calendar View - Content Schedule Management

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Render calendar
function renderCalendar() {
    const title = document.getElementById('calendarTitle');
    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    title.textContent = `${monthNames[currentMonth]} ${currentYear + 543}`;

    const grid = document.getElementById('calendarGrid');
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create calendar grid
    let html = '<div class="calendar-days">';
    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
    dayNames.forEach(day => {
        html += `<div class="calendar-day-name">${day}</div>`;
    });
    html += '</div>';

    html += '<div class="calendar-dates">';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-date empty"></div>';
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = formatDateForCalendar(date);
        const isToday = isDateToday(date);
        const hasContent = getContentByDate(dateStr).length > 0;

        let classes = 'calendar-date';
        if (isToday) classes += ' today';
        if (hasContent) classes += ' has-content';

        html += `<div class="${classes}" onclick="showDateContent('${dateStr}')">`;
        html += `<span class="date-number">${day}</span>`;
        if (hasContent) {
            html += `<span class="content-indicator">${getContentByDate(dateStr).length}</span>`;
        }
        html += '</div>';
    }

    html += '</div>';
    grid.innerHTML = html;

    // Render events list
    renderCalendarEvents();
}

// Previous month
function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

// Next month
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// Check if date is today
function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Format date for calendar
function formatDateForCalendar(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get content by date
function getContentByDate(dateStr) {
    return contents.filter(c => c.schedule === dateStr);
}

// Show date content
function showDateContent(dateStr) {
    const dateContents = getContentByDate(dateStr);

    if (dateContents.length === 0) {
        alert('ไม่มีคอนเทนต์ที่กำหนดวันนี้');
        return;
    }

    // Switch to dashboard view and filter
    switchView('dashboard');

    // Scroll to content list
    setTimeout(() => {
        document.getElementById('contentList').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Render calendar events
function renderCalendarEvents() {
    const eventList = document.getElementById('eventList');

    // Get all scheduled contents
    const scheduled = contents
        .filter(c => c.schedule)
        .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

    if (scheduled.length === 0) {
        eventList.innerHTML = '<p class="info-text">ยังไม่มีคอนเทนต์ที่กำหนดวันโพสต์</p>';
        return;
    }

    // Group by date
    const grouped = {};
    scheduled.forEach(content => {
        if (!grouped[content.schedule]) {
            grouped[content.schedule] = [];
        }
        grouped[content.schedule].push(content);
    });

    let html = '';
    Object.entries(grouped).forEach(([date, items]) => {
        const dateObj = new Date(date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const isUpcoming = dateObj >= new Date();
        const isPast = dateObj < new Date();

        html += `<div class="calendar-event-group ${isPast ? 'past' : ''}">`;
        html += `<h4>${formattedDate} ${isUpcoming ? '🔜' : '✅'}</h4>`;

        items.forEach(content => {
            const statusClass = content.status;
            const statusLabels = {
                draft: 'Draft',
                ready: 'Ready',
                posted: 'Posted'
            };

            html += `<div class="calendar-event ${statusClass}">`;
            html += `<div class="event-title">${escapeHtml(content.title)}</div>`;
            html += `<div class="event-meta">`;
            html += `<span class="badge badge-status ${statusClass}">${statusLabels[statusClass]}</span>`;

            content.platforms.forEach(platform => {
                const icons = { tiktok: '🎵', youtube: '📹', facebook: '👥' };
                html += `<span>${icons[platform]}</span>`;
            });

            html += `</div>`;
            html += `</div>`;
        });

        html += `</div>`;
    });

    eventList.innerHTML = html;
}

// Initialize calendar when view is shown
function initCalendar() {
    renderCalendar();
}
