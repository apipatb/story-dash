// Competitor Analysis - เฝ้าดูคู่แข่ง วิเคราะห์กลยุทธ์
// ดูว่าคู่แข่งทำอะไร content ไหนปัง แล้วเอามาปรับใช้

class CompetitorAnalysis {
    constructor() {
        this.competitors = this.loadCompetitors();
        this.trackedContent = this.loadTrackedContent();
        this.insights = this.loadInsights();
        this.autoTrackEnabled = false;
    }

    // ===========================================
    // COMPETITOR MANAGEMENT
    // ===========================================

    addCompetitor(config) {
        const competitor = {
            id: `comp_${Date.now()}`,
            name: config.name,
            platforms: config.platforms || [],
            channels: {
                tiktok: config.tiktokUsername || '',
                youtube: config.youtubeChannelId || '',
                facebook: config.facebookPageId || ''
            },
            category: config.category || 'general',
            addedAt: new Date().toISOString(),
            lastChecked: null,
            stats: {
                followers: 0,
                totalVideos: 0,
                avgViews: 0,
                avgLikes: 0,
                avgComments: 0,
                avgShares: 0,
                postFrequency: 0,
                engagementRate: 0
            },
            topContent: [],
            contentStrategy: {
                topics: [],
                hashtags: [],
                postingTimes: [],
                videoLength: { min: 0, max: 0, avg: 0 }
            }
        };

        this.competitors.push(competitor);
        this.saveCompetitors();

        console.log(`➕ เพิ่มคู่แข่ง: ${competitor.name}`);

        return competitor;
    }

    removeCompetitor(competitorId) {
        this.competitors = this.competitors.filter(c => c.id !== competitorId);
        this.saveCompetitors();
        console.log(`🗑️ ลบคู่แข่ง: ${competitorId}`);
    }

    getCompetitor(competitorId) {
        return this.competitors.find(c => c.id === competitorId);
    }

    getAllCompetitors() {
        return this.competitors;
    }

    // ===========================================
    // CONTENT TRACKING
    // ===========================================

    async trackCompetitorContent(competitorId, platform) {
        const competitor = this.getCompetitor(competitorId);
        if (!competitor) {
            console.warn('ไม่พบคู่แข่ง');
            return;
        }

        console.log(`🔍 กำลังติดตาม ${competitor.name} บน ${platform}...`);

        try {
            let content = [];

            switch (platform) {
                case 'tiktok':
                    content = await this.fetchTikTokContent(competitor.channels.tiktok);
                    break;
                case 'youtube':
                    content = await this.fetchYouTubeContent(competitor.channels.youtube);
                    break;
                case 'facebook':
                    content = await this.fetchFacebookContent(competitor.channels.facebook);
                    break;
            }

            // บันทึก content
            content.forEach(item => {
                this.trackContent(competitorId, platform, item);
            });

            // อัพเดทสถิติ
            this.updateCompetitorStats(competitor, content);

            // วิเคราะห์กลยุทธ์
            this.analyzeContentStrategy(competitor, content);

            competitor.lastChecked = new Date().toISOString();
            this.saveCompetitors();

            console.log(`✅ ติดตามสำเร็จ: ${content.length} รายการ`);

            return content;

        } catch (error) {
            console.error('Error tracking content:', error);
            return [];
        }
    }

