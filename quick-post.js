// Quick Post - Create and Post Content in One Simple Page
// ทำให้การสร้างและโพสต์ content ง่ายขึ้นมาก!

function openQuickPost() {
    const html = `
        <div class="quick-post-container">
            <h2>🚀 Quick Post - สร้างและโพสต์เลย!</h2>
            <p class="quick-post-subtitle">กรอกข้อมูล → กด Post → เสร็จ! ง่ายๆ ภายใน 1 นาที</p>

            <form id="quickPostForm" onsubmit="submitQuickPost(event)">
                <!-- Step 1: หัวข้อ -->
                <div class="quick-post-section">
                    <div class="section-number">1</div>
                    <div class="section-content">
                        <label>📝 หัวข้อ / ไอเดีย *</label>
                        <input type="text" id="qpTitle" required placeholder="เช่น: ทำไมต้องไม่หวีผมตอนเย็น?" class="quick-input">
                    </div>
                </div>

                <!-- Step 2: เลือก Template (Optional) -->
                <div class="quick-post-section">
                    <div class="section-number">2</div>
                    <div class="section-content">
                        <label>📋 เลือก Template (ถ้าต้องการ)</label>
                        <select id="qpTemplate" onchange="loadQuickTemplate()" class="quick-input">
                            <option value="">-- ไม่ใช้ Template / เขียนเอง --</option>
                            <option value="superstition">🪬 ความเชื่อ: ทำไมต้อง/ห้าม...</option>
                            <option value="science">🔬 วิทยาศาสตร์ vs ความเชื่อ</option>
                            <option value="legend">📖 เล่าเรื่อง/ตำนาน</option>
                            <option value="quickfacts">💡 Quick Facts / รู้หรือไม่</option>
                        </select>
                    </div>
                </div>

                <!-- Step 3: Script -->
                <div class="quick-post-section">
                    <div class="section-number">3</div>
                    <div class="section-content">
                        <label>📜 Script / เนื้อหา *</label>
                        <textarea id="qpScript" rows="8" required placeholder="เขียน script ที่นี่...

ตัวอย่าง:
Hook: คุณเคยได้ยินว่า...
เนื้อหา: ...
CTA: กดไลก์ถ้าเห็นด้วย!" class="quick-input"></textarea>
                        <div class="script-info">
                            <span id="qpWordCount">0 คำ</span>
                            <span id="qpReadTime">~0 วินาที</span>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Platform -->
                <div class="quick-post-section">
                    <div class="section-number">4</div>
                    <div class="section-content">
                        <label>📱 โพสต์ไปที่ไหน? *</label>
                        <div class="platform-quick-select">
                            <label class="platform-option">
                                <input type="checkbox" id="qpTikTok" value="tiktok" checked>
                                <div class="platform-card">
                                    <span class="platform-icon">🎵</span>
                                    <span class="platform-name">TikTok</span>
                                </div>
                            </label>
                            <label class="platform-option">
                                <input type="checkbox" id="qpYouTube" value="youtube" checked>
                                <div class="platform-card">
                                    <span class="platform-icon">📹</span>
                                    <span class="platform-name">YouTube</span>
                                </div>
                            </label>
                            <label class="platform-option">
                                <input type="checkbox" id="qpFacebook" value="facebook" checked>
                                <div class="platform-card">
                                    <span class="platform-icon">👥</span>
                                    <span class="platform-name">Facebook</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Step 5: Auto-Post Settings -->
                <div class="quick-post-section">
                    <div class="section-number">5</div>
                    <div class="section-content">
                        <label>🤖 Auto-Post ไปยัง Platform จริงเลย?</label>
                        <div class="auto-post-options">
                            <label class="auto-post-option">
                                <input type="radio" name="qpAutoPost" value="save" checked>
                                <div class="option-card">
                                    <span class="option-icon">💾</span>
                                    <div class="option-text">
                                        <strong>บันทึกอย่างเดียว</strong>
                                        <small>เก็บไว้ใน Dashboard ก่อน</small>
                                    </div>
                                </div>
                            </label>
                            <label class="auto-post-option">
                                <input type="radio" name="qpAutoPost" value="post">
                                <div class="option-card">
                                    <span class="option-icon">🚀</span>
                                    <div class="option-text">
                                        <strong>Post เลย!</strong>
                                        <small>Auto-post ไปยัง platforms ที่เลือก</small>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Step 6: เพิ่มเติม (Optional) -->
                <div class="quick-post-section collapsible">
                    <div class="section-number">6</div>
                    <div class="section-content">
                        <label onclick="toggleQuickSection('qpOptional')" style="cursor: pointer;">
                            ⚙️ ตั้งค่าเพิ่มเติม (Optional)
                            <span id="qpOptionalToggle">▼</span>
                        </label>
                        <div id="qpOptional" style="display: none; margin-top: 12px;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>หมวดหมู่</label>
                                    <select id="qpCategory" class="quick-input">
                                        <option value="superstition">ความเชื่อ/งมงาย</option>
                                        <option value="science">วิทยาศาสตร์</option>
                                        <option value="culture">วัฒนธรรม</option>
                                        <option value="legend">ตำนาน</option>
                                        <option value="other">อื่นๆ</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>ความยาววิดีโอ (นาที)</label>
                                    <input type="number" id="qpDuration" min="0.5" max="10" step="0.5" value="2" class="quick-input">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>📝 โน้ต / Hashtags</label>
                                <input type="text" id="qpNotes" placeholder="#ความเชื่อไทย #วิทยาศาสตร์" class="quick-input">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="quick-post-actions">
                    <button type="button" class="btn btn-secondary btn-large" onclick="closeQuickPost()">
                        ยกเลิก
                    </button>
                    <button type="submit" class="btn btn-success btn-large quick-post-btn">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">สร้างและ Post เลย!</span>
                    </button>
                </div>
            </form>
        </div>
    `;

    showAgentModal('Quick Post', html, 'quick-post-modal');

    // Add input listeners
    const scriptInput = document.getElementById('qpScript');
    if (scriptInput) {
        scriptInput.addEventListener('input', updateQuickScriptInfo);
    }
}

