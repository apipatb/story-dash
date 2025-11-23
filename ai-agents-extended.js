// Extended AI Agents - More intelligent assistants

// ==================== 1. THUMBNAIL IDEAS GENERATOR ====================

async function showThumbnailGenerator(contentId) {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const modal = document.getElementById('aiModal');
    const title = document.getElementById('aiModalTitle');
    const body = document.getElementById('aiModalBody');

    title.textContent = '🎨 Thumbnail Ideas Generator';

    const thumbnailIdeas = await generateThumbnailIdeas(content);

    body.innerHTML = `
        <div class="thumbnail-generator">
            <h3>${content.title}</h3>
            <p class="agent-description">
                AI แนะนำไอเดีย thumbnail ที่น่าสนใจและดึงดูดคลิก
            </p>

            <div class="thumbnail-ideas">
                ${thumbnailIdeas.map((idea, index) => `
                    <div class="thumbnail-idea-card">
                        <div class="thumbnail-number">${index + 1}</div>
                        <div class="thumbnail-content">
                            <h4>${idea.concept}</h4>
                            <p><strong>องค์ประกอบ:</strong> ${idea.elements}</p>
                            <p><strong>ข้อความ:</strong> "${idea.text}"</p>
                            <p><strong>สี:</strong> ${idea.colors}</p>
                            <div class="thumbnail-tips">
                                <strong>💡 Tips:</strong> ${idea.tip}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="agent-actions">
                <button class="btn btn-secondary" onclick="closeAIModal()">ปิด</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

async function generateThumbnailIdeas(content) {
    // AI-powered or template-based thumbnail ideas
    const category = content.category;

    const ideas = [
        {
            concept: 'Face Expression Closeup',
            elements: 'ใบหน้าแสดงอารมณ์ตกใจ/สงสัย + ข้อความใหญ่',
            text: content.title.split('?')[0] + '?',
            colors: 'สีสดใส (เหลือง, แดง, น้ำเงิน)',
            tip: 'ใช้ expression ที่เกินจริงเล็กน้อยเพื่อ ดึงดูดความสนใจ'
        },
        {
            concept: 'Before/After Split',
            elements: 'แบ่ง 2 ฝั่ง: ความเชื่อ vs ความจริง',
            text: 'ความเชื่อ ⚡ จริง?',
            colors: 'Contrast สูง (เขียว/แดง)',
            tip: 'ใช้ลูกศรหรือเครื่องหมายชี้เพื่อเน้น'
        },
        {
            concept: 'Question Mark Big',
            elements: 'เครื่องหมายคำถามใหญ่ + รูปภาพที่เกี่ยวข้อง',
            text: 'จริงหรือ?',
            colors: 'พื้นหลังเข้ม ตัวอักษรสว่าง',
            tip: 'ใช้ฟอนต์หนา ขนาดใหญ่ อ่านง่าย'
        },
        {
            concept: 'Emoji Reaction',
            elements: 'Emoji ใหญ่ (😱😮🤔) + ข้อความสั้น',
            text: content.title.substring(0, 30) + '...',
            colors: 'พื้นหลังไล่สี (Gradient)',
            tip: 'Emoji ช่วยสื่ออารมณ์ได้รวดเร็ว'
        },
        {
            concept: 'X vs ✓ Compare',
            elements: 'สิ่งที่ผิด (X) และ สิ่งที่ถูก (✓)',
            text: 'ความจริงที่ถูกปกปิด',
            colors: 'แดง/เขียว สลับ',
            tip: 'ชัดเจน เข้าใจง่าย'
        }
    ];

    return ideas;
}

// ==================== 2. TREND ANALYZER AGENT ====================

async function showTrendAnalyzer() {
    const modal = document.getElementById('aiModal');
    const title = document.getElementById('aiModalTitle');
    const body = document.getElementById('aiModalBody');

    title.textContent = '📈 Trend Analyzer';

    const trends = analyzeTrends();

    body.innerHTML = `
        <div class="trend-analyzer">
            <h3>วิเคราะห์เทรนด์ Content ของคุณ</h3>

            <div class="trend-section">
                <h4>📊 Category Performance</h4>
                <div class="trend-chart">
                    ${Object.entries(trends.byCategory).map(([cat, data]) => `
                        <div class="trend-bar">
                            <span class="trend-label">${getCategoryLabel(cat)}</span>
                            <div class="trend-progress">
                                <div class="trend-fill" style="width: ${(data.count / contents.length * 100)}%">
                                    ${data.count}
                                </div>
                            </div>
                            <span class="trend-percentage">${((data.count / contents.length) * 100).toFixed(0)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="trend-section">
                <h4>🎯 Most Successful Platform</h4>
                <p class="trend-insight">
                    ${trends.topPlatform.name}: ${trends.topPlatform.count} content
                    ${trends.topPlatform.count > 10 ? '🔥 นี่คือแพลตฟอร์มหลักของคุณ!' : ''}
                </p>
            </div>

            <div class="trend-section">
                <h4>⏱️ Posting Pattern</h4>
                <p class="trend-insight">
                    คุณโพสต์เฉลี่ย ${trends.avgPerWeek.toFixed(1)} ครั้ง/สัปดาห์
                    ${trends.avgPerWeek < 3 ? '💡 แนะนำ: เพิ่มความสม่ำเสมอเป็น 3-5 ครั้ง/สัปดาห์' : ''}
                    ${trends.avgPerWeek >= 5 ? '🎉 ยอดเยี่ยม! คุณสร้าง content อย่างสม่ำเสมอ' : ''}
                </p>
            </div>

            <div class="trend-section">
                <h4>💰 Revenue Trends</h4>
                <p class="trend-insight">
                    รายได้รวม: ฿${trends.totalRevenue.toLocaleString()}
                    ${trends.totalRevenue > 0 ? '<br>Top Earner: ' + trends.topEarner : ''}
                </p>
            </div>

            <div class="trend-recommendations">
                <h4>💡 คำแนะนำ</h4>
                <ul>
                    ${trends.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="agent-actions">
                <button class="btn btn-secondary" onclick="closeAIModal()">ปิด</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function analyzeTrends() {
    // Category analysis
    const byCategory = {};
    contents.forEach(c => {
        if (!byCategory[c.category]) {
            byCategory[c.category] = { count: 0, revenue: 0 };
        }
        byCategory[c.category].count++;
        byCategory[c.category].revenue +=
            (c.monetization?.revenue?.ads || 0) +
            (c.monetization?.revenue?.brand || 0) +
            (c.monetization?.revenue?.affiliate || 0);
    });

    // Platform analysis
    const platformCounts = {};
    contents.forEach(c => {
        c.platforms.forEach(p => {
            platformCounts[p] = (platformCounts[p] || 0) + 1;
        });
    });

    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0] || ['none', 0];

    // Posting frequency
    const postedContents = contents.filter(c => c.status === 'posted');
    const avgPerWeek = postedContents.length / 4; // Assuming 4 weeks

    // Revenue analysis
    const totalRevenue = contents.reduce((sum, c) =>
        sum + (c.monetization?.revenue?.ads || 0) +
        (c.monetization?.revenue?.brand || 0) +
        (c.monetization?.revenue?.affiliate || 0), 0
    );

    const topEarner = contents
        .map(c => ({
            title: c.title,
            revenue: (c.monetization?.revenue?.ads || 0) +
                (c.monetization?.revenue?.brand || 0) +
                (c.monetization?.revenue?.affiliate || 0)
        }))
        .sort((a, b) => b.revenue - a.revenue)[0];

    // Generate recommendations
    const recommendations = [];

    if (avgPerWeek < 3) {
        recommendations.push('เพิ่มความถี่ในการโพสต์เป็น 3-5 ครั้ง/สัปดาห์');
    }

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1].count - a[1].count)[0];
    if (topCategory && topCategory[1].count > contents.length * 0.5) {
        recommendations.push(`เนื้อหาของคุณเน้นไปที่ "${getCategoryLabel(topCategory[0])}" ลองทำหมวดอื่นบ้างเพื่อความหลากหลาย`);
    }

    if (totalRevenue === 0) {
        recommendations.push('เริ่มติดตาม views และรายได้เพื่อวัดผล');
    }

    if (postedContents.length < contents.length * 0.3) {
        recommendations.push('คุณมี draft เยอะ ลองกำหนดตารางโพสต์ให้ชัดเจน');
    }

    return {
        byCategory,
        topPlatform: {
            name: getPlatformLabel(topPlatform[0]),
            count: topPlatform[1]
        },
        avgPerWeek,
        totalRevenue,
        topEarner: topEarner?.title || 'ยังไม่มี',
        recommendations
    };
}

// ==================== 3. COMPETITOR RESEARCH AGENT ====================

async function showCompetitorResearch() {
    const modal = document.getElementById('aiModal');
    const title = document.getElementById('aiModalTitle');
    const body = document.getElementById('aiModalBody');

    title.textContent = '🔍 Competitor Research Assistant';

    body.innerHTML = `
        <div class="competitor-research">
            <h3>วิจัยคู่แข่งและเทรนด์</h3>
            <p class="agent-description">
                เครื่องมือช่วยวิจัย content ที่กำลังฮิต และหาแรงบันดาลใจ
            </p>

            <div class="research-section">
                <h4>🎯 Trending Topics (ตัวอย่าง)</h4>
                <div class="trending-topics">
                    ${getTrendingTopics().map(topic => `
                        <div class="topic-card" onclick="useTopicAsIdea('${topic.title}')">
                            <span class="topic-fire">🔥</span>
                            <div>
                                <strong>${topic.title}</strong>
                                <p>${topic.reason}</p>
                                <span class="topic-views">${topic.avgViews} views โดยเฉลี่ย</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="research-section">
                <h4>💡 Content Gap Analysis</h4>
                <p>หัวข้อที่คุณยังไม่เคยทำ แต่น่าจะได้ผลดี:</p>
                <ul class="gap-list">
                    ${getContentGaps().map(gap => `
                        <li>
                            <strong>${gap.topic}</strong>
                            <span class="gap-reason">${gap.reason}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="research-section">
                <h4>📋 Best Practices</h4>
                <ul class="best-practices">
                    <li>✓ Hook ภายใน 3 วินาทีแรก</li>
                    <li>✓ ใช้คำถามในหัวข้อ (เพิ่ม CTR 25%)</li>
                    <li>✓ เพิ่ม subtitles ในวิดีโอ (เพิ่ม retention 40%)</li>
                    <li>✓ โพสต์ช่วงเวลา peak (12:00, 18:00, 21:00)</li>
                    <li>✓ ใช้ trending sounds (TikTok/Reels)</li>
                </ul>
            </div>

            <div class="agent-actions">
                <button class="btn btn-secondary" onclick="closeAIModal()">ปิด</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function getTrendingTopics() {
    return [
        {
            title: 'ทำไมต้องไม่นอนหัวทิศเหนือ?',
            reason: 'ความเชื่อคลาสสิกที่คนสนใจ',
            avgViews: '500K+'
        },
        {
            title: 'ห้ามตัดเล็บตอนกลางคืน',
            reason: 'Viral บน TikTok',
            avgViews: '800K+'
        },
        {
            title: 'สัตว์ที่เห็นผี?',
            reason: 'ธีม mystery ยอดนิยม',
            avgViews: '1M+'
        },
        {
            title: '5 ความเชื่อที่จริงทางวิทยาศาสตร์',
            reason: 'Listicle format ดีต่อการแชร์',
            avgViews: '600K+'
        },
        {
            title: 'ทำไมห้ามเหยียบธรณีประตู?',
            reason: 'ความเชื่อไทยที่ยังมีคนปฏิบัติ',
            avgViews: '400K+'
        }
    ];
}

function getContentGaps() {
    // Analyze what user hasn't covered
    const coveredTopics = contents.map(c => c.title.toLowerCase());

    const suggestions = [
        { topic: 'ตำนานไทย (นางนาค, พระอภัยมณี)', reason: 'คนไทยชอบเรื่องเล่าท้องถิ่น' },
        { topic: 'วิทยาศาสตร์เบื้องหลังอาหารไทย', reason: 'Niche ใหม่ที่ยังไม่แออัด' },
        { topic: 'ความเชื่อในต่างประเทศ vs ไทย', reason: 'Compare & contrast ได้ engagement สูง' },
        { topic: 'ฮวงจุ้ยสมัยใหม่', reason: 'กำลังกลับมาเป็นที่นิยม' },
        { topic: 'เหตุผลทางจิตวิทยาของความเชื่อ', reason: 'มุมมองใหม่ที่น่าสนใจ' }
    ];

    return suggestions.filter(s =>
        !coveredTopics.some(topic => topic.includes(s.topic.toLowerCase().substring(0, 10)))
    );
}

function useTopicAsIdea(title) {
    openAddModal();
    document.getElementById('contentTitle').value = title;
    document.getElementById('contentCategory').value = 'superstition';
    closeAIModal();
    showToast('นำหัวข้อมาใส่ form แล้ว!', 'success');
}

// ==================== 4. ENGAGEMENT PREDICTOR AGENT ====================

async function showEngagementPredictor(contentId) {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const modal = document.getElementById('aiModal');
    const title = document.getElementById('aiModalTitle');
    const body = document.getElementById('aiModalBody');

    title.textContent = '🎯 Engagement Predictor';

    const prediction = predictEngagement(content);

    body.innerHTML = `
        <div class="engagement-predictor">
            <h3>${content.title}</h3>

            <div class="prediction-score">
                <div class="score-circle ${prediction.scoreClass}">
                    <span class="score-number">${prediction.score}</span>
                    <span class="score-label">/100</span>
                </div>
                <h4>Predicted Engagement Score</h4>
                <p class="score-meaning">${prediction.meaning}</p>
            </div>

            <div class="prediction-details">
                <h4>📊 คาดการณ์</h4>
                <div class="prediction-metrics">
                    <div class="metric">
                        <span class="metric-label">👁️ Views (ประมาณ)</span>
                        <strong>${prediction.estimatedViews.toLocaleString()}</strong>
                    </div>
                    <div class="metric">
                        <span class="metric-label">❤️ Likes (ประมาณ)</span>
                        <strong>${prediction.estimatedLikes.toLocaleString()}</strong>
                    </div>
                    <div class="metric">
                        <span class="metric-label">💬 Comments (ประมาณ)</span>
                        <strong>${prediction.estimatedComments.toLocaleString()}</strong>
                    </div>
                    <div class="metric">
                        <span class="metric-label">📤 Shares (ประมาณ)</span>
                        <strong>${prediction.estimatedShares.toLocaleString()}</strong>
                    </div>
                </div>
            </div>

            <div class="prediction-factors">
                <h4>🔍 ปัจจัยที่วิเคราะห์</h4>
                <ul class="factors-list">
                    ${prediction.factors.map(factor => `
                        <li class="${factor.positive ? 'positive' : 'negative'}">
                            ${factor.positive ? '✓' : '×'} ${factor.text}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="prediction-tips">
                <h4>💡 วิธีเพิ่ม Engagement</h4>
                <ul>
                    ${prediction.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>

            <div class="agent-actions">
                <button class="btn btn-primary" onclick="closeAIModal(); editContent(${contentId})">
                    ✏️ แก้ไข Content
                </button>
                <button class="btn btn-secondary" onclick="closeAIModal()">ปิด</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function predictEngagement(content) {
    let score = 50; // Base score
    const factors = [];
    const tips = [];

    // Title analysis
    if (content.title.includes('?')) {
        score += 10;
        factors.push({ positive: true, text: 'มีคำถามในหัวข้อ (ดึงดูดคลิก)' });
    } else {
        factors.push({ positive: false, text: 'ไม่มีคำถามในหัวข้อ' });
        tips.push('เพิ่มคำถามในหัวข้อ เช่น "รู้หรือไม่?" "ทำไม?"');
    }

    if (content.title.length >= 20 && content.title.length <= 60) {
        score += 5;
        factors.push({ positive: true, text: 'ความยาวหัวข้อเหมาะสม' });
    }

    // Script analysis
    if (content.script) {
        const hasHook = content.script.toLowerCase().includes('hook:');
        const hasCTA = content.script.toLowerCase().includes('cta:');

        if (hasHook) {
            score += 15;
            factors.push({ positive: true, text: 'มี Hook ชัดเจน' });
        } else {
            factors.push({ positive: false, text: 'ไม่มี Hook' });
            tips.push('เพิ่ม Hook ใน 3 วินาทีแรก');
        }

        if (hasCTA) {
            score += 10;
            factors.push({ positive: true, text: 'มี Call-to-Action' });
        } else {
            factors.push({ positive: false, text: 'ไม่มี CTA' });
            tips.push('เพิ่ม CTA เช่น "คอมเมนต์บอก" "แชร์ให้เพื่อน"');
        }

        const wordCount = content.script.split(/\s+/).length;
        if (wordCount >= 50 && wordCount <= 150) {
            score += 5;
            factors.push({ positive: true, text: 'ความยาว script เหมาะสม' });
        }
    } else {
        score -= 20;
        factors.push({ positive: false, text: 'ยังไม่มี script' });
    }

    // Platform analysis
    if (content.platforms.length >= 2) {
        score += 8;
        factors.push({ positive: true, text: `โพสต์หลายแพลตฟอร์ม (${content.platforms.length})` });
    }

    // Category popularity
    if (content.category === 'superstition' || content.category === 'legend') {
        score += 7;
        factors.push({ positive: true, text: 'หมวดที่คนไทยสนใจ' });
    }

    // Status
    if (content.status === 'ready') {
        score += 5;
        factors.push({ positive: true, text: 'พร้อมโพสต์' });
    }

    // Calculate estimations based on score
    const baseViews = 1000;
    const multiplier = score / 20;

    const estimatedViews = Math.round(baseViews * multiplier);
    const estimatedLikes = Math.round(estimatedViews * 0.05);
    const estimatedComments = Math.round(estimatedViews * 0.01);
    const estimatedShares = Math.round(estimatedViews * 0.02);

    // Score meaning
    let meaning, scoreClass;
    if (score >= 80) {
        meaning = '🔥 มีโอกาสไวรัลสูง!';
        scoreClass = 'excellent';
    } else if (score >= 60) {
        meaning = '✨ น่าจะได้ engagement ดี';
        scoreClass = 'good';
    } else if (score >= 40) {
        meaning = '👌 ปานกลาง ควรปรับปรุง';
        scoreClass = 'average';
    } else {
        meaning = '⚠️ ควรแก้ไขก่อนโพสต์';
        scoreClass = 'poor';
    }

    // General tips
    if (tips.length === 0) {
        tips.push('โพสต์ในช่วงเวลา peak (12:00, 18:00, 21:00)');
        tips.push('ตอบ comment ภายใน 1 ชั่วโมงแรก');
        tips.push('ใช้ trending sounds หรือ music');
    }

    return {
        score,
        meaning,
        scoreClass,
        estimatedViews,
        estimatedLikes,
        estimatedComments,
        estimatedShares,
        factors,
        tips
    };
}

// ==================== 5. CONTENT RECYCLER AGENT ====================

async function showContentRecycler() {
    const postedContents = contents.filter(c => c.status === 'posted');

    if (postedContents.length === 0) {
        showToast('ยังไม่มี content ที่โพสต์แล้ว', 'warning');
        return;
    }

    const modal = document.getElementById('aiModal');
    const title = document.getElementById('aiModalTitle');
    const body = document.getElementById('aiModalBody');

    title.textContent = '♻️ Content Recycler';

    const suggestions = getRecycleSuggestions(postedContents);

    body.innerHTML = `
        <div class="content-recycler">
            <h3>กลับมาใช้ Content เก่าใหม่</h3>
            <p class="agent-description">
                Content ที่โพสต์ไปแล้วสามารถ recycle เป็นรูปแบบใหม่ได้
            </p>

            <div class="recycle-suggestions">
                ${suggestions.map(suggestion => `
                    <div class="recycle-card">
                        <div class="recycle-original">
                            <h4>📝 Original</h4>
                            <p><strong>${suggestion.original.title}</strong></p>
                            <span class="badge">${getPlatformLabel(suggestion.original.platforms[0])}</span>
                        </div>
                        <div class="recycle-arrow">➡️</div>
                        <div class="recycle-new">
                            <h4>✨ Recycle เป็น</h4>
                            <p><strong>${suggestion.newFormat}</strong></p>
                            <p class="recycle-idea">${suggestion.idea}</p>
                            <button class="btn btn-sm btn-primary" onclick="recycleContent(${suggestion.original.id}, '${suggestion.newFormat}')">
                                ใช้ไอเดียนี้
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="recycle-tips">
                <h4>💡 Recycle Ideas</h4>
                <ul>
                    <li>📱 Single post → Carousel/Thread</li>
                    <li>📊 Top 5 posts → "Best of" compilation</li>
                    <li>🎬 Long video → Shorts/Reels</li>
                    <li>📝 Text → Infographic</li>
                    <li>🎯 Old content → Updated version</li>
                </ul>
            </div>

            <div class="agent-actions">
                <button class="btn btn-secondary" onclick="closeAIModal()">ปิด</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function getRecycleSuggestions(postedContents) {
    const suggestions = [];

    postedContents.slice(0, 5).forEach(content => {
        // Suggest different recycle formats
        const formats = [
            {
                format: 'Carousel Post (หลายภาพ)',
                idea: 'แบ่งเป็น slide 5-7 ภาพ พร้อมข้อความสั้นๆ แต่ละภาพ'
            },
            {
                format: 'Thread Twitter/X',
                idea: 'แยกเป็น thread หลาย tweet พร้อมอธิบายละเอียด'
            },
            {
                format: 'Behind the Scenes',
                idea: 'เล่าเบื้องหลังการทำ content นี้ + ความผิดพลาดที่เจอ'
            },
            {
                format: 'Q&A Format',
                idea: 'ตอบคำถามจาก comments ของ post เดิม'
            },
            {
                format: 'Updated Version',
                idea: 'อัพเดทข้อมูลใหม่ "ความเชื่อนี้ในปี 2024"'
            }
        ];

        const randomFormat = formats[Math.floor(Math.random() * formats.length)];

        suggestions.push({
            original: content,
            newFormat: randomFormat.format,
            idea: randomFormat.idea
        });
    });

    return suggestions;
}

function recycleContent(originalId, newFormat) {
    const original = contents.find(c => c.id === originalId);
    if (!original) return;

    // Create new content based on original
    openAddModal();
    document.getElementById('contentTitle').value = `${original.title} (${newFormat})`;
    document.getElementById('contentCategory').value = original.category;
    document.getElementById('contentScript').value = `[Recycle จาก: ${original.title}]\n\n${original.script || ''}`;

    closeAIModal();
    showToast('สร้าง content ใหม่จากของเดิม!', 'success');
}

// Initialize extended agents
console.log('🤖 Extended AI Agents loaded!');
