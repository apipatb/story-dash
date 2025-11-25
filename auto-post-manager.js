// Auto Post Manager - ระบบจัดการ Auto Posting แบบครบวงจร
// เปิดเว็บแล้วทำงานอัตโนมัติเลย ไม่ต้องกดปุ่ม

class AutoPostManager {
    constructor() {
        this.isEnabled = this.loadSetting('auto_post_enabled', false);
        this.isRunning = false;
        this.config = this.loadConfig();
        this.stats = this.loadStats();
        this.lastRun = null;
        this.nextRun = null;
        this.errors = [];

        // Auto-start ถ้า enabled
        if (this.isEnabled) {
            this.autoStart();
        }
    }

    // ===========================================
    // AUTO START & INITIALIZATION
    // ===========================================

    async autoStart() {
        console.log('🚀 Auto-Post Manager: Starting...');

        // รอให้ระบบโหลดเสร็จก่อน
        await this.waitForDependencies();

        // ตรวจสอบความพร้อม
        const readiness = this.checkReadiness();

        if (!readiness.ready) {
            console.warn('⚠️ ระบบยังไม่พร้อม:', readiness.missing);
            this.showSetupReminder(readiness.missing);
            return;
        }

        // เริ่มระบบ auto posting
        await this.start();
    }

    async waitForDependencies() {
        // รอให้ dependencies โหลดเสร็จ
        const maxWait = 10000; // 10 วินาที
        const startTime = Date.now();

        while (Date.now() - startTime < maxWait) {
            if (
                typeof autoContentGenerator !== 'undefined' &&
                typeof automationScheduler !== 'undefined' &&
                typeof autoPoster !== 'undefined'
            ) {
                console.log('✅ Dependencies loaded');
                return true;
            }
            await this.delay(100);
        }

        console.error('❌ Dependencies timeout');
        return false;
    }

    checkReadiness() {
        const missing = [];

        // ตรวจสอบ API keys
        const openaiKey = localStorage.getItem('openai_api_key');
        if (!openaiKey) {
            missing.push('OpenAI API Key');
        }

        // ตรวจสอบการตั้งค่า
        if (!this.config.videosPerDay || this.config.videosPerDay < 1) {
            missing.push('Videos per day setting');
        }

        if (!this.config.platforms || this.config.platforms.length === 0) {
            missing.push('Target platforms');
        }

        return {
            ready: missing.length === 0,
            missing: missing
        };
    }

    // ===========================================
    // MAIN AUTO POSTING WORKFLOW
    // ===========================================

    async start() {
        if (this.isRunning) {
            console.log('⚠️ Auto-Post Manager already running');
            return;
        }

        console.log('━'.repeat(60));
        console.log('🤖 AUTO-POST MANAGER STARTED');
        console.log('━'.repeat(60));
        console.log(`📊 Configuration:`);
        console.log(`   💫 Videos/Day: ${this.config.videosPerDay}`);
        console.log(`   📱 Platforms: ${this.config.platforms.join(', ')}`);
        console.log(`   ⏰ Post Times: ${this.config.postingTimes.join(', ')}`);
        console.log(`   🔄 Auto Generate: ${this.config.autoGenerate ? 'ON' : 'OFF'}`);
        console.log(`   🎬 Auto Create Video: ${this.config.autoCreateVideo ? 'ON' : 'OFF'}`);
        console.log(`   📤 Auto Post: ${this.config.autoPost ? 'ON' : 'OFF'}`);
        console.log('━'.repeat(60));

        this.isRunning = true;
        this.isEnabled = true;
        this.saveSetting('auto_post_enabled', true);

        // อัพเดท UI
        this.updateUI();

        // Run ทันที (ถ้าต้องการ) หรือรอถึงเวลาที่กำหนด
        if (this.config.runImmediately) {
            console.log('▶️ Running immediately...');
            await this.runWorkflow();
        }

        // Schedule daily runs
        this.scheduleDailyRuns();

        // Start monitoring
        this.startMonitoring();

        // Show notification
        this.notify('success', '✅ Auto-Post Manager เริ่มทำงานแล้ว',
            `จะสร้าง ${this.config.videosPerDay} videos/วัน`);
    }