function loadQuickTemplate() {
    const templateSelect = document.getElementById('qpTemplate');
    const scriptArea = document.getElementById('qpScript');
    const categorySelect = document.getElementById('qpCategory');

    if (!templateSelect || !scriptArea) return;

    const templates = {
        'superstition': {
            script: `Hook: คุณเคยได้ยินว่า "[ใส่ความเชื่อ]" ไหม?

เนื้อหา:
• ความเชื่อโบราณบอกว่า [อธิบายความเชื่อ]
• เหตุผลที่คนเชื่อเพราะ [ที่มาของความเชื่อ]
• แต่ทางวิทยาศาสตร์อธิบายว่า [มุมมองวิทยาศาสตร์]

Twist: จริง ๆ แล้ว [ข้อเท็จจริงที่น่าสนใจ]

CTA: คุณเชื่อไหม? แชร์ความคิดเห็นกันเถอะ!`,
            category: 'superstition'
        },
        'science': {
            script: `Hook: "คนโบราณว่า [ความเชื่อ]" แต่วิทยาศาสตร์บอกอะไร?

ส่วนที่ 1 - ความเชื่อ:
• [อธิบายความเชื่อโบราณ]
• ที่มาจาก [แหล่งที่มา]

ส่วนที่ 2 - วิทยาศาสตร์:
• การศึกษาพบว่า [ข้อค้นพบ]
• เหตุผลคือ [คำอธิบายทางวิทยาศาสตร์]

สรุป: [ข้อสรุปที่สมเหตุสมผล]

CTA: ฝั่งไหนน่าเชื่อกว่า? Comment มาคุย!`,
            category: 'science'
        },
        'legend': {
            script: `Hook: เคยได้ยินเรื่อง [ชื่อตำนาน] ไหม?

เนื้อเรื่อง:
• มีคนเล่าว่า [เริ่มเรื่อง]
• แล้วก็เกิดเหตุการณ์ [เนื้อเรื่องหลัก]
• สุดท้าย [ตอนจบ]

บทสรุป:
• เรื่องนี้สอนให้รู้ว่า [คุณค่าที่ได้]
• หลายคนยังเชื่อถึงทุกวันนี้

CTA: ใครเคยได้ยินเรื่องนี้บ้าง? เล่าต่อกันมา!`,
            category: 'legend'
        },
        'quickfacts': {
            script: `Hook: รู้หรือไม่? [ข้อเท็จจริงน่าสนใจ]

Fact #1: [ข้อเท็จจริงที่ 1]
Fact #2: [ข้อเท็จจริงที่ 2]
Fact #3: [ข้อเท็จจริงที่ 3]

Extra: ที่น่าสนใจคือ [bonus fact]

CTA: บอกต่อเพื่อน ๆ ด้วย! กด share!`,
            category: 'other'
        }
    };

    const template = templates[templateSelect.value];
    if (template) {
        scriptArea.value = template.script;
        if (categorySelect) categorySelect.value = template.category;
        updateQuickScriptInfo();
        showToast('โหลด Template แล้ว! แก้ไขตามใจชอบเลย', 'success');
    }
}

