// Automation Scheduler - Main orchestrator สำหรับระบบ auto money-making
// ประสานงาน: Content Generation → Video Creation → Posting → Analytics

class AutomationScheduler {
    constructor() {
        this.isRunning = false;
        this.config = this.loadConfig();
        this.schedule = {
            contentGeneration: '06:00', // ทุกวัน 06:00 สร้าง content
            videoCreation: '08:00',     // ทุกวัน 08:00 สร้าง video
            posting: '18:00'             // ทุกวัน 18:00 โพสต์
        };
        this.stats = {
            totalGenerated: 0,
            totalCreated: 0,
            totalPosted: 0,
            totalRevenue: 0
        };
        this.timers = [];
    }

    // โหลดการตั้งค่า
    loadConfig() {
        const defaultConfig = {
            enabled: false,
            videosPerDay: 5,
            platforms: ['youtube', 'facebook', 'tiktok'],
            autoGenerate: true,
            autoCreateVideo: true,
            autoPost: true,
            postingTimes: ['18:00', '20:00'], // เวลาโพสต์หลัก
            maxConcurrent: 2 // จำนวน video ที่สร้างพร้อมกัน
        };

        const saved = localStorage.getItem('automation_config');
        return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    }

    // บันทึกการตั้งค่า
    saveConfig() {
        localStorage.setItem('automation_config', JSON.stringify(this.config));
    }

    // อัพเดทการตั้งค่า
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();