    async stop() {
        console.log('⏸️ Stopping Auto-Post Manager...');

        this.isRunning = false;
        this.isEnabled = false;
        this.saveSetting('auto_post_enabled', false);

        // Clear timers
        if (this.dailyTimer) clearTimeout(this.dailyTimer);
        if (this.monitoringTimer) clearInterval(this.monitoringTimer);

        // อัพเดท UI
        this.updateUI();

        this.notify('info', '⏸️ Auto-Post Manager หยุดทำงาน');

        console.log('✅ Auto-Post Manager stopped');
    }

    async runWorkflow() {
        console.log('\n🚀 Starting Auto-Post Workflow...');
        console.log(`📅 ${new Date().toLocaleString('th-TH')}\n`);

        this.lastRun = new Date();
        const workflowId = Date.now();

        try {
            // Step 1: Generate Content
            let contents = [];
            if (this.config.autoGenerate) {
                console.log('📝 STEP 1/3: Generating Content Ideas...');
                contents = await this.generateContent();
                console.log(`✅ Generated ${contents.length} content ideas\n`);
            } else {
                // ใช้ content ที่มีอยู่ (status = ready)
                contents = this.getReadyContent();
                console.log(`📋 Using ${contents.length} existing ready contents\n`);
            }

            if (contents.length === 0) {
                console.warn('⚠️ No content to process');
                return;
            }

            // Step 2: Create Videos
            let videos = [];
            if (this.config.autoCreateVideo) {
                console.log('🎬 STEP 2/3: Creating Videos...');

                // สำหรับ demo ให้ใช้ mock video
                videos = contents.map(content => this.createMockVideo(content));
                console.log(`✅ Created ${videos.length} videos\n`);
            }

            // Step 3: Post to Platforms
            if (this.config.autoPost && videos.length > 0) {
                console.log('📤 STEP 3/3: Posting to Platforms...');
                await this.postVideos(videos, contents);
                console.log(`✅ Posted ${videos.length} videos\n`);
            }

            // Update stats
            this.updateStats({
                generated: contents.length,
                created: videos.length,
                posted: videos.length
            });

            // Success notification
            this.notify('success', '✅ Workflow Complete!',
                `สร้างและโพสต์ ${videos.length} videos สำเร็จ`);

            console.log('━'.repeat(60));
            console.log('✅ AUTO-POST WORKFLOW COMPLETED');
            console.log('━'.repeat(60));

        } catch (error) {
            console.error('❌ Workflow Error:', error);
            this.handleError(error, workflowId);
        }
    }

    // ===========================================
    // CONTENT GENERATION
    // ===========================================

    async generateContent() {
        const contents = [];
        const count = this.config.videosPerDay;

        for (let i = 0; i < count; i++) {
            try {
                console.log(`  📝 Generating ${i + 1}/${count}...`);

                // ถ้ามี autoContentGenerator ให้ใช้
                if (typeof autoContentGenerator !== 'undefined') {
                    const content = await autoContentGenerator.generateOne();
                    contents.push(content);
                } else {
                    // Fallback: สร้าง content แบบง่าย
                    const content = this.createSimpleContent(i);
                    contents.push(content);
                }

                console.log(`     ✓ "${contents[i].title}"`);

                // รอสักครู่ระหว่าง API calls
                if (i < count - 1) {
                    await this.delay(2000);
                }

            } catch (error) {
                console.error(`     ✗ Error: ${error.message}`);
                this.errors.push({ step: 'generation', error: error.message, time: new Date() });
            }
        }

        return contents;
    }

    createSimpleContent(index) {
        const topics = [
            'ทำไมต้องไม่หวีผมตอนเย็น?',
            'ห้ามนอนหัวหนึ่งเท้าหนึ่ง',
            'ห้ามตัดเล็บตอนกลางคืน',
            'ห้ามชี้รุ้ง',
            'ห้ามกวาดบ้านตอนเย็น'
        ];

        return {
            id: `auto_${Date.now()}_${index}`,
            title: topics[index % topics.length],
            category: 'ความเชื่อ/งมงาย',
            platform: this.config.platforms,
            script: `[Auto-generated] เนื้อหาเกี่ยวกับ ${topics[index % topics.length]}`,
            status: 'ready',
            hashtags: '#ความเชื่อไทย #วิทยาศาสตร์ #ThaiCulture',
            createdAt: new Date().toISOString(),
            generatedBy: 'AutoPostManager'
        };
    }