    trackContent(competitorId, platform, contentData) {
        const tracked = {
            id: `tracked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            competitorId: competitorId,
            platform: platform,
            contentId: contentData.id,
            title: contentData.title,
            description: contentData.description,
            thumbnailUrl: contentData.thumbnailUrl,
            videoUrl: contentData.videoUrl,
            publishedAt: contentData.publishedAt,
            metrics: {
                views: contentData.views || 0,
                likes: contentData.likes || 0,
                comments: contentData.comments || 0,
                shares: contentData.shares || 0,
                engagementRate: 0
            },
            metadata: {
                hashtags: contentData.hashtags || [],
                duration: contentData.duration || 0,
                category: contentData.category || '',
                language: contentData.language || 'th'
            },
            analysis: null,
            trackedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // คำนวณ engagement rate
        tracked.metrics.engagementRate = this.calculateEngagementRate(tracked.metrics);

        this.trackedContent.push(tracked);
        this.saveTrackedContent();

        return tracked;
    }

    calculateEngagementRate(metrics) {
        if (metrics.views === 0) return 0;
        const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
        return (totalEngagements / metrics.views * 100);
    }

    // ===========================================
    // PLATFORM FETCHERS (PRODUCTION - API ONLY)
    // ===========================================

    async fetchTikTokContent(username) {
        console.log(`📱 Fetching TikTok content from @${username}...`);

        // ⚠️ TikTok ไม่มี official public API
        // แนะนำใช้ Third-party API services:

        const rapidApiKey = localStorage.getItem('rapidapi_key');

        if (!rapidApiKey) {
            console.warn('⚠️ ไม่มี RapidAPI Key - ต้องตั้งค่าก่อนใช้งาน');
            throw new Error('กรุณาตั้งค่า RapidAPI Key ใน Settings');
        }

        try {
            // ใช้ RapidAPI TikTok API
            const response = await fetch(`https://tiktok-api21.p.rapidapi.com/user/posts?username=${username}&count=10`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': rapidApiKey,
                    'X-RapidAPI-Host': 'tiktok-api21.p.rapidapi.com'
                }
            });

            if (!response.ok) {
                throw new Error(`TikTok API Error: ${response.status}`);
            }

            const data = await response.json();

            // แปลงเป็น format ที่ใช้งาน
            return data.videos?.map(video => ({
                id: video.id,
                title: video.title || video.desc,
                description: video.desc,
                thumbnailUrl: video.cover,
                videoUrl: video.play,
                publishedAt: new Date(video.createTime * 1000).toISOString(),
                views: video.stats?.playCount || 0,
                likes: video.stats?.diggCount || 0,
                comments: video.stats?.commentCount || 0,
                shares: video.stats?.shareCount || 0,
                hashtags: video.hashtags || [],
                duration: video.duration || 0,
                category: 'video'
            })) || [];

        } catch (error) {
            console.error('TikTok fetch error:', error);
            throw new Error('ไม่สามารถดึงข้อมูล TikTok ได้: ' + error.message);
        }
    }



    async fetchYouTubeContent(channelId) {
        console.log(`📹 Fetching YouTube content from channel: ${channelId}...`);

        // ใช้ YouTube Data API v3
        const apiKey = localStorage.getItem('youtube_api_key');

        if (!apiKey) {
            console.warn('⚠️ ไม่มี YouTube API Key');
            throw new Error('กรุณาตั้งค่า YouTube API Key ใน Settings');
        }

        try {
            // ดึง videos ล่าสุด
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?` +
                `part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
            );

            const data = await response.json();

            if (data.items) {
                // ดึง statistics แต่ละ video
                const videoIds = data.items.map(item => item.id.videoId).join(',');

                const statsResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?` +
                    `part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`
                );

                const statsData = await statsResponse.json();

                // รวมข้อมูล
                return data.items.map((item, i) => {
                    const stats = statsData.items[i]?.statistics || {};
                    const details = statsData.items[i]?.contentDetails || {};

                    return {
                        id: item.id.videoId,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        thumbnailUrl: item.snippet.thumbnails.high.url,
                        videoUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
                        publishedAt: item.snippet.publishedAt,
                        views: parseInt(stats.viewCount) || 0,
                        likes: parseInt(stats.likeCount) || 0,
                        comments: parseInt(stats.commentCount) || 0,
                        shares: 0,
                        hashtags: this.extractHashtags(item.snippet.description),
                        duration: this.parseDuration(details.duration),
                        category: item.snippet.categoryId
                    };
                });
            }

            return [];

        } catch (error) {
            console.error('YouTube API error:', error);
            throw new Error('ไม่สามารถดึงข้อมูล YouTube ได้: ' + error.message);
        }
    }

    async fetchFacebookContent(pageId) {
        console.log(`👥 Fetching Facebook content from page: ${pageId}...`);

        // ใช้ Facebook Graph API
        const accessToken = localStorage.getItem('facebook_access_token');

        if (!accessToken) {
            console.warn('⚠️ ไม่มี Facebook Access Token');
            throw new Error("API configuration required - no mock data in production");
        }

        try {
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${pageId}/videos?` +
                `fields=id,title,description,source,picture,created_time,length,views,likes.summary(true),comments.summary(true)&` +
                `limit=10&access_token=${accessToken}`
            );

            const data = await response.json();

            if (data.data) {
                return data.data.map(video => ({
                    id: video.id,
                    title: video.title || 'Untitled',
                    description: video.description || '',
                    thumbnailUrl: video.picture || '',
                    videoUrl: video.source || '',
                    publishedAt: video.created_time,
                    views: video.views || 0,
                    likes: video.likes?.summary?.total_count || 0,
                    comments: video.comments?.summary?.total_count || 0,
                    shares: 0,
                    hashtags: this.extractHashtags(video.description || ''),
                    duration: video.length || 0,
                    category: 'video'
                }));
            }

            return [];

        } catch (error) {
            console.error('Facebook API error:', error);
            throw new Error("API configuration required - no mock data in production");
        }
    }



    // ===========================================
    // ANALYSIS
    // ===========================================

    updateCompetitorStats(competitor, content) {
        if (content.length === 0) return;

        // คำนวณค่าเฉลี่ย
        const stats = {
            totalVideos: content.length,
            avgViews: this.average(content.map(c => c.views)),
            avgLikes: this.average(content.map(c => c.likes)),
            avgComments: this.average(content.map(c => c.comments)),
            avgShares: this.average(content.map(c => c.shares)),
            engagementRate: 0
        };

        // Engagement rate
        stats.engagementRate = (stats.avgLikes + stats.avgComments + stats.avgShares) / stats.avgViews * 100;

        // Post frequency (videos/week)
        const oldestDate = new Date(content[content.length - 1].publishedAt);
        const newestDate = new Date(content[0].publishedAt);
        const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
        stats.postFrequency = (content.length / daysDiff * 7).toFixed(1);

        competitor.stats = { ...competitor.stats, ...stats };
    }

    analyzeContentStrategy(competitor, content) {
        if (content.length === 0) return;

        const strategy = {
            topics: this.extractTopics(content),
            hashtags: this.extractPopularHashtags(content),
            postingTimes: this.analyzePostingTimes(content),
            videoLength: this.analyzeVideoLength(content)
        };

        competitor.contentStrategy = strategy;

        // หา top performing content
        competitor.topContent = content
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                title: c.title,
                views: c.views,
                engagementRate: this.calculateEngagementRate({
                    views: c.views,
                    likes: c.likes,
                    comments: c.comments,
                    shares: c.shares
                })
            }));
    }

    extractTopics(content) {
        // นับคำที่ปรากฏบ่อย
        const wordCount = {};

        content.forEach(c => {
            const words = (c.title + ' ' + c.description).split(/\s+/);
            words.forEach(word => {
                if (word.length > 2) {
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            });
        });

        // เรียงตามความถี่
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    extractPopularHashtags(content) {
        const hashtagCount = {};

        content.forEach(c => {
            c.hashtags.forEach(tag => {
                hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
            });
        });

        return Object.entries(hashtagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count, percentage: (count / content.length * 100).toFixed(1) }));
    }

    analyzePostingTimes(content) {
        const hourCount = {};

        content.forEach(c => {
            const hour = new Date(c.publishedAt).getHours();
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });

        return Object.entries(hourCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hour, count]) => ({ hour: `${hour}:00`, count, percentage: (count / content.length * 100).toFixed(1) }));
    }

    analyzeVideoLength(content) {
        const durations = content.map(c => c.duration).filter(d => d > 0);

        if (durations.length === 0) {
            return { min: 0, max: 0, avg: 0 };
        }

        return {
            min: Math.min(...durations),
            max: Math.max(...durations),
            avg: this.average(durations)
        };
    }

    // ===========================================
    // INSIGHTS & RECOMMENDATIONS
    // ===========================================

    generateInsights() {
        console.log('💡 กำลังวิเคราะห์ insights...');

        const insights = {
            generatedAt: new Date().toISOString(),
            competitors: this.competitors.length,
            totalTrackedContent: this.trackedContent.length,
            topPerformers: this.findTopPerformers(),
            trendingTopics: this.findTrendingTopics(),
            trendingHashtags: this.findTrendingHashtags(),
            bestPostingTimes: this.findBestPostingTimes(),
            averageVideoLength: this.calculateAverageVideoLength(),
            recommendations: []
        };

        // สร้างคำแนะนำ
        insights.recommendations = this.generateRecommendations(insights);

        this.insights = insights;
        this.saveInsights();

        console.log('✅ Insights generated');

        return insights;
    }

    findTopPerformers() {
        return this.trackedContent
            .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
            .slice(0, 10)
            .map(c => {
                const competitor = this.getCompetitor(c.competitorId);
                return {
                    title: c.title,
                    competitorName: competitor?.name || 'Unknown',
                    platform: c.platform,
                    views: c.metrics.views,
                    engagementRate: c.metrics.engagementRate.toFixed(2)
                };
            });
    }

    findTrendingTopics() {
        const topicCount = {};

        this.trackedContent.forEach(c => {
            const words = (c.title + ' ' + c.description).split(/\s+/);
            words.forEach(word => {
                if (word.length > 2) {
                    topicCount[word] = (topicCount[word] || 0) + 1;
                }
            });
        });

        return Object.entries(topicCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([topic, count]) => ({ topic, count }));
    }

    findTrendingHashtags() {
        const hashtagCount = {};

        this.trackedContent.forEach(c => {
            c.metadata.hashtags.forEach(tag => {
                hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
            });
        });

        return Object.entries(hashtagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([hashtag, count]) => ({ hashtag, count }));
    }

    findBestPostingTimes() {
        const hourCount = {};

        this.trackedContent.forEach(c => {
            const hour = new Date(c.publishedAt).getHours();
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });

        return Object.entries(hourCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
    }

    calculateAverageVideoLength() {
        const durations = this.trackedContent
            .map(c => c.metadata.duration)
            .filter(d => d > 0);

        return durations.length > 0 ? this.average(durations) : 0;
    }

    generateRecommendations(insights) {
        const recommendations = [];

        // คำแนะนำ 1: Trending topics
        if (insights.trendingTopics.length > 0) {
            recommendations.push({
                type: 'topic',
                priority: 'high',
                title: 'ทำคอนเทนต์เกี่ยวกับหัวข้อยอดนิยม',
                description: `หัวข้อที่กำลังมาแรง: ${insights.trendingTopics.slice(0, 3).map(t => t.topic).join(', ')}`,
                action: 'สร้างคอนเทนต์เกี่ยวกับหัวข้อเหล่านี้'
            });
        }

        // คำแนะนำ 2: Hashtags
        if (insights.trendingHashtags.length > 0) {
            recommendations.push({
                type: 'hashtag',
                priority: 'medium',
                title: 'ใช้ hashtags ยอดนิยม',
                description: `Hashtags ที่คู่แข่งใช้บ่อย: ${insights.trendingHashtags.slice(0, 5).map(h => h.hashtag).join(' ')}`,
                action: 'เพิ่ม hashtags เหล่านี้ในโพสต์'
            });
        }

        // คำแนะนำ 3: Posting time
        if (insights.bestPostingTimes.length > 0) {
            recommendations.push({
                type: 'timing',
                priority: 'high',
                title: 'โพสต์ในเวลาที่ดีที่สุด',
                description: `เวลาที่คู่แข่งโพสต์บ่อย: ${insights.bestPostingTimes.slice(0, 3).map(t => t.hour).join(', ')}`,
                action: 'กำหนดตารางโพสต์ตามเวลาเหล่านี้'
            });
        }

        // คำแนะนำ 4: Video length
        if (insights.averageVideoLength > 0) {
            recommendations.push({
                type: 'duration',
                priority: 'medium',
                title: 'ความยาววิดีโอที่เหมาะสม',
                description: `คู่แข่งทำวิดีโอเฉลี่ย ${Math.round(insights.averageVideoLength)} วินาที`,
                action: 'ปรับความยาววิดีโอให้ใกล้เคียงกัน'
            });
        }

        return recommendations;
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    average(numbers) {
        if (numbers.length === 0) return 0;
        return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
    }

    extractHashtags(text) {
        const matches = text.match(/#[\w\u0E00-\u0E7F]+/g);
        return matches || [];
    }

    parseDuration(isoDuration) {
        // Parse ISO 8601 duration (PT1M30S = 90 seconds)
        if (!isoDuration) return 0;

        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    // ===========================================
    // STORAGE
    // ===========================================

    loadCompetitors() {
        const saved = localStorage.getItem('competitors');
        return saved ? JSON.parse(saved) : [];
    }

    saveCompetitors() {
        localStorage.setItem('competitors', JSON.stringify(this.competitors));
    }

    loadTrackedContent() {
        const saved = localStorage.getItem('tracked_content');
        return saved ? JSON.parse(saved) : [];
    }

    saveTrackedContent() {
        localStorage.setItem('tracked_content', JSON.stringify(this.trackedContent));
    }

    loadInsights() {
        const saved = localStorage.getItem('competitor_insights');
        return saved ? JSON.parse(saved) : null;
    }

    saveInsights() {
        localStorage.setItem('competitor_insights', JSON.stringify(this.insights));
    }
}

// สร้าง instance
const competitorAnalysis = new CompetitorAnalysis();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompetitorAnalysis;
}

console.log('🎯 Competitor Analysis loaded');
