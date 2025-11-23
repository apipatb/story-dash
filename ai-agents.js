// AI Agents - Specialized Helpers for Content Management
// These agents help with scheduling, optimization, and review

// ==================== Content Scheduler Agent ====================
// Suggests optimal posting times and organizes content calendar

function analyzeContentSchedule() {
    const schedulerResults = {
        recommendations: [],
        conflicts: [],
        gaps: [],
        optimizations: []
    };

    // Get all scheduled content
    const scheduledContent = contents.filter(c => c.schedule);
    const draftContent = contents.filter(c => c.status === 'draft' && !c.schedule);

    // Analyze by platform and category
    const platformStats = {};
    const categoryStats = {};

    scheduledContent.forEach(content => {
        content.platforms.forEach(platform => {
            if (!platformStats[platform]) platformStats[platform] = [];
            platformStats[platform].push(content);
        });

        if (!categoryStats[content.category]) categoryStats[content.category] = [];
        categoryStats[content.category].push(content);
    });

    // Find conflicts (multiple posts on same day/platform)
    Object.keys(platformStats).forEach(platform => {
        const dateMap = {};
        platformStats[platform].forEach(content => {
            const date = content.schedule.split('T')[0];
            if (!dateMap[date]) dateMap[date] = [];
            dateMap[date].push(content);
        });

        Object.keys(dateMap).forEach(date => {
            if (dateMap[date].length > 1) {
                schedulerResults.conflicts.push({
                    date,
                    platform,
                    count: dateMap[date].length,
                    content: dateMap[date].map(c => c.title)
                });
            }
        });
    });

    // Find gaps (days without content)
    const nextWeek = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        nextWeek.push(date.toISOString().split('T')[0]);
    }

    nextWeek.forEach(date => {
        const hasContent = scheduledContent.some(c => c.schedule && c.schedule.startsWith(date));
        if (!hasContent) {
            schedulerResults.gaps.push(date);
        }
    });

    // Generate recommendations for draft content
    if (draftContent.length > 0) {
        // Best times for each platform (based on general best practices)
        const bestTimes = {
            tiktok: ['12:00', '19:00', '21:00'],
            youtube: ['14:00', '17:00', '20:00'],
            facebook: ['13:00', '15:00', '19:00']
        };

        draftContent.slice(0, 5).forEach((content, index) => {
            const suggestedDate = new Date();
            suggestedDate.setDate(suggestedDate.getDate() + index + 1);
            const dateStr = suggestedDate.toISOString().split('T')[0];

            content.platforms.forEach(platform => {
                const time = bestTimes[platform]?.[index % 3] || '12:00';
                schedulerResults.recommendations.push({
                    contentId: content.id,
                    title: content.title,
                    platform,
                    suggestedTime: `${dateStr}T${time}`,
                    reason: `${platform} peak engagement time`
                });
            });
        });
    }

    // Optimization suggestions
    if (schedulerResults.conflicts.length > 0) {
        schedulerResults.optimizations.push({
            type: 'conflict',
            message: `พบ ${schedulerResults.conflicts.length} วันที่มีหลาย content ในแพลตฟอร์มเดียวกัน - ควรกระจายเวลา`,
            action: 'reschedule'
        });
    }

    if (schedulerResults.gaps.length > 3) {
        schedulerResults.optimizations.push({
            type: 'gap',
            message: `มี ${schedulerResults.gaps.length} วันที่ไม่มี content - ควรเพิ่ม content ให้สม่ำเสมอ`,
            action: 'fill_gaps'
        });
    }

    const categoryDistribution = Object.keys(categoryStats);
    if (categoryDistribution.length < 3) {
        schedulerResults.optimizations.push({
            type: 'variety',
            message: 'ควรเพิ่มความหลากหลายของหมวดหมู่ content',
            action: 'diversify'
        });
    }

    return schedulerResults;
}