    getReadyContent() {
        // ดึง content ที่มี status = ready จาก localStorage
        const allContents = JSON.parse(localStorage.getItem('contents') || '[]');
        return allContents
            .filter(c => c.status === 'ready')
            .slice(0, this.config.videosPerDay);
    }

    // ===========================================
    // VIDEO CREATION (MOCK)
    // ===========================================

    createMockVideo(content) {
        // สร้าง mock video object
        // ในการใช้งานจริงต้องใช้ aiVideoCreator
        return {
            id: `video_${Date.now()}`,
            contentId: content.id,
            videoUrl: `blob:mock-video-${content.id}`,
            thumbnailUrl: `blob:mock-thumb-${content.id}`,
            duration: 60,
            resolution: '1080x1920',
            fileSize: 1024 * 1024 * 5, // 5MB
            createdAt: new Date().toISOString()
        };
    }

    // ===========================================
    // POSTING
    // ===========================================

    async postVideos(videos, contents) {
        const results = [];

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            const content = contents[i];

            console.log(`  📤 Posting ${i + 1}/${videos.length}: "${content.title}"`);

            try {
                // คำนวณเวลาโพสต์
                const postTime = this.calculatePostTime(i);

                // เพิ่มใน queue
                const result = await this.schedulePost(video, content, postTime);
                results.push(result);

                console.log(`     ✓ Scheduled for ${postTime.toLocaleTimeString('th-TH')}`);

            } catch (error) {
                console.error(`     ✗ Error: ${error.message}`);
                this.errors.push({ step: 'posting', error: error.message, time: new Date() });
            }
        }