function updateQuickScriptInfo() {
    const script = document.getElementById('qpScript')?.value || '';
    const wordCount = script.trim().split(/\s+/).filter(w => w.length > 0).length;
    const readTime = Math.max(30, Math.round(wordCount * 0.4)); // ~150 words/min for Thai

    const wordCountEl = document.getElementById('qpWordCount');
    const readTimeEl = document.getElementById('qpReadTime');

    if (wordCountEl) wordCountEl.textContent = `${wordCount} คำ`;
    if (readTimeEl) readTimeEl.textContent = `~${readTime} วินาที`;
}

function toggleQuickSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggle = document.getElementById(sectionId + 'Toggle');

    if (section && toggle) {
        const isHidden = section.style.display === 'none';
        section.style.display = isHidden ? 'block' : 'none';
        toggle.textContent = isHidden ? '▲' : '▼';
    }
}

function submitQuickPost(event) {
    event.preventDefault();

    // Get form values
    const title = document.getElementById('qpTitle')?.value;
    const script = document.getElementById('qpScript')?.value;
    const category = document.getElementById('qpCategory')?.value || 'other';
    const duration = parseFloat(document.getElementById('qpDuration')?.value) || 2;
    const notes = document.getElementById('qpNotes')?.value || '';

    // Get selected platforms
    const platforms = [];
    if (document.getElementById('qpTikTok')?.checked) platforms.push('tiktok');
    if (document.getElementById('qpYouTube')?.checked) platforms.push('youtube');
    if (document.getElementById('qpFacebook')?.checked) platforms.push('facebook');

    // Get auto-post option
    const autoPostMode = document.querySelector('input[name="qpAutoPost"]:checked')?.value || 'save';

    if (platforms.length === 0) {
        showToast('กรุณาเลือกอย่างน้อย 1 platform', 'warning');
        return;
    }

    // Validate
    if (!title || !script) {
        showToast('กรุณากรอกหัวข้อและ script', 'warning');
        return;
    }

    // Show loading
    const loadingMsg = autoPostMode === 'post' ? 'กำลังสร้างและโพสต์ไปยัง platforms...' : 'กำลังบันทึก...';
    showLoading(loadingMsg);

    // Create content object
    const newContent = {
        id: Date.now(),
        title: title,
        category: category,
        platforms: platforms,
        script: script,
        duration: duration,
        schedule: new Date().toISOString().split('T')[0],
        status: autoPostMode === 'post' ? 'posted' : 'ready', // Set status based on auto-post mode
        notes: notes,
        createdAt: Date.now(),
        monetization: {
            views: {
                tiktok: 0,
                youtube: 0,
                facebook: 0
            },
            revenue: {
                ads: 0,
                brand: 0,
                affiliate: 0
            }
        }
    };

    // Add to contents array
    contents.push(newContent);

    // Save to localStorage
    saveContents();

    // Save to Supabase if available
    if (typeof supabaseInsertContent === 'function' && currentUser) {
        supabaseInsertContent(newContent);
    }

    // If auto-post mode, actually post to platforms
    if (autoPostMode === 'post') {
        performAutoPost(newContent, platforms);
    } else {
        // Just save - show success immediately
        finishQuickPost('💾 บันทึกสำเร็จ! พร้อมโพสต์ทีหลัง');
    }
}

