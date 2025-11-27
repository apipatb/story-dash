// A/B Testing System - ทดสอบหลาย version เพื่อหาว่าอันไหนปัง
// สร้าง variants หลายๆ แบบ แล้ววัดผลว่าแบบไหน perform ดีสุด

class ABTestingSystem {
    constructor() {
        this.tests = this.loadTests();
        this.results = this.loadResults();
        this.activeTests = new Map();
    }

    // ===========================================
    // CREATE A/B TEST
    // ===========================================

    createTest(config) {
        const test = {
            id: `test_${Date.now()}`,
            name: config.name,
            description: config.description,
            contentId: config.contentId,
            variants: config.variants, // Array of variants
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: null,
            metrics: config.metrics || ['views', 'likes', 'shares', 'comments', 'ctr'],
            trafficSplit: config.trafficSplit || this.evenSplit(config.variants.length),
            winner: null,
            confidence: null
        };

        // Validate variants
        if (!test.variants || test.variants.length < 2) {
            throw new Error('ต้องมี variants อย่างน้อย 2 แบบ');
        }

        // Initialize variant results
        test.variants.forEach(variant => {
            variant.results = {
                impressions: 0,
                views: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                clicks: 0,
                ctr: 0,
                engagement: 0,
                conversionRate: 0
            };
        });

        this.tests.push(test);
        this.saveTests();
        this.activeTests.set(test.id, test);

        console.log(`🧪 สร้าง A/B Test: ${test.name}`);
        console.log(`   Variants: ${test.variants.map(v => v.name).join(', ')}`);

        return test;
    }

    // ===========================================
    // VARIANT MANAGEMENT
    // ===========================================

    // สร้าง Title Variants
    createTitleVariants(baseTitle) {
        return [
            {
                name: 'Original',
                type: 'title',
                value: baseTitle,
                description: 'หัวข้อเดิม'
            },
            {
                name: 'Question',
                type: 'title',
                value: this.toQuestion(baseTitle),
                description: 'เปลี่ยนเป็นคำถาม'
            },
            {
                name: 'Shocking',
                type: 'title',
                value: this.toShocking(baseTitle),
                description: 'ทำให้ตกใจ/สนใจ'
            },
            {
                name: 'Emotional',
                type: 'title',
                value: this.toEmotional(baseTitle),
                description: 'เน้นอารมณ์'
            }
        ];
    }

    toQuestion(title) {
        if (title.includes('ทำไม')) return title;
        return `ทำไม${title}? คำตอบจะทำให้คุณตกใจ!`;
    }

    toShocking(title) {
        const shockingPrefixes = [
            '😱 ช็อก! ',
            '⚠️ อันตราย! ',
            '🔥 ปัง! ',
            '💥 ระเบิด! ',
            '⚡ เปิดเผยความจริง! '
        ];
        return shockingPrefixes[0] + title;
    }

    toEmotional(title) {
        return `❤️ ${title} | เรื่องจริงที่คุณต้องรู้`;
    }

    // สร้าง Thumbnail Variants
    createThumbnailVariants(baseThumbnail) {
        return [
            {
                name: 'Original',
                type: 'thumbnail',
                value: baseThumbnail,
                style: 'default',
                description: 'ภาพเดิม'
            },
            {
                name: 'Text Overlay',
                type: 'thumbnail',
                value: baseThumbnail,
                style: 'text-overlay',
                overlay: {
                    text: 'ต้องดู!',
                    color: '#ff0000',
                    fontSize: 48
                },
                description: 'เพิ่มข้อความ'
            },
            {
                name: 'Emoji Heavy',
                type: 'thumbnail',
                value: baseThumbnail,
                style: 'emoji',
                overlay: {
                    emojis: ['😱', '🔥', '⚡'],
                    size: 64
                },
                description: 'เพิ่มอีโมจิ'
            },
            {
                name: 'High Contrast',
                type: 'thumbnail',
                value: baseThumbnail,
                style: 'high-contrast',
                filter: {
                    brightness: 1.2,
                    contrast: 1.3,
                    saturation: 1.5
                },
                description: 'สีสด'
            }
        ];
    }