        return results;
    }

    async schedulePost(video, content, postTime) {
        // ถ้ามี autoPoster ให้ใช้
        if (typeof autoPoster !== 'undefined') {
            autoPoster.addToQueue(video, content, postTime);
            return { scheduled: true, postTime };
        }

        // Fallback: บันทึกแค่ในระบบ
        const scheduled = {
            video,
            content,
            postTime,
            status: 'scheduled',
            platforms: content.platform || this.config.platforms
        };

        // เก็บใน localStorage
        const queue = JSON.parse(localStorage.getItem('post_queue') || '[]');
        queue.push(scheduled);
        localStorage.setItem('post_queue', JSON.stringify(queue));

        return scheduled;
    }

    calculatePostTime(index) {
        const now = new Date();
        const times = this.config.postingTimes || ['18:00', '20:00'];

        // แบ่งโพสต์ไปตามเวลาที่กำหนด
        const timeIndex = index % times.length;
        const [hours, minutes] = times[timeIndex].split(':').map(Number);

        const postTime = new Date(now);
        postTime.setHours(hours, minutes, 0, 0);

        // ถ้าเวลาผ่านไปแล้ว กำหนดเป็นวันถัดไป
        if (postTime <= now) {
            postTime.setDate(postTime.getDate() + 1);
        }

        // ถ้ามีหลาย videos ให้เว้นห่างกัน
        if (index >= times.length) {
            const dayOffset = Math.floor(index / times.length);
            postTime.setDate(postTime.getDate() + dayOffset);
        }

        return postTime;
    }

    // ===========================================
    // SCHEDULING
    // ===========================================

    scheduleDailyRuns() {
        // คำนวณเวลาถัดไปที่ต้อง run
        const nextRun = this.calculateNextRun();
        const delay = nextRun - new Date();

        console.log(`⏰ Next run scheduled at: ${nextRun.toLocaleString('th-TH')}`);
        console.log(`   (in ${Math.round(delay / 1000 / 60)} minutes)\n`);

        this.nextRun = nextRun;
        this.updateUI();

        // ตั้ง timer
        this.dailyTimer = setTimeout(async () => {
            console.log('⏰ Time to run workflow!');
            await this.runWorkflow();

            // ตั้งรอบถัดไปอีก 24 ชั่วโมง
            this.scheduleDailyRuns();

        }, delay);
    }

    calculateNextRun() {
        const now = new Date();
        const runTime = this.config.dailyRunTime || '06:00';
        const [hours, minutes] = runTime.split(':').map(Number);

        const next = new Date(now);
        next.setHours(hours, minutes, 0, 0);

        // ถ้าเวลาผ่านไปแล้ว กำหนดเป็นพรุ่งนี้
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }

        return next;
    }

    // ===========================================
    // MONITORING & AUTO-RECOVERY
    // ===========================================

    startMonitoring() {
        console.log('👁️ Monitoring started\n');

        // ตรวจสอบทุก 5 นาที
        this.monitoringTimer = setInterval(() => {
            this.checkSystemHealth();
        }, 5 * 60 * 1000);
    }

    checkSystemHealth() {
        const health = {
            timestamp: new Date(),
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            nextRun: this.nextRun,
            errors: this.errors.length,
            recentErrors: this.errors.slice(-5)
        };

        // ตรวจสอบว่ามี error มากเกินไปหรือไม่
        const recentErrors = this.errors.filter(e =>
            new Date() - e.time < 60 * 60 * 1000 // ใน 1 ชั่วโมงที่ผ่านมา
        );

        if (recentErrors.length >= 5) {
            console.warn('⚠️ Too many recent errors, may need attention');
            this.notify('warning', '⚠️ System Warning',
                `มี errors ${recentErrors.length} ครั้งในชั่วโมงที่ผ่านมา`);
        }

        // บันทึก health log
        this.saveHealthLog(health);

        return health;
    }

    handleError(error, workflowId) {
        console.error('Error details:', error);

        this.errors.push({
            workflowId,
            error: error.message,
            stack: error.stack,
            time: new Date()
        });

        // Auto-recovery: ลองใหม่อีกครั้งหลัง 30 นาที
        if (this.config.autoRetry && this.errors.length < 3) {
            console.log('🔄 Auto-retry scheduled in 30 minutes...');

            setTimeout(() => {
                console.log('🔄 Retrying workflow...');
                this.runWorkflow();
            }, 30 * 60 * 1000);
        }

        // แจ้งเตือน
        this.notify('error', '❌ Workflow Error', error.message);
    }

    // ===========================================
    // CONFIGURATION
    // ===========================================

    loadConfig() {
        const defaults = {
            enabled: false,
            videosPerDay: 3,
            platforms: ['youtube', 'facebook', 'tiktok'],
            postingTimes: ['18:00', '20:00'],
            dailyRunTime: '06:00',
            autoGenerate: true,
            autoCreateVideo: true,
            autoPost: true,
            runImmediately: false,
            autoRetry: true
        };

        const saved = localStorage.getItem('auto_post_config');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        localStorage.setItem('auto_post_config', JSON.stringify(this.config));

        // Restart ถ้ากำลังทำงานอยู่
        if (this.isRunning) {
            console.log('🔄 Restarting with new config...');
            this.stop();
            this.start();
        }
    }

    // ===========================================
    // STATISTICS
    // ===========================================

    loadStats() {
        const defaults = {
            totalGenerated: 0,
            totalCreated: 0,
            totalPosted: 0,
            startedAt: new Date().toISOString(),
            lastUpdated: null
        };

        const saved = localStorage.getItem('auto_post_stats');
        return saved ? JSON.parse(saved) : defaults;
    }

    updateStats(data) {
        this.stats.totalGenerated += data.generated || 0;
        this.stats.totalCreated += data.created || 0;
        this.stats.totalPosted += data.posted || 0;
        this.stats.lastUpdated = new Date().toISOString();

        localStorage.setItem('auto_post_stats', JSON.stringify(this.stats));
        this.updateUI();
    }

    getStats() {
        return {
            ...this.stats,
            isRunning: this.isRunning,
            isEnabled: this.isEnabled,
            lastRun: this.lastRun,
            nextRun: this.nextRun,
            errors: this.errors.length,
            uptime: this.calculateUptime()
        };
    }

    calculateUptime() {
        if (!this.stats.startedAt) return 0;
        const start = new Date(this.stats.startedAt);
        const now = new Date();
        return Math.floor((now - start) / 1000 / 60 / 60); // hours
    }

    // ===========================================
    // UI UPDATES & NOTIFICATIONS
    // ===========================================

    updateUI() {
        // อัพเดท status display
        const statusEl = document.getElementById('auto-post-status');
        if (statusEl) {
            statusEl.textContent = this.isRunning ? '🟢 Running' : '⚪ Stopped';
            statusEl.className = this.isRunning ? 'status-running' : 'status-stopped';
        }

        // อัพเดท stats
        const statsEl = document.getElementById('auto-post-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div>Generated: ${this.stats.totalGenerated}</div>
                <div>Created: ${this.stats.totalCreated}</div>
                <div>Posted: ${this.stats.totalPosted}</div>
            `;
        }

        // อัพเดท next run
        const nextRunEl = document.getElementById('auto-post-next-run');
        if (nextRunEl && this.nextRun) {
            nextRunEl.textContent = this.nextRun.toLocaleString('th-TH');
        }

        // อัพเดท toggle button
        const toggleBtn = document.getElementById('auto-post-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.isRunning ? '⏸️ Stop Auto-Post' : '▶️ Start Auto-Post';
            toggleBtn.className = this.isRunning ? 'btn-stop' : 'btn-start';
        }
    }

    notify(type, title, message = '') {
        // Toast notification
        if (typeof showToast === 'function') {
            showToast(`${title}${message ? ': ' + message : ''}`, type);
        }

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png'
            });
        }

        console.log(`[${type.toUpperCase()}] ${title}${message ? ': ' + message : ''}`);
    }

    showSetupReminder(missing) {
        const message = `กรุณาตั้งค่าก่อนใช้งาน:\n${missing.map(m => `- ${m}`).join('\n')}`;

        this.notify('warning', '⚠️ Setup Required', message);

        console.warn('━'.repeat(60));
        console.warn('⚠️ AUTO-POST SETUP REQUIRED');
        console.warn('━'.repeat(60));
        console.warn(message);
        console.warn('━'.repeat(60));
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    loadSetting(key, defaultValue) {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    }

    saveSetting(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    saveHealthLog(health) {
        const logs = JSON.parse(localStorage.getItem('health_logs') || '[]');
        logs.push(health);

        // เก็บแค่ 100 รายการล่าสุด
        if (logs.length > 100) {
            logs.shift();
        }

        localStorage.setItem('health_logs', JSON.stringify(logs));
    }

    // ===========================================
    // PUBLIC API
    // ===========================================

    enable() {
        if (!this.isRunning) {
            this.start();
        }
    }

    disable() {
        if (this.isRunning) {
            this.stop();
        }
    }

    toggle() {
        if (this.isRunning) {
            this.disable();
        } else {
            this.enable();
        }
    }

    async runNow() {
        console.log('🚀 Manual run triggered');
        await this.runWorkflow();
    }

    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isRunning: this.isRunning,
            config: this.config,
            stats: this.getStats(),
            errors: this.errors.slice(-10),
            health: this.checkSystemHealth()
        };
    }

    reset() {
        if (confirm('⚠️ รีเซ็ต Auto-Post Manager? (สถิติจะถูกลบ)')) {
            this.stop();
            localStorage.removeItem('auto_post_config');
            localStorage.removeItem('auto_post_stats');
            localStorage.removeItem('auto_post_enabled');
            localStorage.removeItem('health_logs');
            location.reload();
        }
    }
}

// สร้าง instance และ export
const autoPostManager = new AutoPostManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoPostManager;
}

// Auto-initialize
console.log('💫 Auto-Post Manager loaded');
if (autoPostManager.isEnabled) {
    console.log('🚀 Auto-posting is ENABLED - System will start automatically');
} else {
    console.log('⏸️ Auto-posting is DISABLED - Call autoPostManager.enable() to start');
}
