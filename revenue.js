// Revenue & Monetization Features
// Full Monetization Suite

// ==================== Revenue Calculations ====================

function calculateTotalRevenue() {
    let total = { ads: 0, brand: 0, affiliate: 0, overall: 0 };

    contents.forEach(content => {
        if (content.monetization && content.monetization.revenue) {
            total.ads += content.monetization.revenue.ads || 0;
            total.brand += content.monetization.revenue.brand || 0;
            total.affiliate += content.monetization.revenue.affiliate || 0;
        }
    });

    total.overall = total.ads + total.brand + total.affiliate;
    return total;
}

function updateRevenueStats() {
    try {
        const revenue = calculateTotalRevenue();

        const totalEl = document.getElementById('totalRevenue');
        const adsEl = document.getElementById('adsRevenue');
        const brandEl = document.getElementById('brandRevenue');
        const affiliateEl = document.getElementById('affiliateRevenue');

        if (totalEl) totalEl.textContent = `฿${revenue.overall.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
        if (adsEl) adsEl.textContent = `฿${revenue.ads.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
        if (brandEl) brandEl.textContent = `฿${revenue.brand.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
        if (affiliateEl) affiliateEl.textContent = `฿${revenue.affiliate.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    } catch (error) {
        console.error('Error updating revenue stats:', error);
    }
}

// ==================== Top Earners ====================

function renderTopEarners() {
    const container = document.getElementById('topEarnersList');
    if (!container) return;

    // Calculate revenue for each content
    const contentsWithRevenue = contents.map(content => {
        const revenue = content.monetization?.revenue || {};
        const total = (revenue.ads || 0) + (revenue.brand || 0) + (revenue.affiliate || 0);
        return { ...content, totalRevenue: total };
    }).filter(c => c.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    if (contentsWithRevenue.length === 0) {
        container.innerHTML = '<p class="empty-message">ยังไม่มีข้อมูลรายได้</p>';
        return;
    }

    container.innerHTML = contentsWithRevenue.map((content, index) => {
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        const totalViews = (content.monetization?.views?.tiktok || 0) +
                          (content.monetization?.views?.youtube || 0) +
                          (content.monetization?.views?.facebook || 0);

        return `
            <div class="top-earner-item">
                <div class="earner-rank">${medals[index]}</div>
                <div class="earner-info">
                    <h4>${escapeHtml(content.title)}</h4>
                    <p>${totalViews.toLocaleString('th-TH')} views</p>
                </div>
                <div class="earner-revenue">
                    <span class="revenue-amount">฿${content.totalRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== Platform Revenue ====================

function renderPlatformRevenue() {
    const container = document.getElementById('platformRevenue');
    if (!container) return;

    const platformData = {
        tiktok: { views: 0, revenue: 0 },
        youtube: { views: 0, revenue: 0 },
        facebook: { views: 0, revenue: 0 }
    };

    contents.forEach(content => {
        if (!content.monetization) return;

        const views = content.monetization.views || {};
        const revenue = content.monetization.revenue || {};
        const totalRevenue = (revenue.ads || 0) + (revenue.brand || 0) + (revenue.affiliate || 0);

        content.platforms.forEach(platform => {
            if (platformData[platform]) {
                platformData[platform].views += views[platform] || 0;
                // Split revenue evenly across platforms
                platformData[platform].revenue += totalRevenue / content.platforms.length;
            }
        });
    });

    const platforms = [
        { key: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
        { key: 'youtube', name: 'YouTube', icon: '📹', color: '#FF0000' },
        { key: 'facebook', name: 'Facebook', icon: '👥', color: '#1877F2' }
    ];

    container.innerHTML = platforms.map(platform => {
        const data = platformData[platform.key];
        const rpm = data.views > 0 ? (data.revenue / data.views * 1000) : 0;

        return `
            <div class="platform-revenue-card" style="border-left: 4px solid ${platform.color}">
                <div class="platform-header">
                    <span class="platform-icon">${platform.icon}</span>
                    <h4>${platform.name}</h4>
                </div>
                <div class="platform-stats">
                    <div class="platform-stat">
                        <span class="stat-label">Views</span>
                        <span class="stat-value">${data.views.toLocaleString('th-TH')}</span>
                    </div>
                    <div class="platform-stat">
                        <span class="stat-label">รายได้</span>
                        <span class="stat-value">฿${data.revenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="platform-stat">
                        <span class="stat-label">RPM</span>
                        <span class="stat-value">฿${rpm.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== Brand Deals ====================

function renderBrandDeals() {
    const container = document.getElementById('brandDealsList');
    if (!container) return;

    const brandDeals = contents.filter(c =>
        c.monetization && c.monetization.revenue && c.monetization.revenue.brand > 0
    ).sort((a, b) => b.monetization.revenue.brand - a.monetization.revenue.brand);

    if (brandDeals.length === 0) {
        container.innerHTML = '<p class="empty-message">ยังไม่มี Brand Deals</p>';
        return;
    }

    container.innerHTML = brandDeals.map(content => {
        const brandInfo = content.monetization.brandDeal || 'ไม่มีข้อมูล';
        const amount = content.monetization.revenue.brand;
        const isPaid = content.status === 'posted';

        return `
            <div class="brand-deal-item ${isPaid ? 'paid' : 'pending'}">
                <div class="deal-header">
                    <h4>${escapeHtml(content.title)}</h4>
                    <span class="deal-status ${isPaid ? 'status-paid' : 'status-pending'}">
                        ${isPaid ? '✅ จ่ายแล้ว' : '⏳ รอจ่าย'}
                    </span>
                </div>
                <div class="deal-info">
                    <p>${escapeHtml(brandInfo)}</p>
                </div>
                <div class="deal-amount">
                    <span>฿${amount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== Monthly Revenue Chart ====================

function renderMonthlyRevenue() {
    const container = document.getElementById('monthlyRevenueChart');
    if (!container) return;

    // Group by month
    const monthlyData = {};

    contents.forEach(content => {
        if (!content.createdAt || !content.monetization) return;

        const date = new Date(content.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { ads: 0, brand: 0, affiliate: 0, total: 0 };
        }

        const revenue = content.monetization.revenue || {};
        monthlyData[monthKey].ads += revenue.ads || 0;
        monthlyData[monthKey].brand += revenue.brand || 0;
        monthlyData[monthKey].affiliate += revenue.affiliate || 0;
        monthlyData[monthKey].total += (revenue.ads || 0) + (revenue.brand || 0) + (revenue.affiliate || 0);
    });

    // Sort by month
    const sortedMonths = Object.keys(monthlyData).sort();
    const maxRevenue = Math.max(...sortedMonths.map(m => monthlyData[m].total), 1);

    if (sortedMonths.length === 0) {
        container.innerHTML = '<p class="empty-message">ยังไม่มีข้อมูลรายได้รายเดือน</p>';
        return;
    }

    container.innerHTML = sortedMonths.map(month => {
        const data = monthlyData[month];
        const percentage = (data.total / maxRevenue) * 100;
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });

        return `
            <div class="month-revenue">
                <div class="month-label">${monthName}</div>
                <div class="month-bar-container">
                    <div class="month-bar" style="width: ${percentage}%">
                        <span class="month-value">฿${data.total.toLocaleString('th-TH')}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== Money Calculator ====================

function openMoneyCalculator() {
    const html = `
        <div class="calculator-modal">
            <h2>💰 Revenue Calculator</h2>
            <p class="subtitle">คำนวณรายได้จาก Views</p>

            <div class="calculator-section">
                <h3>📊 ใส่จำนวน Views</h3>

                <div class="form-group">
                    <label>TikTok Views</label>
                    <input type="number" id="calcTikTokViews" min="0" placeholder="0" class="calc-input">
                </div>

                <div class="form-group">
                    <label>YouTube Shorts Views</label>
                    <input type="number" id="calcYouTubeViews" min="0" placeholder="0" class="calc-input">
                </div>

                <div class="form-group">
                    <label>Facebook Views</label>
                    <input type="number" id="calcFacebookViews" min="0" placeholder="0" class="calc-input">
                </div>
            </div>

            <div class="calculator-section">
                <h3>💵 อัตราการจ่าย (RPM - Revenue per 1000 views)</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>TikTok RPM (฿)</label>
                        <input type="number" id="calcTikTokRPM" value="0.70" step="0.01" class="calc-input">
                        <small>ค่าเฉลี่ย: ฿0.50-1.00</small>
                    </div>

                    <div class="form-group">
                        <label>YouTube RPM (฿)</label>
                        <input type="number" id="calcYouTubeRPM" value="2.00" step="0.01" class="calc-input">
                        <small>ค่าเฉลี่ย: ฿1.50-3.00</small>
                    </div>

                    <div class="form-group">
                        <label>Facebook RPM (฿)</label>
                        <input type="number" id="calcFacebookRPM" value="0.50" step="0.01" class="calc-input">
                        <small>ค่าเฉลี่ย: ฿0.30-0.80</small>
                    </div>
                </div>
            </div>

            <button class="btn btn-primary btn-large" onclick="calculateRevenue()">📊 คำนวณ</button>

            <div id="calculatorResult" class="calculator-result" style="display: none;">
                <h3>💰 ผลการคำนวณ</h3>
                <div class="result-breakdown"></div>
            </div>
        </div>
    `;

    showAgentModal('Money Calculator', html);
}

function calculateRevenue() {
    const tiktokViews = parseInt(document.getElementById('calcTikTokViews').value) || 0;
    const youtubeViews = parseInt(document.getElementById('calcYouTubeViews').value) || 0;
    const facebookViews = parseInt(document.getElementById('calcFacebookViews').value) || 0;

    const tiktokRPM = parseFloat(document.getElementById('calcTikTokRPM').value) || 0;
    const youtubeRPM = parseFloat(document.getElementById('calcYouTubeRPM').value) || 0;
    const facebookRPM = parseFloat(document.getElementById('calcFacebookRPM').value) || 0;

    const tiktokRevenue = (tiktokViews / 1000) * tiktokRPM;
    const youtubeRevenue = (youtubeViews / 1000) * youtubeRPM;
    const facebookRevenue = (facebookViews / 1000) * facebookRPM;
    const totalRevenue = tiktokRevenue + youtubeRevenue + facebookRevenue;

    const resultDiv = document.getElementById('calculatorResult');
    const breakdown = resultDiv.querySelector('.result-breakdown');

    breakdown.innerHTML = `
        <div class="result-total">
            <span>รายได้รวมประมาณ</span>
            <span class="result-amount">฿${totalRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="result-items">
            ${tiktokRevenue > 0 ? `
                <div class="result-item">
                    <span>🎵 TikTok: ${tiktokViews.toLocaleString('th-TH')} views</span>
                    <span>฿${tiktokRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                </div>
            ` : ''}
            ${youtubeRevenue > 0 ? `
                <div class="result-item">
                    <span>📹 YouTube: ${youtubeViews.toLocaleString('th-TH')} views</span>
                    <span>฿${youtubeRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                </div>
            ` : ''}
            ${facebookRevenue > 0 ? `
                <div class="result-item">
                    <span>👥 Facebook: ${facebookViews.toLocaleString('th-TH')} views</span>
                    <span>฿${facebookRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                </div>
            ` : ''}
        </div>
        <p class="result-note">💡 หมายเหตุ: นี่เป็นการประมาณการ รายได้จริงอาจแตกต่างกันตามหลายปัจจัย</p>
    `;

    resultDiv.style.display = 'block';
}

// ==================== Price Calculator ====================

function openPriceCalculator() {
    const html = `
        <div class="calculator-modal">
            <h2>💵 Price Calculator</h2>
            <p class="subtitle">คำนวณราคาที่ควรเรียกสำหรับ Brand Deal</p>

            <div class="calculator-section">
                <h3>📊 ข้อมูลช่องของคุณ</h3>

                <div class="form-group">
                    <label>จำนวน Followers/Subscribers</label>
                    <input type="number" id="priceFollowers" min="0" placeholder="10000" class="calc-input">
                </div>

                <div class="form-group">
                    <label>Engagement Rate (%)</label>
                    <input type="number" id="priceEngagement" min="0" max="100" step="0.1" value="5" class="calc-input">
                    <small>ค่าเฉลี่ย: 3-8%</small>
                </div>

                <div class="form-group">
                    <label>แพลตฟอร์ม</label>
                    <select id="pricePlatform" class="calc-input">
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>ประเภทคอนเทนต์</label>
                    <select id="priceContentType" class="calc-input">
                        <option value="post">โพสต์ปกติ (1 โพสต์)</option>
                        <option value="story">Story/Shorts (3-5 clips)</option>
                        <option value="video">วิดีโอยาว (1 วิดีโอ)</option>
                        <option value="series">Series (3-5 ตอน)</option>
                    </select>
                </div>
            </div>

            <button class="btn btn-primary btn-large" onclick="calculatePrice()">💰 คำนวณราคา</button>

            <div id="priceResult" class="calculator-result" style="display: none;">
                <h3>💵 ราคาแนะนำ</h3>
                <div class="price-breakdown"></div>
            </div>
        </div>
    `;

    showAgentModal('Price Calculator', html);
}

function calculatePrice() {
    const followers = parseInt(document.getElementById('priceFollowers').value) || 0;
    const engagement = parseFloat(document.getElementById('priceEngagement').value) || 0;
    const platform = document.getElementById('pricePlatform').value;
    const contentType = document.getElementById('priceContentType').value;

    // Base price per 1000 followers
    const basePrices = {
        tiktok: 100,      // ฿100 ต่อ 1K followers
        youtube: 150,     // ฿150 ต่อ 1K followers
        facebook: 80,     // ฿80 ต่อ 1K followers
        instagram: 120    // ฿120 ต่อ 1K followers
    };

    const contentMultipliers = {
        post: 1,
        story: 0.7,
        video: 1.5,
        series: 3
    };

    let basePrice = (followers / 1000) * basePrices[platform];

    // Engagement multiplier (higher engagement = higher price)
    const engagementMultiplier = 1 + ((engagement - 5) / 10); // 5% is baseline
    basePrice *= engagementMultiplier;

    // Content type multiplier
    basePrice *= contentMultipliers[contentType];

    const minPrice = basePrice * 0.8;
    const maxPrice = basePrice * 1.3;

    const resultDiv = document.getElementById('priceResult');
    const breakdown = resultDiv.querySelector('.price-breakdown');

    const platformNames = {
        tiktok: 'TikTok',
        youtube: 'YouTube',
        facebook: 'Facebook',
        instagram: 'Instagram'
    };

    const contentTypeNames = {
        post: 'โพสต์ปกติ',
        story: 'Story/Shorts',
        video: 'วิดีโอยาว',
        series: 'Series'
    };

    breakdown.innerHTML = `
        <div class="price-range">
            <div class="price-label">ช่วงราคาแนะนำ</div>
            <div class="price-amount-range">
                ฿${minPrice.toLocaleString('th-TH', {maximumFractionDigits: 0})} -
                ฿${maxPrice.toLocaleString('th-TH', {maximumFractionDigits: 0})}
            </div>
        </div>

        <div class="price-details">
            <h4>รายละเอียดการคำนวณ</h4>
            <div class="detail-item">
                <span>📊 Followers:</span>
                <span>${followers.toLocaleString('th-TH')}</span>
            </div>
            <div class="detail-item">
                <span>💚 Engagement:</span>
                <span>${engagement}%</span>
            </div>
            <div class="detail-item">
                <span>📱 Platform:</span>
                <span>${platformNames[platform]}</span>
            </div>
            <div class="detail-item">
                <span>🎬 Content Type:</span>
                <span>${contentTypeNames[contentType]}</span>
            </div>
        </div>

        <div class="price-tips">
            <h4>💡 เคล็ดลับการต่อรอง</h4>
            <ul>
                <li>เริ่มเสนอที่ราคาบน (฿${maxPrice.toLocaleString('th-TH', {maximumFractionDigits: 0})})</li>
                <li>ยอมรับได้ที่ราคากลาง (฿${basePrice.toLocaleString('th-TH', {maximumFractionDigits: 0})})</li>
                <li>อย่ารับต่ำกว่า ฿${minPrice.toLocaleString('th-TH', {maximumFractionDigits: 0})}</li>
                ${engagement > 7 ? '<li>✨ Engagement ของคุณสูง - เรียกราคาได้มากขึ้น!</li>' : ''}
                ${followers > 100000 ? '<li>🌟 คุณมี Followers เยอะ - พิจารณาเพิ่ม 20-30%</li>' : ''}
            </ul>
        </div>
    `;

    resultDiv.style.display = 'block';
}

// ==================== AI Money Advisor ====================

function showMoneyAdvisor() {
    showLoading('กำลังวิเคราะห์ข้อมูลการทำเงิน...');

    setTimeout(() => {
        const analysis = analyzeMonetization();
        hideLoading();

        let html = `
            <div class="agent-results">
                <h2>🤖 AI Money Advisor</h2>
                <p class="agent-subtitle">คำแนะนำเพิ่มรายได้จาก AI</p>

                <div class="advisor-score">
                    <div class="score-circle" style="border-color: ${analysis.scoreColor}">
                        <span class="score-number" style="color: ${analysis.scoreColor}">${analysis.score}</span>
                        <span class="score-max">/100</span>
                    </div>
                    <div class="score-label" style="color: ${analysis.scoreColor}">
                        ${analysis.scoreLabel}
                    </div>
                </div>
        `;

        if (analysis.strengths.length > 0) {
            html += `
                <div class="agent-section success">
                    <h3>✅ จุดแข็งด้านการทำเงิน</h3>
                    <ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
            `;
        }

        if (analysis.opportunities.length > 0) {
            html += `
                <div class="agent-section info">
                    <h3>💡 โอกาสเพิ่มรายได้</h3>
                    <ul>${analysis.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
                </div>
            `;
        }

        if (analysis.recommendations.length > 0) {
            html += `
                <div class="agent-section warning">
                    <h3>🎯 คำแนะนำ</h3>
                    <ul>${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                </div>
            `;
        }

        html += `</div>`;
        showAgentModal('AI Money Advisor', html);
    }, 1000);
}

function analyzeMonetization() {
    const totalRevenue = calculateTotalRevenue();
    const totalContent = contents.length;
    const postedContent = contents.filter(c => c.status === 'posted').length;
    const contentWithRevenue = contents.filter(c => {
        const rev = c.monetization?.revenue || {};
        return (rev.ads + rev.brand + rev.affiliate) > 0;
    }).length;

    const avgRevenuePerContent = postedContent > 0 ? totalRevenue.overall / postedContent : 0;
    const monetizationRate = postedContent > 0 ? (contentWithRevenue / postedContent) * 100 : 0;

    const analysis = {
        score: 0,
        scoreLabel: '',
        scoreColor: '',
        strengths: [],
        opportunities: [],
        recommendations: []
    };

    // Calculate score
    if (totalRevenue.overall > 10000) analysis.score += 30;
    else if (totalRevenue.overall > 5000) analysis.score += 20;
    else if (totalRevenue.overall > 1000) analysis.score += 10;

    if (monetizationRate > 70) analysis.score += 30;
    else if (monetizationRate > 40) analysis.score += 20;
    else if (monetizationRate > 20) analysis.score += 10;

    if (totalRevenue.brand > 0) analysis.score += 20;
    if (totalRevenue.affiliate > 0) analysis.score += 10;
    if (contentWithRevenue >= 10) analysis.score += 10;

    // Score label and color
    if (analysis.score >= 70) {
        analysis.scoreLabel = 'เก่งมาก!';
        analysis.scoreColor = '#10b981';
    } else if (analysis.score >= 40) {
        analysis.scoreLabel = 'ดี';
        analysis.scoreColor = '#6366f1';
    } else {
        analysis.scoreLabel = 'ยังพัฒนาได้';
        analysis.scoreColor = '#f59e0b';
    }

    // Strengths
    if (totalRevenue.overall > 5000) {
        analysis.strengths.push(`รายได้รวม ฿${totalRevenue.overall.toLocaleString('th-TH')} - อยู่ในเกณฑ์ดี!`);
    }
    if (totalRevenue.brand > 0) {
        analysis.strengths.push(`มีรายได้จาก Brand Deals แล้ว - ดีมาก!`);
    }
    if (monetizationRate > 50) {
        analysis.strengths.push(`${monetizationRate.toFixed(0)}% ของ content ทำเงินได้ - สูงมาก!`);
    }
    if (contentWithRevenue >= 10) {
        analysis.strengths.push(`มี ${contentWithRevenue} content ที่ทำเงินแล้ว`);
    }

    // Opportunities
    if (totalRevenue.affiliate === 0) {
        analysis.opportunities.push('ยังไม่มีรายได้จาก Affiliate - ลองเพิ่ม affiliate links ในคอนเทนต์');
    }
    if (totalRevenue.brand === 0) {
        analysis.opportunities.push('ยังไม่มี Brand Deal - ติดต่อ brand ที่เกี่ยวข้องกับ niche ของคุณ');
    }
    if (monetizationRate < 30) {
        analysis.opportunities.push(`มี content ${postedContent - contentWithRevenue} ชิ้นที่ยังไม่มีรายได้ - กรอกข้อมูล views และรายได้`);
    }

    const draftCount = contents.filter(c => c.status === 'draft').length;
    if (draftCount > 5) {
        analysis.opportunities.push(`มี Draft ${draftCount} ชิ้น - โพสต์เพื่อเริ่มทำเงิน!`);
    }

    // Recommendations
    if (avgRevenuePerContent < 100) {
        analysis.recommendations.push('เพิ่ม views ด้วยการใช้ SEO Optimizer และ viral hooks');
        analysis.recommendations.push('โพสต์ให้สม่ำเสมอ - อย่างน้อย 3-5 ชิ้น/สัปดาห์');
    }

    if (totalRevenue.brand === 0 && postedContent >= 10) {
        analysis.recommendations.push('คุณมี content พอแล้ว - เริ่มหา Brand Deal ได้! ใช้ Price Calculator คำนวณราคา');
    }

    analysis.recommendations.push('ใช้ AI Assistant สร้าง content ที่มีคุณภาพสูง = views สูง = เงินมากขึ้น');
    analysis.recommendations.push('วิเคราะห์ Top Earners ของคุณ แล้วทำ content แนวเดียวกันเพิ่ม');

    return analysis;
}

// ==================== Revenue Projections ====================

function calculateRevenueProjections() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get this month's revenue
    const thisMonthRevenue = contents.filter(c => {
        if (!c.createdAt) return false;
        const date = new Date(c.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, c) => {
        const rev = c.monetization?.revenue || {};
        return sum + (rev.ads || 0) + (rev.brand || 0) + (rev.affiliate || 0);
    }, 0);

    // Calculate daily average
    const dayOfMonth = now.getDate();
    const dailyAverage = thisMonthRevenue / dayOfMonth;

    // Project to end of month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const projectedMonthlyRevenue = dailyAverage * daysInMonth;

    // Calculate growth rate (compare with last month)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastMonthRevenue = contents.filter(c => {
        if (!c.createdAt) return false;
        const date = new Date(c.createdAt);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    }).reduce((sum, c) => {
        const rev = c.monetization?.revenue || {};
        return sum + (rev.ads || 0) + (rev.brand || 0) + (rev.affiliate || 0);
    }, 0);

    const growthRate = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    return {
        today: dailyAverage,
        thisMonth: thisMonthRevenue,
        projected: projectedMonthlyRevenue,
        lastMonth: lastMonthRevenue,
        growthRate: growthRate,
        daysLeft: daysInMonth - dayOfMonth
    };
}

function renderRevenueProjections() {
    const projections = calculateRevenueProjections();

    // Add projections card to revenue stats if it doesn't exist
    const statsGrid = document.querySelector('.revenue-stats-grid');
    if (!statsGrid) return;

    // Check if projection card already exists
    let projectionCard = statsGrid.querySelector('.revenue-stat-card.projection');
    if (!projectionCard) {
        // Create projection card
        projectionCard = document.createElement('div');
        projectionCard.className = 'revenue-stat-card projection';
        statsGrid.appendChild(projectionCard);
    }

    const growthColor = projections.growthRate >= 0 ? '#10b981' : '#ef4444';
    const growthIcon = projections.growthRate >= 0 ? '📈' : '📉';

    projectionCard.innerHTML = `
        <div class="stat-icon">📊</div>
        <h3 id="projectedRevenue">฿${projections.projected.toLocaleString('th-TH', {minimumFractionDigits: 2})}</h3>
        <p>คาดการณ์สิ้นเดือน</p>
        <div class="projection-details">
            <small style="color: ${growthColor}">
                ${growthIcon} ${projections.growthRate >= 0 ? '+' : ''}${projections.growthRate.toFixed(1)}% vs เดือนที่แล้ว
            </small>
        </div>
    `;
}

// ==================== Best Performing Content ====================

function renderBestPerformingContent() {
    const revenueView = document.getElementById('revenueView');
    if (!revenueView) return;

    // Check if best performing section already exists
    let bestSection = revenueView.querySelector('.best-performing-section');
    if (!bestSection) {
        // Create and insert before top earners
        bestSection = document.createElement('div');
        bestSection.className = 'revenue-section best-performing-section';
        const topEarnersSection = revenueView.querySelector('.revenue-section');
        if (topEarnersSection) {
            revenueView.insertBefore(bestSection, topEarnersSection);
        } else {
            revenueView.appendChild(bestSection);
        }
    }

    // Calculate best performing metrics
    const performanceData = contents.filter(c => c.status === 'posted').map(content => {
        const monetization = content.monetization || {};
        const views = monetization.views || {};
        const revenue = monetization.revenue || {};

        const totalViews = (views.tiktok || 0) + (views.youtube || 0) + (views.facebook || 0);
        const totalRevenue = (revenue.ads || 0) + (revenue.brand || 0) + (revenue.affiliate || 0);
        const rpm = totalViews > 0 ? (totalRevenue / totalViews * 1000) : 0;

        return {
            ...content,
            totalViews,
            totalRevenue,
            rpm
        };
    });

    // Get top by different metrics
    const topByViews = [...performanceData].sort((a, b) => b.totalViews - a.totalViews).slice(0, 3);
    const topByRevenue = [...performanceData].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3);
    const topByRPM = [...performanceData].filter(c => c.totalViews >= 1000).sort((a, b) => b.rpm - a.rpm).slice(0, 3);

    bestSection.innerHTML = `
        <h3>🌟 Best Performing Content</h3>
        <div class="best-performing-grid">
            <div class="performance-category">
                <h4>👁️ Most Views</h4>
                <div class="performance-list">
                    ${topByViews.length > 0 ? topByViews.map(c => `
                        <div class="performance-item">
                            <div class="performance-title">${escapeHtml(c.title)}</div>
                            <div class="performance-value">${c.totalViews.toLocaleString('th-TH')} views</div>
                        </div>
                    `).join('') : '<p class="empty-message">ยังไม่มีข้อมูล views</p>'}
                </div>
            </div>

            <div class="performance-category">
                <h4>💰 Highest Revenue</h4>
                <div class="performance-list">
                    ${topByRevenue.length > 0 ? topByRevenue.map(c => `
                        <div class="performance-item">
                            <div class="performance-title">${escapeHtml(c.title)}</div>
                            <div class="performance-value">฿${c.totalRevenue.toLocaleString('th-TH')}</div>
                        </div>
                    `).join('') : '<p class="empty-message">ยังไม่มีข้อมูลรายได้</p>'}
                </div>
            </div>

            <div class="performance-category">
                <h4>📊 Best RPM</h4>
                <div class="performance-list">
                    ${topByRPM.length > 0 ? topByRPM.map(c => `
                        <div class="performance-item">
                            <div class="performance-title">${escapeHtml(c.title)}</div>
                            <div class="performance-value">฿${c.rpm.toLocaleString('th-TH', {minimumFractionDigits: 2})}/1K</div>
                        </div>
                    `).join('') : '<p class="empty-message">ต้องมี views อย่างน้อย 1K</p>'}
                </div>
            </div>
        </div>
    `;
}

// ==================== Auto-Optimize Posting Times ====================

function analyzeOptimalPostingTimes() {
    const performanceByHour = {};
    const performanceByDay = {};

    contents.filter(c => c.status === 'posted' && c.schedule).forEach(content => {
        const date = new Date(content.schedule);
        const hour = date.getHours();
        const day = date.getDay(); // 0 = Sunday

        const monetization = content.monetization || {};
        const views = monetization.views || {};
        const revenue = monetization.revenue || {};

        const totalViews = (views.tiktok || 0) + (views.youtube || 0) + (views.facebook || 0);
        const totalRevenue = (revenue.ads || 0) + (revenue.brand || 0) + (revenue.affiliate || 0);

        // Track by hour
        if (!performanceByHour[hour]) {
            performanceByHour[hour] = { count: 0, views: 0, revenue: 0 };
        }
        performanceByHour[hour].count++;
        performanceByHour[hour].views += totalViews;
        performanceByHour[hour].revenue += totalRevenue;

        // Track by day
        if (!performanceByDay[day]) {
            performanceByDay[day] = { count: 0, views: 0, revenue: 0 };
        }
        performanceByDay[day].count++;
        performanceByDay[day].views += totalViews;
        performanceByDay[day].revenue += totalRevenue;
    });

    // Calculate averages
    const hourlyStats = Object.entries(performanceByHour).map(([hour, data]) => ({
        hour: parseInt(hour),
        avgViews: data.views / data.count,
        avgRevenue: data.revenue / data.count
    })).sort((a, b) => b.avgRevenue - a.avgRevenue);

    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const dailyStats = Object.entries(performanceByDay).map(([day, data]) => ({
        day: parseInt(day),
        dayName: dayNames[parseInt(day)],
        avgViews: data.views / data.count,
        avgRevenue: data.revenue / data.count
    })).sort((a, b) => b.avgRevenue - a.avgRevenue);

    return { hourlyStats, dailyStats };
}

function showOptimalPostingTimes() {
    const { hourlyStats, dailyStats } = analyzeOptimalPostingTimes();

    if (hourlyStats.length === 0) {
        showToast('ต้องมีข้อมูล content ที่โพสต์แล้วอย่างน้อย 5 ชิ้น', 'warning');
        return;
    }

    const bestHours = hourlyStats.slice(0, 3);
    const bestDays = dailyStats.slice(0, 3);

    const html = `
        <div class="agent-results">
            <h2>⏰ Optimal Posting Times</h2>
            <p class="agent-subtitle">วิเคราะห์จากข้อมูลการโพสต์ของคุณ</p>

            <div class="optimal-times-grid">
                <div class="optimal-section">
                    <h3>🕐 Best Hours to Post</h3>
                    <div class="optimal-list">
                        ${bestHours.map((item, index) => `
                            <div class="optimal-item ${index === 0 ? 'best' : ''}">
                                <div class="optimal-rank">${index + 1}</div>
                                <div class="optimal-info">
                                    <div class="optimal-time">${item.hour}:00 น.</div>
                                    <div class="optimal-stats">
                                        ${item.avgViews.toLocaleString('th-TH', {maximumFractionDigits: 0})} views avg
                                        • ฿${item.avgRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="optimal-section">
                    <h3>📅 Best Days to Post</h3>
                    <div class="optimal-list">
                        ${bestDays.map((item, index) => `
                            <div class="optimal-item ${index === 0 ? 'best' : ''}">
                                <div class="optimal-rank">${index + 1}</div>
                                <div class="optimal-info">
                                    <div class="optimal-time">${item.dayName}</div>
                                    <div class="optimal-stats">
                                        ${item.avgViews.toLocaleString('th-TH', {maximumFractionDigits: 0})} views avg
                                        • ฿${item.avgRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="agent-section info">
                <h3>💡 Recommendations</h3>
                <ul>
                    <li>โพสต์ในช่วง ${bestHours[0].hour}:00 น. เพื่อ views และรายได้สูงสุด</li>
                    <li>วัน${bestDays[0].dayName} ให้ผลตอบรับดีที่สุด</li>
                    <li>หลีกเลี่ยงช่วงเวลาที่มีผลตอบรับต่ำ</li>
                    <li>ทดสอบช่วงเวลาใหม่ๆ เป็นระยะเพื่อหาโอกาสเพิ่มเติม</li>
                </ul>
            </div>
        </div>
    `;

    showAgentModal('Optimal Posting Times', html);
}

// ==================== Initialize Revenue View ====================

function initRevenue() {
    if (document.getElementById('revenueView')) {
        updateRevenueStats();
        renderRevenueProjections();
        renderBestPerformingContent();
        renderTopEarners();
        renderPlatformRevenue();
        renderBrandDeals();
        renderMonthlyRevenue();
    }
}