    // สร้าง Hashtag Variants
    createHashtagVariants(baseHashtags) {
        return [
            {
                name: 'Original',
                type: 'hashtags',
                value: baseHashtags,
                description: 'แฮชแท็กเดิม'
            },
            {
                name: 'Trending',
                type: 'hashtags',
                value: this.addTrendingHashtags(baseHashtags),
                description: 'เพิ่ม trending hashtags'
            },
            {
                name: 'Long Tail',
                type: 'hashtags',
                value: this.addLongTailHashtags(baseHashtags),
                description: 'เพิ่ม long-tail keywords'
            },
            {
                name: 'Minimal',
                type: 'hashtags',
                value: this.minimizeHashtags(baseHashtags),
                description: 'ลดเหลือแค่ที่สำคัญ'
            }
        ];
    }

    addTrendingHashtags(base) {
        const trending = ['#fyp', '#viral', '#trending', '#foryou', '#foryoupage'];
        return base + ' ' + trending.join(' ');
    }

    addLongTailHashtags(base) {
        const longTail = ['#เรื่องจริงที่คุณต้องรู้', '#ความรู้ที่น่าสนใจ', '#เกร็ดความรู้'];
        return base + ' ' + longTail.join(' ');
    }

    minimizeHashtags(base) {
        return base.split(' ').slice(0, 5).join(' ');
    }

    // สร้าง Posting Time Variants
    createPostingTimeVariants() {
        return [
            {
                name: 'Morning Peak',
                type: 'time',
                value: '07:00',
                description: 'เช้า (7:00) - คนตื่นนอน'
            },
            {
                name: 'Lunch Break',
                type: 'time',
                value: '12:00',
                description: 'เที่ยง (12:00) - พักเที่ยง'
            },
            {
                name: 'Evening Prime',
                type: 'time',
                value: '18:00',
                description: 'เย็น (18:00) - เลิกงาน'
            },
            {
                name: 'Night Peak',
                type: 'time',
                value: '21:00',
                description: 'ค่ำ (21:00) - ก่อนนอน'
            }
        ];
    }

    // ===========================================
    // AUTO TEST CREATION
    // ===========================================

    autoCreateTest(content) {
        console.log(`🤖 สร้าง A/B Test อัตโนมัติสำหรับ: ${content.title}`);

        // เลือกว่าจะทดสอบอะไร
        const testTypes = ['title', 'thumbnail', 'hashtags', 'time'];
        const selectedType = testTypes[0]; // เริ่มจาก title ก่อน

        let variants = [];

        switch (selectedType) {
            case 'title':
                variants = this.createTitleVariants(content.title);
                break;
            case 'thumbnail':
                variants = this.createThumbnailVariants(content.thumbnailUrl);
                break;
            case 'hashtags':
                variants = this.createHashtagVariants(content.hashtags);
                break;
            case 'time':
                variants = this.createPostingTimeVariants();
                break;
        }

        return this.createTest({
            name: `Auto Test: ${selectedType} for "${content.title}"`,
            description: `ทดสอบ ${selectedType} แบบต่างๆ เพื่อหา version ที่ดีที่สุด`,
            contentId: content.id,
            variants: variants,
            metrics: ['views', 'likes', 'engagement'],
            trafficSplit: this.evenSplit(variants.length)
        });
    }

    // ===========================================
    // TRAFFIC DISTRIBUTION
    // ===========================================

    evenSplit(count) {
        const split = {};
        const percentage = 100 / count;

        for (let i = 0; i < count; i++) {
            split[i] = percentage;
        }

        return split;
    }

    // เลือก variant ตาม traffic split
    selectVariant(test) {
        const rand = Math.random() * 100;
        let cumulative = 0;

        for (let i = 0; i < test.variants.length; i++) {
            cumulative += test.trafficSplit[i];
            if (rand <= cumulative) {
                return test.variants[i];
            }
        }

        return test.variants[0]; // fallback
    }