function showSchedulerAgent() {
    showLoading('กำลังวิเคราะห์ตารางเนื้อหา...');

    setTimeout(() => {
        const results = analyzeContentSchedule();
        hideLoading();

        let html = `
            <div class="agent-results">
                <h2>📅 Content Scheduler Agent</h2>
                <p class="agent-subtitle">วิเคราะห์และเสนอแนะตารางเผยแพร่เนื้อหา</p>
        `;

        // Recommendations
        if (results.recommendations.length > 0) {
            html += `
                <div class="agent-section">
                    <h3>✨ คำแนะนำการกำหนดเวลา</h3>
                    <div class="recommendation-list">
            `;
            results.recommendations.forEach(rec => {
                const dateObj = new Date(rec.suggestedTime);
                const displayDate = dateObj.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                html += `
                    <div class="recommendation-item">
                        <div class="rec-title">${escapeHtml(rec.title)}</div>
                        <div class="rec-details">
                            <span class="badge badge-platform">${rec.platform}</span>
                            <span>📅 ${displayDate}</span>
                            <span class="rec-reason">${rec.reason}</span>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="applySchedule(${rec.contentId}, '${rec.suggestedTime}')">
                            ✓ ใช้เวลานี้
                        </button>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // Conflicts
        if (results.conflicts.length > 0) {
            html += `
                <div class="agent-section warning">
                    <h3>⚠️ ตรวจพบความขัดแย้ง</h3>
                    <ul>
            `;
            results.conflicts.forEach(conflict => {
                html += `<li>${conflict.date} - ${conflict.platform}: ${conflict.count} posts (${conflict.content.join(', ')})</li>`;
            });
            html += `</ul></div>`;
        }

        // Gaps
        if (results.gaps.length > 0) {
            html += `
                <div class="agent-section info">
                    <h3>📊 ช่วงว่างในตาราง</h3>
                    <p>ไม่มี content ในวันที่: ${results.gaps.map(g => new Date(g).toLocaleDateString('th-TH')).join(', ')}</p>
                </div>
            `;
        }

        // Optimizations
        if (results.optimizations.length > 0) {
            html += `
                <div class="agent-section success">
                    <h3>💡 ข้อเสนอแนะ</h3>
                    <ul>
            `;
            results.optimizations.forEach(opt => {
                html += `<li>${opt.message}</li>`;
            });
            html += `</ul></div>`;
        }

        html += `</div>`;

        showAgentModal('Content Scheduler', html);
    }, 1000);
}

// ==================== SEO/Viral Optimizer Agent ====================
// Analyzes content for viral potential and SEO

function analyzeSEOViral(content) {
    const analysis = {
        score: 0,
        maxScore: 100,
        strengths: [],
        weaknesses: [],
        suggestions: []
    };

    // Title Analysis (30 points)
    if (content.title) {
        const titleLength = content.title.length;
        if (titleLength >= 30 && titleLength <= 60) {
            analysis.score += 15;
            analysis.strengths.push('ความยาวหัวข้อเหมาะสม (30-60 ตัวอักษร)');
        } else {
            analysis.weaknesses.push(`ความยาวหัวข้อ ${titleLength} ตัวอักษร - แนะนำ 30-60 ตัวอักษร`);
            analysis.suggestions.push('ปรับความยาวหัวข้อให้อยู่ระหว่าง 30-60 ตัวอักษร');
        }

        // Check for question format
        if (content.title.includes('?') || content.title.includes('ทำไม') || content.title.includes('อย่างไร')) {
            analysis.score += 10;
            analysis.strengths.push('ใช้รูปแบบคำถาม - ดึงดูดความสนใจ');
        } else {
            analysis.suggestions.push('ลองเปลี่ยนหัวข้อเป็นรูปแบบคำถาม (ทำไม... ? อย่างไร... ?)');
        }

        // Check for numbers
        if (/\d+/.test(content.title)) {
            analysis.score += 5;
            analysis.strengths.push('มีตัวเลขในหัวข้อ - เพิ่มความน่าเชื่อถือ');
        }
    }

    // Script Analysis (40 points)
    if (content.script) {
        const scriptLength = content.script.length;

        // Check for hook
        if (content.script.toLowerCase().includes('hook')) {
            analysis.score += 15;
            analysis.strengths.push('มี Hook ที่ชัดเจน');
        } else {
            analysis.weaknesses.push('ไม่พบ Hook ในสคริปต์');
            analysis.suggestions.push('เพิ่ม Hook ที่น่าสนใจในช่วงเริ่มต้น 3 วินาทีแรก');
        }

        // Check for CTA
        if (content.script.toLowerCase().includes('cta') ||
            content.script.includes('แชร์') ||
            content.script.includes('คอมเมนต์') ||
            content.script.includes('ติดตาม')) {
            analysis.score += 10;
            analysis.strengths.push('มี Call-to-Action');
        } else {
            analysis.weaknesses.push('ไม่พบ Call-to-Action');
            analysis.suggestions.push('เพิ่ม CTA เช่น "แชร์ความคิดเห็น" "กดติดตาม" ในตอนท้าย');
        }

        // Check for story structure
        const hasProblem = content.script.includes('ปัญหา') || content.script.includes('แต่');
        const hasSolution = content.script.includes('วิธี') || content.script.includes('แนะนำ');
        if (hasProblem && hasSolution) {
            analysis.score += 15;
            analysis.strengths.push('มีโครงสร้างเรื่อง Problem-Solution');
        } else {
            analysis.suggestions.push('เพิ่มโครงสร้าง: ปัญหา → วิธีแก้ → ผลลัพธ์');
        }
    } else {
        analysis.weaknesses.push('ยังไม่มีสคริปต์');
        analysis.suggestions.push('เขียนสคริปต์เพื่อประเมินศักยภาพไวรัล');
    }

    // Hashtags Analysis (15 points)
    if (content.notes) {
        const hashtagCount = (content.notes.match(/#/g) || []).length;
        if (hashtagCount >= 3 && hashtagCount <= 8) {
            analysis.score += 10;
            analysis.strengths.push(`จำนวน Hashtags เหมาะสม (${hashtagCount})`);
        } else if (hashtagCount > 8) {
            analysis.weaknesses.push('Hashtags มากเกินไป - อาจดูสแปม');
            analysis.suggestions.push('ลด Hashtags เหลือ 3-8 tags');
        } else if (hashtagCount > 0) {
            analysis.suggestions.push('เพิ่ม Hashtags ให้ครบ 3-8 tags');
        }

        // Check for trending keywords
        if (content.notes.includes('#fyp') || content.notes.includes('#viral')) {
            analysis.score += 5;
        }
    } else {
        analysis.suggestions.push('เพิ่ม Hashtags 3-8 tags เพื่อเพิ่มการเข้าถึง');
    }

    // Platform Optimization (15 points)
    if (content.platforms.length >= 2) {
        analysis.score += 10;
        analysis.strengths.push('กระจายหลายแพลตฟอร์ม - เพิ่มการเข้าถึง');
    } else {
        analysis.suggestions.push('ลองโพสต์หลายแพลตฟอร์มเพื่อเพิ่มการเข้าถึง');
    }

    if (content.duration && content.duration >= 1 && content.duration <= 3) {
        analysis.score += 5;
        analysis.strengths.push('ความยาววิดีโอเหมาะสม (1-3 นาที)');
    } else if (!content.duration) {
        analysis.suggestions.push('กำหนดความยาววิดีโอ 1-3 นาที สำหรับ Shorts/TikTok');
    }

    return analysis;
}

function showSEOOptimizer(contentId) {
    const content = contents.find(c => c.id === contentId);
    if (!content) {
        showToast('ไม่พบ content', 'error');
        return;
    }

    showLoading('กำลังวิเคราะห์ SEO และศักยภาพไวรัล...');

    setTimeout(() => {
        const analysis = analyzeSEOViral(content);
        hideLoading();

        const scorePercent = (analysis.score / analysis.maxScore) * 100;
        const scoreColor = scorePercent >= 70 ? '#10b981' : scorePercent >= 40 ? '#f59e0b' : '#ef4444';
        const scoreLabel = scorePercent >= 70 ? 'ดีเยี่ยม' : scorePercent >= 40 ? 'พอใช้' : 'ต้องปรับปรุง';

        let html = `
            <div class="agent-results">
                <h2>🚀 SEO/Viral Optimizer Agent</h2>
                <p class="agent-subtitle">วิเคราะห์ศักยภาพไวรัล: <strong>${escapeHtml(content.title)}</strong></p>

                <div class="score-display">
                    <div class="score-circle" style="border-color: ${scoreColor}">
                        <span class="score-number" style="color: ${scoreColor}">${analysis.score}</span>
                        <span class="score-max">/ ${analysis.maxScore}</span>
                    </div>
                    <div class="score-label" style="color: ${scoreColor}">${scoreLabel}</div>
                </div>
        `;

        if (analysis.strengths.length > 0) {
            html += `
                <div class="agent-section success">
                    <h3>✅ จุดแข็ง</h3>
                    <ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
            `;
        }

        if (analysis.weaknesses.length > 0) {
            html += `
                <div class="agent-section warning">
                    <h3>⚠️ จุดอ่อน</h3>
                    <ul>${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                </div>
            `;
        }

        if (analysis.suggestions.length > 0) {
            html += `
                <div class="agent-section info">
                    <h3>💡 คำแนะนำปรับปรุง</h3>
                    <ul>${analysis.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
            `;
        }

        html += `
                <div class="agent-actions">
                    <button class="btn btn-primary" onclick="closeAgentModal(); editContent(${contentId})">
                        ✏️ แก้ไข Content
                    </button>
                </div>
            </div>
        `;

        showAgentModal('SEO Optimizer', html);
    }, 1000);
}

// ==================== Script Reviewer Agent ====================
// Reviews scripts for quality, flow, and engagement

function reviewScript(content) {
    const review = {
        overall: 'good',
        sections: [],
        issues: [],
        tips: [],
        engagement: 0
    };

    if (!content.script) {
        review.overall = 'incomplete';
        review.issues.push('ยังไม่มีสคริปต์');
        return review;
    }

    const script = content.script;
    const lines = script.split('\n').filter(l => l.trim());

    // Structure Analysis
    const hasHook = script.toLowerCase().includes('hook');
    const hasContent = script.toLowerCase().includes('เนื้อหา') || script.toLowerCase().includes('content');
    const hasCTA = script.toLowerCase().includes('cta');

    if (hasHook) {
        review.sections.push({ name: 'Hook', status: 'found', score: 30 });
        review.engagement += 30;
    } else {
        review.sections.push({ name: 'Hook', status: 'missing', score: 0 });
        review.issues.push('ไม่พบ Hook section - ควรเพิ่มประโยคเปิดที่ดึงดูดความสนใจ');
        review.tips.push('Hook ที่ดี: ใช้คำถาม, ข้อมูลน่าตกใจ, หรือสถานการณ์ที่น่าสนใจ');
    }

    if (hasContent) {
        review.sections.push({ name: 'Content', status: 'found', score: 40 });
        review.engagement += 40;
    } else {
        review.sections.push({ name: 'Content', status: 'missing', score: 0 });
        review.issues.push('ควรมีส่วน "เนื้อหา" ที่ชัดเจน');
    }

    if (hasCTA) {
        review.sections.push({ name: 'CTA', status: 'found', score: 30 });
        review.engagement += 30;
    } else {
        review.sections.push({ name: 'CTA', status: 'missing', score: 0 });
        review.issues.push('ไม่พบ Call-to-Action - ควรเพิ่มคำกระตุ้นให้ผู้ชมมีส่วนร่วม');
        review.tips.push('CTA ที่ดี: แชร์ความคิดเห็น, ติดตามเพื่อดูตอนต่อไป, บอกประสบการณ์');
    }

    // Length Analysis
    const wordCount = script.split(/\s+/).length;
    if (content.duration) {
        const expectedWords = content.duration * 150; // ~150 words per minute
        const ratio = wordCount / expectedWords;

        if (ratio >= 0.8 && ratio <= 1.2) {
            review.tips.push(`ความยาวสคริปต์เหมาะสม (~${wordCount} คำ สำหรับ ${content.duration} นาที)`);
        } else if (ratio < 0.8) {
            review.issues.push(`สคริปต์สั้นเกินไป (${wordCount} คำ) สำหรับ ${content.duration} นาที - ควรเพิ่มเนื้อหา`);
        } else {
            review.issues.push(`สคริปต์ยาวเกินไป (${wordCount} คำ) สำหรับ ${content.duration} นาที - ควรตัดทอน`);
        }
    }

    // Readability
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    if (avgLineLength > 200) {
        review.issues.push('ประโยคยาวเกินไป - ควรแบ่งเป็นประโยคสั้นๆ เพื่อง่ายต่อการอ่าน');
    }

    // Engagement Elements
    let engagementElements = 0;
    const questions = (script.match(/\?/g) || []).length;
    if (questions >= 2) {
        engagementElements++;
        review.tips.push(`มีคำถาม ${questions} คำถาม - ช่วยกระตุ้นการมีส่วนร่วม`);
    }

    if (script.includes('คุณ')) {
        engagementElements++;
        review.tips.push('ใช้คำว่า "คุณ" - สร้างการเชื่อมต่อกับผู้ชม');
    }

    if (engagementElements === 0) {
        review.issues.push('ควรเพิ่มการมีส่วนร่วม: ใช้คำถาม, พูดถึง "คุณ", หรือเชิญชวนให้คิดตาม');
    }

    // Overall Assessment
    const issueCount = review.issues.length;
    if (issueCount === 0) {
        review.overall = 'excellent';
    } else if (issueCount <= 2) {
        review.overall = 'good';
    } else if (issueCount <= 4) {
        review.overall = 'fair';
    } else {
        review.overall = 'needs-improvement';
    }

    return review;
}

function showScriptReviewer(contentId) {
    const content = contents.find(c => c.id === contentId);
    if (!content) {
        showToast('ไม่พบ content', 'error');
        return;
    }

    showLoading('กำลังวิเคราะห์สคริปต์...');

    setTimeout(() => {
        const review = reviewScript(content);
        hideLoading();

        const overallLabels = {
            'excellent': { text: 'ยอดเยี่ยม!', color: '#10b981', icon: '🌟' },
            'good': { text: 'ดี', color: '#6366f1', icon: '✅' },
            'fair': { text: 'พอใช้', color: '#f59e0b', icon: '⚠️' },
            'needs-improvement': { text: 'ต้องปรับปรุง', color: '#ef4444', icon: '❌' },
            'incomplete': { text: 'ไม่สมบูรณ์', color: '#6b7280', icon: '📝' }
        };

        const label = overallLabels[review.overall];

        let html = `
            <div class="agent-results">
                <h2>📝 Script Reviewer Agent</h2>
                <p class="agent-subtitle">วิเคราะห์สคริปต์: <strong>${escapeHtml(content.title)}</strong></p>

                <div class="review-overall" style="border-left: 4px solid ${label.color}">
                    <span class="review-icon">${label.icon}</span>
                    <span class="review-text" style="color: ${label.color}">
                        คะแนนรวม: ${label.text} (${review.engagement}/100)
                    </span>
                </div>
        `;

        if (review.sections.length > 0) {
            html += `
                <div class="agent-section">
                    <h3>📋 โครงสร้างสคริปต์</h3>
                    <div class="section-checklist">
            `;
            review.sections.forEach(section => {
                const icon = section.status === 'found' ? '✅' : '❌';
                html += `
                    <div class="checklist-item">
                        <span>${icon} ${section.name}</span>
                        <span class="score">${section.score}/100</span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        if (review.issues.length > 0) {
            html += `
                <div class="agent-section warning">
                    <h3>⚠️ ปัญหาที่พบ</h3>
                    <ul>${review.issues.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
            `;
        }

        if (review.tips.length > 0) {
            html += `
                <div class="agent-section success">
                    <h3>💡 เคล็ดลับและจุดเด่น</h3>
                    <ul>${review.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                </div>
            `;
        }

        html += `
                <div class="agent-actions">
                    <button class="btn btn-primary" onclick="closeAgentModal(); editContent(${contentId})">
                        ✏️ แก้ไขสคริปต์
                    </button>
                    <button class="btn btn-secondary" onclick="closeAgentModal(); openAIModal('improve', ${contentId})">
                        🤖 ให้ AI ปรับปรุง
                    </button>
                </div>
            </div>
        `;

        showAgentModal('Script Reviewer', html);
    }, 1000);
}

// ==================== Helper Functions ====================

let agentModalVisible = false;

function showAgentModal(title, content) {
    let modal = document.getElementById('agentModal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'agentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <span class="close" onclick="closeAgentModal()">&times;</span>
                <div id="agentModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('agentModalContent').innerHTML = content;
    modal.style.display = 'block';
    agentModalVisible = true;
}

function closeAgentModal() {
    const modal = document.getElementById('agentModal');
    if (modal) {
        modal.style.display = 'none';
    }
    agentModalVisible = false;
}

function applySchedule(contentId, suggestedTime) {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    content.schedule = suggestedTime;
    saveContents();
    renderContents();
    renderCalendar();

    showToast(`กำหนดเวลาสำหรับ "${content.title}" แล้ว`, 'success');
    closeAgentModal();
}

// Add AI Agent buttons to content items
function addAgentButtons(contentId) {
    return `
        <div class="agent-quick-actions">
            <button class="btn-icon" onclick="showSEOOptimizer(${contentId})" title="วิเคราะห์ SEO/Viral">
                🚀
            </button>
            <button class="btn-icon" onclick="showScriptReviewer(${contentId})" title="ตรวจสอบสคริปต์">
                📝
            </button>
        </div>
    `;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('agentModal');
    if (event.target === modal) {
        closeAgentModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && agentModalVisible) {
        closeAgentModal();
    }
});
