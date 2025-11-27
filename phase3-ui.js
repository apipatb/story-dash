// Phase 3 UI Handlers - A/B Testing & Competitor Analysis
// จัดการ UI สำหรับฟีเจอร์ Phase 3

// ===========================================
// A/B TESTING UI
// ===========================================

function renderABTestingView() {
    renderActiveTests();
    renderCompletedTests();
}

function renderActiveTests() {
    const container = document.getElementById('activeTestsList');
    const activeTests = abTesting.getActiveTests();

    if (activeTests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📊 ยังไม่มี A/B Tests ที่กำลังทำงาน</p>
                <button class="btn btn-primary" onclick="createNewABTest()">+ สร้าง Test แรก</button>
            </div>
        `;
        return;
    }

    let html = '<div class="tests-grid">';

    activeTests.forEach(test => {
        const progress = calculateTestProgress(test);

        html += `
            <div class="test-card">
                <div class="test-header">
                    <h4>${test.name}</h4>
                    <span class="badge badge-status active">Active</span>
                </div>

                <p class="test-description">${test.description}</p>

                <div class="test-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}% complete</span>
                </div>

                <div class="test-stats">
                    <div class="stat">
                        <span class="label">Variants:</span>
                        <span class="value">${test.variants.length}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Total Views:</span>
                        <span class="value">${getTotalViews(test)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Started:</span>
                        <span class="value">${formatDate(test.startDate)}</span>
                    </div>
                </div>

                <div class="test-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewTestDetails('${test.id}')">
                        📊 View Details
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="stopTest('${test.id}')">
                        ⏸️ Stop Test
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function renderCompletedTests() {
    const container = document.getElementById('completedTestsList');
    const completedTests = abTesting.tests.filter(t => t.status === 'completed');

    if (completedTests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🏆 ยังไม่มี Tests ที่เสร็จสิ้น</p>
            </div>
        `;
        return;
    }

    let html = '<div class="tests-grid">';

    completedTests.slice(0, 6).forEach(test => {
        html += `
            <div class="test-card completed">
                <div class="test-header">
                    <h4>${test.name}</h4>
                    <span class="badge badge-status completed">Completed</span>
                </div>

                <div class="winner-section">
                    <div class="winner-label">🏆 Winner:</div>
                    <div class="winner-name">${test.winner?.name || 'N/A'}</div>
                    <div class="confidence">Confidence: ${test.confidence?.toFixed(1) || 0}%</div>
                </div>

                <div class="test-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewTestReport('${test.id}')">
                        📄 View Report
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTest('${test.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function createNewABTest() {
    // สร้าง modal สำหรับ A/B Test
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'createABTestModal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeCreateABTest()">&times;</span>
            <h2>🧪 สร้าง A/B Test ใหม่</h2>

            <div class="form-group">
                <label>Test Name</label>
                <input type="text" id="testName" placeholder="เช่น: Title Variants Test">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea id="testDescription" rows="3" placeholder="อธิบายสิ่งที่ต้องการทดสอบ"></textarea>
            </div>

            <div class="form-group">
                <label>เลือก Content ที่จะทดสอบ</label>
                <select id="testContentId">
                    <option value="">-- เลือก Content --</option>
                </select>
            </div>

            <div class="form-group">
                <label>ทดสอบอะไร?</label>
                <select id="testType" onchange="updateTestTypeOptions()">
                    <option value="title">Title (หัวข้อ)</option>
                    <option value="thumbnail">Thumbnail (ภาพหน้าปก)</option>
                    <option value="hashtags">Hashtags</option>
                    <option value="time">Posting Time</option>
                </select>
            </div>

            <div id="variantsPreview" class="variants-preview">
                <!-- Variants will be shown here -->
            </div>

            <div class="modal-actions">
                <button class="btn btn-primary" onclick="submitCreateABTest()">สร้าง Test</button>
                <button class="btn btn-secondary" onclick="closeCreateABTest()">ยกเลิก</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // โหลด contents
    loadContentsForABTest();
}

function loadContentsForABTest() {
    const select = document.getElementById('testContentId');
    const contents = JSON.parse(localStorage.getItem('contents') || '[]');

    contents.forEach(content => {
        const option = document.createElement('option');
        option.value = content.id;
        option.textContent = content.title;
        select.appendChild(option);
    });
}

function updateTestTypeOptions() {
    const type = document.getElementById('testType').value;
    const contentId = document.getElementById('testContentId').value;

    if (!contentId) {
        showToast('กรุณาเลือก Content ก่อน', 'warning');
        return;
    }

    const contents = JSON.parse(localStorage.getItem('contents') || '[]');
    const content = contents.find(c => c.id === contentId);

    if (!content) return;

    let variants = [];

    switch (type) {
        case 'title':
            variants = abTesting.createTitleVariants(content.title);
            break;
        case 'hashtags':
            variants = abTesting.createHashtagVariants(content.hashtags);
            break;
        case 'time':
            variants = abTesting.createPostingTimeVariants();
            break;
    }

    showVariantsPreview(variants);
}

function showVariantsPreview(variants) {
    const container = document.getElementById('variantsPreview');

    let html = '<h4>Variants ที่จะทดสอบ:</h4><div class="variants-list">';

    variants.forEach((variant, index) => {
        html += `
            <div class="variant-item">
                <strong>${variant.name}:</strong>
                <span>${variant.value || variant.description}</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function submitCreateABTest() {
    const name = document.getElementById('testName').value;
    const description = document.getElementById('testDescription').value;
    const contentId = document.getElementById('testContentId').value;
    const type = document.getElementById('testType').value;

    if (!name || !contentId) {
        showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
        return;
    }

    const contents = JSON.parse(localStorage.getItem('contents') || '[]');
    const content = contents.find(c => c.id === contentId);

    let variants = [];

    switch (type) {
        case 'title':
            variants = abTesting.createTitleVariants(content.title);
            break;
        case 'hashtags':
            variants = abTesting.createHashtagVariants(content.hashtags);
            break;
        case 'time':
            variants = abTesting.createPostingTimeVariants();
            break;
    }

    try {
        const test = abTesting.createTest({
            name,
            description,
            contentId,
            variants,
            metrics: ['views', 'likes', 'engagement']
        });

        showToast('✅ สร้าง A/B Test สำเร็จ!', 'success');
        closeCreateABTest();
        renderABTestingView();

    } catch (error) {
        showToast('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
}

function closeCreateABTest() {
    const modal = document.getElementById('createABTestModal');
    if (modal) modal.remove();
}

function viewTestDetails(testId) {
    const results = abTesting.getTestResults(testId);
    if (!results) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'testDetailsModal';
    modal.style.display = 'block';

    let html = `
        <div class="modal-content modal-large">
            <span class="close" onclick="closeTestDetails()">&times;</span>
            <h2>📊 ${results.test.name}</h2>

            <div class="test-details">
    `;

    // Variants comparison
    html += '<h3>Variants Performance</h3><div class="variants-comparison">';

    results.variants.forEach(v => {
        html += `
            <div class="variant-card ${v.ranking === 1 ? 'winner' : ''}">
                <div class="variant-header">
                    <h4>${v.name}</h4>
                    ${v.ranking === 1 ? '<span class="badge badge-winner">🏆 #1</span>' : `<span class="badge">#${v.ranking}</span>`}
                </div>
                <div class="variant-stats">
                    <div class="stat"><span>Views:</span> <strong>${v.results.views}</strong></div>
                    <div class="stat"><span>Likes:</span> <strong>${v.results.likes}</strong></div>
                    <div class="stat"><span>Engagement:</span> <strong>${v.results.engagement.toFixed(2)}%</strong></div>
                </div>
            </div>
        `;
    });

    html += `
            </div>

            <div class="modal-actions">
                <button class="btn btn-primary" onclick="closeTestDetails()">ปิด</button>
            </div>
        </div>
    `;

    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function closeTestDetails() {
    const modal = document.getElementById('testDetailsModal');
    if (modal) modal.remove();
}

function viewTestReport(testId) {
    const report = abTesting.generateReport(testId);
    if (!report) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>📄 Test Report</h2>

            <div class="report-content">
                <h3>${report.testName}</h3>
                <p><strong>Duration:</strong> ${report.duration}</p>
                <p><strong>Winner:</strong> ${report.winner.name}</p>
                <p><strong>Confidence:</strong> ${report.confidence.toFixed(1)}%</p>

                <div class="recommendation-box">
                    <h4>💡 Recommendation</h4>
                    <p>${report.recommendation}</p>
                </div>
            </div>

            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">ปิด</button>
        </div>
    `;

    document.body.appendChild(modal);
}

function stopTest(testId) {
    if (confirm('หยุด test นี้? จะไม่สามารถเริ่มใหม่ได้')) {
        const test = abTesting.getTest(testId);
        if (test) {
            test.status = 'stopped';
            test.endDate = new Date().toISOString();
            abTesting.saveTests();
            renderABTestingView();
            showToast('⏸️ หยุด test แล้ว', 'info');
        }
    }
}

function deleteTest(testId) {
    if (confirm('ลบ test นี้? จะไม่สามารถกู้คืนได้')) {
        abTesting.deleteTest(testId);
        renderABTestingView();
        showToast('🗑️ ลบ test แล้ว', 'info');
    }
}

// ===========================================
// COMPETITOR ANALYSIS UI
// ===========================================

function renderCompetitorView() {
    renderCompetitorsList();
    renderCompetitorInsights();
    renderTrendingContent();
}

function renderCompetitorsList() {
    const container = document.getElementById('competitorsList');
    const competitors = competitorAnalysis.getAllCompetitors();

    if (competitors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🎯 ยังไม่มีคู่แข่งในระบบ</p>
                <button class="btn btn-primary" onclick="addNewCompetitor()">+ เพิ่มคู่แข่งคนแรก</button>
            </div>
        `;
        return;
    }

    let html = '';

    competitors.forEach(comp => {
        html += `
            <div class="competitor-card">
                <div class="competitor-header">
                    <h4>${comp.name}</h4>
                    <span class="badge">${comp.category}</span>
                </div>

                <div class="competitor-platforms">
                    ${comp.platforms.map(p => `<span class="platform-badge">${p}</span>`).join('')}
                </div>

                <div class="competitor-stats">
                    <div class="stat">
                        <span class="label">Avg Views:</span>
                        <span class="value">${formatNumber(comp.stats.avgViews)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Engagement:</span>
                        <span class="value">${comp.stats.engagementRate.toFixed(2)}%</span>
                    </div>
                    <div class="stat">
                        <span class="label">Post Frequency:</span>
                        <span class="value">${comp.stats.postFrequency}/week</span>
                    </div>
                </div>

                <div class="competitor-actions">
                    <button class="btn btn-sm btn-primary" onclick="trackCompetitor('${comp.id}')">
                        🔍 Track Content
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="viewCompetitorDetails('${comp.id}')">
                        📊 Details
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="removeCompetitor('${comp.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderCompetitorInsights() {
    const container = document.getElementById('competitorInsights');
    const insights = competitorAnalysis.insights;

    if (!insights) {
        container.innerHTML = `
            <div class="empty-state">
                <p>💡 กด "Generate Insights" เพื่อวิเคราะห์ข้อมูล</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="insights-grid">
            <div class="insight-card">
                <h4>🔥 Trending Topics</h4>
                <ul>
                    ${insights.trendingTopics.slice(0, 5).map(t =>
                        `<li>${t.topic} <span class="count">(${t.count})</span></li>`
                    ).join('')}
                </ul>
            </div>

            <div class="insight-card">
                <h4>#️⃣ Trending Hashtags</h4>
                <div class="hashtags-list">
                    ${insights.trendingHashtags.slice(0, 8).map(h =>
                        `<span class="hashtag-badge">${h.hashtag}</span>`
                    ).join('')}
                </div>
            </div>

            <div class="insight-card">
                <h4>⏰ Best Posting Times</h4>
                <ul>
                    ${insights.bestPostingTimes.map(t =>
                        `<li>${t.hour} <span class="count">(${t.count} posts)</span></li>`
                    ).join('')}
                </ul>
            </div>

            <div class="insight-card recommendations">
                <h4>💡 Recommendations</h4>
                <ul>
                    ${insights.recommendations.map(r =>
                        `<li class="priority-${r.priority}">
                            <strong>${r.title}:</strong> ${r.description}
                        </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderTrendingContent() {
    const container = document.getElementById('trendingContent');
    const insights = competitorAnalysis.insights;

    if (!insights || !insights.topPerformers) {
        container.innerHTML = `<div class="empty-state"><p>ยังไม่มีข้อมูล trending content</p></div>`;
        return;
    }

    let html = '<div class="trending-list">';

    insights.topPerformers.slice(0, 10).forEach((item, index) => {
        html += `
            <div class="trending-item">
                <span class="rank">#${index + 1}</span>
                <div class="trending-info">
                    <h5>${item.title}</h5>
                    <p class="meta">
                        ${item.competitorName} • ${item.platform}
                    </p>
                </div>
                <div class="trending-stats">
                    <span>👁️ ${formatNumber(item.views)}</span>
                    <span>📈 ${item.engagementRate}%</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function addNewCompetitor() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addCompetitorModal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAddCompetitor()">&times;</span>
            <h2>➕ เพิ่มคู่แข่ง</h2>

            <div class="form-group">
                <label>ชื่อ</label>
                <input type="text" id="compName" placeholder="ชื่อคู่แข่ง">
            </div>

            <div class="form-group">
                <label>Category</label>
                <select id="compCategory">
                    <option value="education">Education</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="general">General</option>
                </select>
            </div>

            <div class="form-group">
                <label>Platforms</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="platform" value="tiktok"> TikTok</label>
                    <label><input type="checkbox" name="platform" value="youtube"> YouTube</label>
                    <label><input type="checkbox" name="platform" value="facebook"> Facebook</label>
                </div>
            </div>

            <div class="form-group">
                <label>TikTok Username</label>
                <input type="text" id="compTiktok" placeholder="@username">
            </div>

            <div class="form-group">
                <label>YouTube Channel ID</label>
                <input type="text" id="compYoutube" placeholder="UCxxxxxxxxx">
            </div>

            <div class="form-group">
                <label>Facebook Page ID</label>
                <input type="text" id="compFacebook" placeholder="Page ID">
            </div>

            <div class="modal-actions">
                <button class="btn btn-primary" onclick="submitAddCompetitor()">เพิ่มคู่แข่ง</button>
                <button class="btn btn-secondary" onclick="closeAddCompetitor()">ยกเลิก</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeAddCompetitor() {
    const modal = document.getElementById('addCompetitorModal');
    if (modal) modal.remove();
}

function submitAddCompetitor() {
    const name = document.getElementById('compName').value;
    const category = document.getElementById('compCategory').value;
    const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(cb => cb.value);

    if (!name || platforms.length === 0) {
        showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
        return;
    }

    try {
        competitorAnalysis.addCompetitor({
            name,
            category,
            platforms,
            tiktokUsername: document.getElementById('compTiktok').value,
            youtubeChannelId: document.getElementById('compYoutube').value,
            facebookPageId: document.getElementById('compFacebook').value
        });

        showToast('✅ เพิ่มคู่แข่งสำเร็จ!', 'success');
        closeAddCompetitor();
        renderCompetitorView();

    } catch (error) {
        showToast('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
}

async function trackCompetitor(competitorId) {
    const competitor = competitorAnalysis.getCompetitor(competitorId);
    if (!competitor) return;

    showLoading('กำลังติดตามคู่แข่ง...');

    try {
        // Track ทุก platform
        for (const platform of competitor.platforms) {
            await competitorAnalysis.trackCompetitorContent(competitorId, platform);
        }

        hideLoading();
        showToast('✅ ติดตามสำเร็จ!', 'success');
        renderCompetitorView();

    } catch (error) {
        hideLoading();
        showToast('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
}

function generateCompetitorInsights() {
    showLoading('กำลังวิเคราะห์...');

    setTimeout(() => {
        competitorAnalysis.generateInsights();
        hideLoading();
        renderCompetitorInsights();
        showToast('✅ วิเคราะห์เสร็จสิ้น!', 'success');
    }, 1000);
}

function removeCompetitor(competitorId) {
    if (confirm('ลบคู่แข่งนี้?')) {
        competitorAnalysis.removeCompetitor(competitorId);
        renderCompetitorView();
        showToast('🗑️ ลบคู่แข่งแล้ว', 'info');
    }
}

function viewCompetitorDetails(competitorId) {
    const competitor = competitorAnalysis.getCompetitor(competitorId);
    if (!competitor) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>📊 ${competitor.name}</h2>

            <div class="competitor-details">
                <h3>Top Content</h3>
                <div class="top-content-list">
                    ${competitor.topContent.map((content, i) => `
                        <div class="content-item">
                            <span class="rank">#${i+1}</span>
                            <div class="content-info">
                                <h5>${content.title}</h5>
                                <p>Views: ${formatNumber(content.views)} | Engagement: ${content.engagementRate.toFixed(2)}%</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <h3>Content Strategy</h3>
                <div class="strategy-info">
                    <p><strong>Topics:</strong> ${competitor.contentStrategy.topics.slice(0, 5).map(t => t.word).join(', ')}</p>
                    <p><strong>Popular Hashtags:</strong> ${competitor.contentStrategy.hashtags.slice(0, 5).map(h => h.tag).join(' ')}</p>
                    <p><strong>Posting Times:</strong> ${competitor.contentStrategy.postingTimes.map(t => t.hour).join(', ')}</p>
                </div>
            </div>

            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">ปิด</button>
        </div>
    `;

    document.body.appendChild(modal);
}

// ===========================================
// UTILITIES
// ===========================================

function calculateTestProgress(test) {
    const minSampleSize = 100;
    let totalViews = 0;

    test.variants.forEach(v => {
        totalViews += v.results.views;
    });

    const targetViews = minSampleSize * test.variants.length;
    const progress = Math.min(100, (totalViews / targetViews) * 100);

    return Math.round(progress);
}

function getTotalViews(test) {
    return test.variants.reduce((sum, v) => sum + v.results.views, 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Initialize when switching to Phase 3 views
function initPhase3Views() {
    // Check which view is active
    const abtestingView = document.getElementById('abtestingView');
    const competitorView = document.getElementById('competitorView');

    if (abtestingView && abtestingView.classList.contains('active')) {
        renderABTestingView();
    }

    if (competitorView && competitorView.classList.contains('active')) {
        renderCompetitorView();
    }
}

// Auto-initialize when script loads
console.log('📊 Phase 3 UI loaded');