        if (this.isRunning) {
            console.log('🔄 รีสตาร์ทระบบด้วยการตั้งค่าใหม่...');
            this.stop();
            this.start();
        }
    }

    // ===========================================
    // MAIN AUTOMATION WORKFLOW
    // ===========================================

    async runDailyWorkflow() {
        console.log('🚀 เริ่มต้น Daily Automation Workflow');
        console.log(`📅 ${new Date().toLocaleString('th-TH')}`);

        const startTime = Date.now();

        try {
            // Step 1: Generate Content Ideas
            console.log('\n📝 Step 1/3: Generating Content...');
            const contents = await this.generateDailyContent();

            // Step 2: Create Videos
            console.log('\n🎬 Step 2/3: Creating Videos...');
            const videos = await this.createVideos(contents);

            // Step 3: Schedule Posts
            console.log('\n📤 Step 3/3: Scheduling Posts...');
            await this.schedulePosts(videos);

            // บันทึกสถิติ
            this.updateStats({
                generated: contents.length,
                created: videos.length,
                posted: videos.length
            });

            const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
            console.log(`\n✅ เสร็จสมบูรณ์ใช้เวลา ${duration} นาที`);

            // ส่ง notification
            this.sendSuccessNotification(contents.length, videos.length);

        } catch (error) {
            console.error('❌ Error in daily workflow:', error);
            this.sendErrorNotification(error);
        }
    }

    // ===========================================
    // STEP 1: CONTENT GENERATION
    // ===========================================

    async generateDailyContent() {
        console.log(`📊 กำลังสร้าง ${this.config.videosPerDay} content ideas...`);

        const contents = [];

        for (let i = 0; i < this.config.videosPerDay; i++) {
            try {
                console.log(`  ${i + 1}/${this.config.videosPerDay}: สร้าง content...`);

                const content = await autoContentGenerator.generateOne();
                contents.push(content);

                console.log(`  ✅ "${content.title}"`);

                // รอ 2 วินาทีระหว่าง API calls
                if (i < this.config.videosPerDay - 1) {
                    await this.delay(2000);
                }

            } catch (error) {
                console.error(`  ❌ Error generating content ${i + 1}:`, error.message);
            }
        }

        console.log(`\n✅ สร้าง content สำเร็จ ${contents.length}/${this.config.videosPerDay} รายการ`);
        return contents;
    }

    // ===========================================
    // STEP 2: VIDEO CREATION
    // ===========================================

    async createVideos(contents) {
        console.log(`🎥 กำลังสร้าง ${contents.length} videos...`);

        const videos = [];
        const batches = this.createBatches(contents, this.config.maxConcurrent);

        for (let b = 0; b < batches.length; b++) {
            const batch = batches[b];
            console.log(`\n  Batch ${b + 1}/${batches.length} (${batch.length} videos):`);

            // สร้าง videos พร้อมกันใน batch
            const batchResults = await Promise.allSettled(
                batch.map(async (content, i) => {
                    console.log(`    ${i + 1}. สร้าง video: "${content.title}"`);

                    try {
                        const video = await aiVideoCreator.createCompleteVideo(content);
                        console.log(`    ✅ Video พร้อม: ${content.title}`);
                        return { content, video };

                    } catch (error) {
                        console.error(`    ❌ Error: ${error.message}`);
                        throw error;
                    }
                })
            );

            // เก็บเฉพาะที่สำเร็จ
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    videos.push(result.value);
                }
            }

            // รอระหว่าง batches
            if (b < batches.length - 1) {
                console.log('    ⏳ รอ 1 นาที...');
                await this.delay(60000);
            }
        }

        console.log(`\n✅ สร้าง video สำเร็จ ${videos.length}/${contents.length} รายการ`);
        return videos;
    }

    // แบ่งเป็น batches
    createBatches(array, size) {
        const batches = [];
        for (let i = 0; i < array.length; i += size) {
            batches.push(array.slice(i, i + size));
        }
        return batches;
    }

    // ===========================================
    // STEP 3: POSTING
    // ===========================================

    async schedulePosts(videos) {
        console.log(`📤 กำลัง schedule ${videos.length} posts...`);

        const postTimes = this.generatePostTimes(videos.length);

        for (let i = 0; i < videos.length; i++) {
            const { content, video } = videos[i];
            const postTime = postTimes[i];

            console.log(`  ${i + 1}. "${content.title}"`);
            console.log(`     ⏰ จะโพสต์ที่: ${postTime.toLocaleString('th-TH')}`);

            // เพิ่มใน post queue
            autoPoster.addToQueue(video, content, postTime);
        }

        console.log('\n✅ Schedule posts สำเร็จทั้งหมด');
    }

    // สร้างเวลาโพสต์ที่เหมาะสม
    generatePostTimes(count) {
        const times = [];
        const today = new Date();
        const baseHours = [18, 19, 20]; // Prime time

        for (let i = 0; i < count; i++) {
            const time = new Date(today);

            // แบ่งโพสต์ไปตามช่วงเวลา prime time
            const hourIndex = i % baseHours.length;
            time.setHours(baseHours[hourIndex], 0, 0, 0);

            // ถ้าโพสต์มากกว่า 3 วัน ให้แบ่งไปวันถัดไป
            if (i >= baseHours.length) {
                const dayOffset = Math.floor(i / baseHours.length);
                time.setDate(time.getDate() + dayOffset);
            }

            times.push(time);
        }

        return times;
    }

    // ===========================================
    // SCHEDULING & TIMERS
    // ===========================================

    start() {
        if (this.isRunning) {
            console.log('⚠️ Automation กำลังทำงานอยู่แล้ว');
            return;
        }

        console.log('🚀 เริ่มต้น Automation System');
        console.log('━'.repeat(50));
        console.log(`📊 การตั้งค่า:`);
        console.log(`   - Videos/วัน: ${this.config.videosPerDay}`);
        console.log(`   - Platforms: ${this.config.platforms.join(', ')}`);
        console.log(`   - Auto Generate: ${this.config.autoGenerate ? '✅' : '❌'}`);
        console.log(`   - Auto Create Video: ${this.config.autoCreateVideo ? '✅' : '❌'}`);
        console.log(`   - Auto Post: ${this.config.autoPost ? '✅' : '❌'}`);
        console.log('━'.repeat(50));

        this.isRunning = true;
        this.config.enabled = true;
        this.saveConfig();

        // รันทันทีครั้งแรก (ถ้าต้องการ)
        // this.runDailyWorkflow();

        // ตั้งเวลาทำงานอัตโนมัติ
        this.scheduleDaily();

        console.log('✅ Automation System กำลังทำงาน');
    }

    stop() {
        console.log('⏸️ หยุด Automation System');

        this.isRunning = false;
        this.config.enabled = false;
        this.saveConfig();

        // ยกเลิก timers ทั้งหมด
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];

        console.log('✅ หยุดระบบสำเร็จ');
    }

    scheduleDaily() {
        console.log('📅 ตั้งเวลาทำงานอัตโนมัติ...');

        // ตั้งเวลาสำหรับแต่ละ step
        const now = new Date();

        // Content Generation ที่ 06:00
        const genTime = this.getNextScheduledTime('06:00');
        const genDelay = genTime - now;

        console.log(`   📝 Content Generation: ${genTime.toLocaleString('th-TH')}`);

        const timer1 = setTimeout(() => {
            this.runDailyWorkflow();

            // ตั้งรอบถัดไปทุก 24 ชั่วโมง
            setInterval(() => {
                this.runDailyWorkflow();
            }, 24 * 60 * 60 * 1000);

        }, genDelay);

        this.timers.push(timer1);
    }

    getNextScheduledTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const now = new Date();
        const scheduled = new Date(now);

        scheduled.setHours(hours, minutes, 0, 0);

        // ถ้าเวลาที่ตั้งผ่านไปแล้ว กำหนดเป็นพรุ่งนี้
        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1);
        }

        return scheduled;
    }

    // ===========================================
    // STATISTICS & MONITORING
    // ===========================================

    updateStats(data) {
        this.stats.totalGenerated += data.generated || 0;
        this.stats.totalCreated += data.created || 0;
        this.stats.totalPosted += data.posted || 0;

        // บันทึก
        localStorage.setItem('automation_stats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('automation_stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
        return this.stats;
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            config: this.config,
            stats: this.stats,
            nextRun: this.isRunning ? this.getNextScheduledTime('06:00') : null,
            componentsStatus: {
                contentGenerator: autoContentGenerator.getStatus(),
                videoCreator: aiVideoCreator.getStatus(),
                poster: autoPoster.getStatus()
            }
        };
    }

    // ===========================================
    // NOTIFICATIONS
    // ===========================================

    sendSuccessNotification(generated, created) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('✅ Automation Complete!', {
                body: `สร้าง ${generated} content และ ${created} videos สำเร็จ`,
                icon: '/icon-192.png'
            });
        }

        // แสดง toast
        if (typeof showToast === 'function') {
            showToast(`✅ สร้าง ${created} videos สำเร็จ!`, 'success');
        }
    }

    sendErrorNotification(error) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('❌ Automation Error', {
                body: error.message,
                icon: '/icon-192.png'
            });
        }

        if (typeof showToast === 'function') {
            showToast(`❌ Error: ${error.message}`, 'error');
        }
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ทดสอบระบบ (ใช้ค่าที่น้อยลง)
    async testRun() {
        console.log('🧪 Test Run - สร้าง 1 content + video');

        const oldConfig = { ...this.config };

        // ใช้ค่าน้อยๆ สำหรับทดสอบ
        this.config.videosPerDay = 1;

        try {
            await this.runDailyWorkflow();
            console.log('✅ Test Run สำเร็จ!');
        } catch (error) {
            console.error('❌ Test Run ล้มเหลว:', error);
        }

        // คืนค่าเดิม
        this.config = oldConfig;
    }
}

// สร้าง instance
const automationScheduler = new AutomationScheduler();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationScheduler;
}