function performAutoPost(content, platforms) {
    // Check if platforms are configured
    const configs = JSON.parse(localStorage.getItem('platformConfigs') || '{}');

    let postedTo = [];
    let failedPlatforms = [];

    // Post to each platform
    platforms.forEach(platform => {
        if (platform === 'youtube' && configs.youtube_api_key) {
            // Post to YouTube using API
            postToYouTube(content, configs.youtube_api_key)
                .then(() => postedTo.push('YouTube'))
                .catch(() => failedPlatforms.push('YouTube'));
        } else if (platform === 'facebook' && configs.facebook_access_token) {
            // Post to Facebook using API
            postToFacebook(content, configs.facebook_access_token)
                .then(() => postedTo.push('Facebook'))
                .catch(() => failedPlatforms.push('Facebook'));
        } else if (platform === 'tiktok') {
            // TikTok - mark as pending manual upload
            showToast('📱 TikTok: ใช้ TikTok app เพื่ออัพโหลดวิดีโอ', 'info');
            postedTo.push('TikTok (pending)');
        } else {
            // Platform not configured
            failedPlatforms.push(platform);
        }
    });

    // Finish after posting attempts
    setTimeout(() => {
        let message = '🎉 สร้างสำเร็จ!';
        if (postedTo.length > 0) {
            message = `🎉 โพสต์สำเร็จไปยัง: ${postedTo.join(', ')}!`;
        }
        if (failedPlatforms.length > 0) {
            message += ` (${failedPlatforms.join(', ')} ยังไม่ได้ตั้งค่า API)`;
        }
        finishQuickPost(message);
    }, 1500);
}

function finishQuickPost(message) {
    hideLoading();
    renderContents();
    updateStats();

    // Initialize revenue if on revenue view
    if (typeof initRevenue === 'function') {
        initRevenue();
    }

    closeQuickPost();

    // Show success
    showToast(message, 'success');

    // Switch to dashboard view to see the new content
    if (typeof switchView === 'function') {
        switchView('dashboard');
    }
}

// Platform posting functions (placeholders - integrate with existing auto-poster.js)
async function postToYouTube(content, apiKey) {
    // Use YouTube Data API to upload
    // This would integrate with auto-poster.js uploadToYouTube function
    if (typeof uploadToYouTube === 'function') {
        return uploadToYouTube(content, apiKey);
    }
    return Promise.resolve();
}

async function postToFacebook(content, accessToken) {
    // Use Facebook Graph API to post
    // This would integrate with auto-poster.js uploadToFacebook function
    if (typeof uploadToFacebook === 'function') {
        return uploadToFacebook(content, accessToken);
    }
    return Promise.resolve();
}

function closeQuickPost() {
    const modal = document.querySelector('.quick-post-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Fallback to regular modal close
    closeAgentModal();
}

// Helper function to show agent modal with custom class
function showAgentModal(title, html, customClass = '') {
    // Try to use existing modal or create new one
    let modal = document.getElementById('aiModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aiModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    if (customClass) {
        modal.classList.add(customClass);
    }

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <span class="close" onclick="closeQuickPost()">&times;</span>
            ${html}
        </div>
    `;

    modal.style.display = 'block';
}