    // ===========================================
    // RECORDING RESULTS
    // ===========================================

    recordImpression(testId, variantName) {
        const test = this.getTest(testId);
        if (!test) return;

        const variant = test.variants.find(v => v.name === variantName);
        if (variant) {
            variant.results.impressions++;
            this.saveTests();
        }
    }

    recordView(testId, variantName) {
        const test = this.getTest(testId);
        if (!test) return;

        const variant = test.variants.find(v => v.name === variantName);
        if (variant) {
            variant.results.views++;
            this.calculateMetrics(variant);
            this.saveTests();
        }
    }

    recordEngagement(testId, variantName, type, value = 1) {
        const test = this.getTest(testId);
        if (!test) return;

        const variant = test.variants.find(v => v.name === variantName);
        if (!variant) return;

        switch (type) {
            case 'like':
                variant.results.likes += value;
                break;
            case 'share':
                variant.results.shares += value;
                break;
            case 'comment':
                variant.results.comments += value;
                break;
            case 'click':
                variant.results.clicks += value;
                break;
        }

        this.calculateMetrics(variant);
        this.saveTests();

        // ตรวจสอบว่าได้ผลเพียงพอหรือยัง
        this.checkForWinner(test);
    }

    calculateMetrics(variant) {
        const r = variant.results;

        // CTR (Click-Through Rate)
        r.ctr = r.impressions > 0 ? (r.clicks / r.impressions * 100) : 0;

        // Engagement Rate
        const totalEngagements = r.likes + r.shares + r.comments;
        r.engagement = r.views > 0 ? (totalEngagements / r.views * 100) : 0;

        // Conversion Rate (views / impressions)
        r.conversionRate = r.impressions > 0 ? (r.views / r.impressions * 100) : 0;
    }

    // ===========================================
    // ANALYSIS & WINNER DETECTION
    // ===========================================

    checkForWinner(test) {
        // ต้องมีข้อมูลเพียงพอ (อย่างน้อย 100 views per variant)
        const minSampleSize = 100;
        const allHaveEnoughData = test.variants.every(v => v.results.views >= minSampleSize);

        if (!allHaveEnoughData) {
            console.log(`📊 ยังต้องการข้อมูลเพิ่ม (min ${minSampleSize} views/variant)`);
            return;
        }

        // วิเคราะห์หา winner
        const analysis = this.analyzeTest(test);

        if (analysis.hasWinner && analysis.confidence >= 95) {
            test.winner = analysis.winner;
            test.confidence = analysis.confidence;
            test.status = 'completed';
            test.endDate = new Date().toISOString();

            console.log(`🏆 มี Winner แล้ว: ${analysis.winner.name}`);
            console.log(`   Confidence: ${analysis.confidence}%`);

            this.saveTests();
            this.notifyWinner(test);
        }
    }

    analyzeTest(test) {
        // เรียง variants ตาม engagement
        const sorted = [...test.variants].sort((a, b) =>
            b.results.engagement - a.results.engagement
        );

        const best = sorted[0];
        const second = sorted[1];

        // คำนวณความแตกต่าง
        const difference = best.results.engagement - second.results.engagement;
        const percentDiff = (difference / second.results.engagement) * 100;

        // Statistical significance (simplified)
        // ในการใช้งานจริงควรใช้ Chi-square test หรือ T-test
        const confidence = Math.min(95, 50 + (percentDiff * 2));

        return {
            winner: best,
            runnerUp: second,
            difference: difference,
            percentDiff: percentDiff,
            confidence: confidence,
            hasWinner: confidence >= 95
        };
    }

    getTestResults(testId) {
        const test = this.getTest(testId);
        if (!test) return null;

        return {
            test: test,
            analysis: this.analyzeTest(test),
            variants: test.variants.map(v => ({
                name: v.name,
                results: v.results,
                ranking: this.rankVariant(test, v)
            }))
        };
    }

    rankVariant(test, variant) {
        const sorted = [...test.variants].sort((a, b) =>
            b.results.engagement - a.results.engagement
        );
        return sorted.indexOf(variant) + 1;
    }

    // ===========================================
    // REPORTING
    // ===========================================

    generateReport(testId) {
        const results = this.getTestResults(testId);
        if (!results) return null;

        const report = {
            testName: results.test.name,
            duration: this.calculateDuration(results.test.startDate, results.test.endDate),
            totalImpressions: 0,
            totalViews: 0,
            totalEngagements: 0,
            winner: results.analysis.winner,
            confidence: results.analysis.confidence,
            recommendation: this.generateRecommendation(results),
            variantDetails: []
        };

        // รวมข้อมูล
        results.variants.forEach(v => {
            report.totalImpressions += v.results.impressions;
            report.totalViews += v.results.views;
            report.totalEngagements += (v.results.likes + v.results.shares + v.results.comments);

            report.variantDetails.push({
                name: v.name,
                ranking: v.ranking,
                metrics: v.results,
                improvement: this.calculateImprovement(v.results, results.variants[0].results)
            });
        });

        return report;
    }

    calculateDuration(start, end) {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        const hours = Math.floor((endDate - startDate) / (1000 * 60 * 60));
        return hours > 24 ? `${Math.floor(hours / 24)} วัน` : `${hours} ชั่วโมง`;
    }

    calculateImprovement(current, baseline) {
        if (baseline.engagement === 0) return 0;
        return ((current.engagement - baseline.engagement) / baseline.engagement * 100).toFixed(1);
    }

    generateRecommendation(results) {
        const winner = results.analysis.winner;
        const confidence = results.analysis.confidence;

        if (confidence >= 95) {
            return `✅ แนะนำให้ใช้ "${winner.name}" เนื่องจากมี engagement สูงกว่าแบบอื่น ${results.analysis.percentDiff.toFixed(1)}% อย่างมีนัยสำคัญ`;
        } else if (confidence >= 80) {
            return `⚠️ "${winner.name}" มีแนวโน้มดีกว่า แต่ยังต้องข้อมูลเพิ่มเพื่อยืนยัน`;
        } else {
            return `📊 ยังไม่เห็นความแตกต่างชัดเจน แนะนำให้รอข้อมูลเพิ่ม`;
        }
    }

    // ===========================================
    // STORAGE
    // ===========================================

    loadTests() {
        const saved = localStorage.getItem('ab_tests');
        return saved ? JSON.parse(saved) : [];
    }

    saveTests() {
        localStorage.setItem('ab_tests', JSON.stringify(this.tests));
    }

    loadResults() {
        const saved = localStorage.getItem('ab_results');
        return saved ? JSON.parse(saved) : {};
    }

    saveResults() {
        localStorage.setItem('ab_results', JSON.stringify(this.results));
    }

    getTest(testId) {
        return this.tests.find(t => t.id === testId);
    }

    getAllTests() {
        return this.tests;
    }

    getActiveTests() {
        return this.tests.filter(t => t.status === 'active');
    }

    deleteTest(testId) {
        this.tests = this.tests.filter(t => t.id !== testId);
        this.saveTests();
    }

    // ===========================================
    // NOTIFICATIONS
    // ===========================================

    notifyWinner(test) {
        const message = `🏆 A/B Test "${test.name}" มี Winner แล้ว!\n\nWinner: ${test.winner.name}\nEngagement: ${test.winner.results.engagement.toFixed(1)}%\nConfidence: ${test.confidence.toFixed(1)}%`;

        console.log(message);

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🏆 A/B Test Winner!', {
                body: message,
                icon: '/icon-192.png'
            });
        }

        // LINE Notify (ถ้ามี)
        if (typeof sendLineNotification === 'function') {
            sendLineNotification(message);
        }
    }
}

// สร้าง instance
const abTesting = new ABTestingSystem();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ABTestingSystem;
}

console.log('🧪 A/B Testing System loaded');
