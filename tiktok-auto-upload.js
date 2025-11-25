// TikTok Auto-Upload - อัพโหลด TikTok อัตโนมัติ (Advanced)
// ⚠️ WARNING: ใช้ unofficial methods - อาจมีความเสี่ยงโดน ban
// แนะนำให้ใช้กับ account ทดสอบก่อน

class TikTokAutoUpload {
    constructor() {
        this.method = localStorage.getItem('tiktok_upload_method') || 'manual';
        this.credentials = this.loadCredentials();
        this.uploadQueue = [];
        this.isUploading = false;
        this.uploadHistory = this.loadHistory();

        // Rate limiting
        this.maxUploadsPerDay = 10;
        this.uploadDelay = 30 * 60 * 1000; // 30 minutes between uploads
        this.lastUploadTime = null;
    }

    // ===========================================
    // METHOD SELECTION
    // ===========================================

    setMethod(method) {
        // Methods:
        // 1. manual - ดาวน์โหลดและอัพเอง (ปลอดภัยสุด)
        // 2. browser-automation - ใช้ Puppeteer/Playwright
        // 3. api-unofficial - ใช้ unofficial API
        // 4. api-business - ใช้ TikTok Business API (ถ้ามี access)

        this.method = method;
        localStorage.setItem('tiktok_upload_method', method);

        console.log(`📱 TikTok upload method: ${method}`);
    }

    // ===========================================
    // METHOD 1: MANUAL (SAFE)
    // ===========================================

    prepareManualUpload(videoPackage, content) {
        console.log('📲 เตรียมสำหรับ Manual Upload');

        const caption = this.generateCaption(content);
        const hashtags = this.generateHashtags(content);

        return {
            method: 'manual',
            videoUrl: videoPackage.videoUrl,
            thumbnailUrl: videoPackage.thumbnailUrl,
            caption: caption,
            hashtags: hashtags,
            instructions: [
                '1. ดาวน์โหลดวิดีโอด้านล่าง',
                '2. เปิดแอพ TikTok บนมือถือ',
                '3. กด + เพื่อสร้างวิดีโอ',
                '4. เลือก Upload และเลือกไฟล์ที่ดาวน์โหลด',
                '5. Copy caption และ hashtags ด้านล่าง',
                '6. เลือก cover image',
                '7. ตั้งค่า privacy และ settings',
                '8. กด Post'
            ],
            downloadButton: `
                <a href="${videoPackage.videoUrl}" download="tiktok-video-${content.id}.mp4"
                   class="btn btn-primary">
                    📥 ดาวน์โหลดวิดีโอ
                </a>
            `,
            copyButtons: `
                <button onclick="copyToClipboard('${this.escapeQuotes(caption)}')">
                    📋 Copy Caption
                </button>
                <button onclick="copyToClipboard('${this.escapeQuotes(hashtags)}')">
                    #️⃣ Copy Hashtags
                </button>
            `
        };
    }

    // ===========================================
    // METHOD 2: BROWSER AUTOMATION (ADVANCED)
    // ===========================================

    async uploadViaBrowserAutomation(videoPackage, content) {
        console.log('🤖 TikTok Browser Automation Upload');

        // ⚠️ วิธีนี้ต้องการ:
        // 1. Puppeteer/Playwright running on server
        // 2. TikTok account ที่ login ไว้
        // 3. อาจโดน bot detection

        if (!this.credentials.sessionCookie) {
            throw new Error('ต้องมี TikTok session cookie');
        }

        try {
            // สร้าง upload request
            const uploadData = {
                method: 'browser-automation',
                videoUrl: videoPackage.videoUrl,
                caption: this.generateCaption(content),
                hashtags: this.generateHashtags(content),
                coverTime: videoPackage.coverTime || 0,
                privacy: 'public',
                allowComments: true,
                allowDuet: true,
                allowStitch: true,
                sessionCookie: this.credentials.sessionCookie
            };

            // เรียก automation service
            // ในการใช้งานจริง ต้องมี backend service ที่รัน Puppeteer
            const response = await fetch('/api/tiktok/upload-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(uploadData)
            });

            if (!response.ok) {
                throw new Error('Automation failed');
            }

            const result = await response.json();

            console.log('✅ TikTok upload สำเร็จ (Automation)');

            this.recordUpload(content.id, 'browser-automation', result);

            return {
                success: true,
                method: 'browser-automation',
                videoId: result.videoId,
                url: result.url,
                uploadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Browser automation error:', error);
            return {
                success: false,
                error: error.message,
                fallback: 'manual'
            };
        }
    }

    // ===========================================
    // METHOD 3: UNOFFICIAL API (EXPERIMENTAL)
    // ===========================================

    async uploadViaUnofficialAPI(videoPackage, content) {
        console.log('🔓 TikTok Unofficial API Upload');

        // ⚠️ นี่คือ experimental method
        // ใช้ reverse-engineered TikTok API
        // อาจหยุดทำงานได้ทุกเมื่อ

        if (!this.credentials.sessionId) {
            throw new Error('ต้องมี TikTok session ID');
        }

        try {
            // Step 1: Get upload credentials
            const credsResponse = await fetch('https://www.tiktok.com/api/v1/web/upload/credentials/', {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Cookie': `sessionid=${this.credentials.sessionId}`,
                    'Referer': 'https://www.tiktok.com/upload'
                }
            });

            if (!credsResponse.ok) {
                throw new Error('Failed to get upload credentials');
            }

            const creds = await credsResponse.json();

            // Step 2: Upload video to TikTok's CDN
            const videoBlob = await fetch(videoPackage.videoUrl).then(r => r.blob());

            const formData = new FormData();
            formData.append('video', videoBlob, 'video.mp4');
            formData.append('upload_token', creds.upload_token);

            const uploadResponse = await fetch(creds.upload_url, {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Video upload failed');
            }

            const uploadResult = await uploadResponse.json();

            // Step 3: Publish video
            const publishData = {
                video_id: uploadResult.video_id,
                text: this.generateCaption(content) + '\n\n' + this.generateHashtags(content),
                privacy_level: 'PUBLIC',
                allow_comment: true,
                allow_duet: true,
                allow_stitch: true,
                sound_muted: false
            };

            const publishResponse = await fetch('https://www.tiktok.com/api/v1/web/publish/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `sessionid=${this.credentials.sessionId}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify(publishData)
            });

            if (!publishResponse.ok) {
                throw new Error('Publish failed');
            }

            const result = await publishResponse.json();

            console.log('✅ TikTok upload สำเร็จ (Unofficial API)');

            this.recordUpload(content.id, 'api-unofficial', result);

            return {
                success: true,
                method: 'api-unofficial',
                videoId: result.video_id,
                url: `https://www.tiktok.com/@${this.credentials.username}/video/${result.video_id}`,
                uploadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Unofficial API error:', error);
            return {
                success: false,
                error: error.message,
                fallback: 'manual'
            };
        }
    }

    // ===========================================
    // METHOD 4: BUSINESS API (OFFICIAL)
    // ===========================================

    async uploadViaBusinessAPI(videoPackage, content) {
        console.log('🏢 TikTok Business API Upload');

        // ใช้ TikTok Business API
        // ต้องสมัครเป็น TikTok Developer และมี API access

        if (!this.credentials.accessToken || !this.credentials.businessAccountId) {
            throw new Error('ต้องมี TikTok Business API access token');
        }

        try {
            // Step 1: Initialize video upload
            const initResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/tt_video/upload/init/', {
                method: 'POST',
                headers: {
                    'Access-Token': this.credentials.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    advertiser_id: this.credentials.businessAccountId,
                    upload_type: 'UPLOAD_BY_FILE',
                    video_file_name: `video_${content.id}.mp4`
                })
            });

            const initData = await initResponse.json();

            if (initData.code !== 0) {
                throw new Error(initData.message);
            }

            // Step 2: Upload video file
            const videoBlob = await fetch(videoPackage.videoUrl).then(r => r.blob());

            const uploadFormData = new FormData();
            uploadFormData.append('video', videoBlob);
            uploadFormData.append('upload_token', initData.data.upload_token);

            const uploadResponse = await fetch(initData.data.upload_url, {
                method: 'POST',
                body: uploadFormData
            });

            const uploadData = await uploadResponse.json();

            if (uploadData.code !== 0) {
                throw new Error(uploadData.message);
            }

            // Step 3: Create post
            const postResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/tt_video/publish/', {
                method: 'POST',
                headers: {
                    'Access-Token': this.credentials.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    advertiser_id: this.credentials.businessAccountId,
                    video_id: uploadData.data.video_id,
                    text: this.generateCaption(content) + '\n\n' + this.generateHashtags(content),
                    privacy_level: 'PUBLIC_TO_EVERYONE',
                    disable_comment: false,
                    disable_duet: false,
                    disable_stitch: false
                })
            });

            const postData = await postResponse.json();

            if (postData.code !== 0) {
                throw new Error(postData.message);
            }

            console.log('✅ TikTok upload สำเร็จ (Business API)');

            this.recordUpload(content.id, 'api-business', postData.data);

            return {
                success: true,
                method: 'api-business',
                videoId: postData.data.item_id,
                url: `https://www.tiktok.com/@${this.credentials.username}/video/${postData.data.item_id}`,
                uploadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Business API error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ===========================================
    // MAIN UPLOAD FUNCTION
    // ===========================================

    async upload(videoPackage, content) {
        console.log(`📤 Uploading to TikTok via ${this.method}...`);

        // ตรวจสอบ rate limit
        if (!this.checkRateLimit()) {
            console.warn('⚠️ Rate limit exceeded');
            return {
                success: false,
                error: 'Rate limit exceeded',
                nextAvailableTime: this.getNextAvailableTime()
            };
        }

        let result;

        switch (this.method) {
            case 'manual':
                result = this.prepareManualUpload(videoPackage, content);
                break;

            case 'browser-automation':
                result = await this.uploadViaBrowserAutomation(videoPackage, content);
                break;

            case 'api-unofficial':
                result = await this.uploadViaUnofficialAPI(videoPackage, content);
                break;

            case 'api-business':
                result = await this.uploadViaBusinessAPI(videoPackage, content);
                break;

            default:
                result = this.prepareManualUpload(videoPackage, content);
        }

        // บันทึกเวลา
        if (result.success) {
            this.lastUploadTime = Date.now();
        }

        return result;
    }

    // ===========================================
    // QUEUE MANAGEMENT
    // ===========================================

    addToQueue(videoPackage, content, scheduledTime) {
        const queueItem = {
            id: `queue_${Date.now()}`,
            videoPackage,
            content,
            scheduledTime: scheduledTime || new Date(),
            status: 'pending',
            addedAt: new Date().toISOString()
        };

        this.uploadQueue.push(queueItem);
        this.saveQueue();

        console.log(`➕ Added to TikTok upload queue: ${content.title}`);

        // เริ่ม process queue
        this.processQueue();

        return queueItem;
    }

    async processQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) {
            return;
        }

        this.isUploading = true;

        // เรียงตามเวลา
        this.uploadQueue.sort((a, b) =>
            new Date(a.scheduledTime) - new Date(b.scheduledTime)
        );

        for (const item of this.uploadQueue) {
            const now = new Date();
            const scheduledTime = new Date(item.scheduledTime);

            // ตรวจสอบว่าถึงเวลาแล้วหรือยัง
            if (scheduledTime > now) {
                console.log(`⏰ รอถึงเวลา: ${scheduledTime.toLocaleString('th-TH')}`);
                break;
            }

            // ตรวจสอบ rate limit
            if (!this.checkRateLimit()) {
                console.log('⏰ รอเพราะ rate limit...');
                break;
            }

            // อัพโหลด
            try {
                console.log(`🚀 Uploading: ${item.content.title}`);

                item.status = 'uploading';
                this.saveQueue();

                const result = await this.upload(item.videoPackage, item.content);

                if (result.success) {
                    item.status = 'completed';
                    item.result = result;
                } else {
                    item.status = 'failed';
                    item.error = result.error;
                }

                this.saveQueue();

                // รอก่อนอัพโหลดอันต่อไป
                if (this.uploadQueue.length > 0) {
                    await this.delay(this.uploadDelay);
                }

            } catch (error) {
                console.error('Upload error:', error);
                item.status = 'failed';
                item.error = error.message;
                this.saveQueue();
            }
        }

        // ลบรายการที่เสร็จแล้ว
        this.uploadQueue = this.uploadQueue.filter(item =>
            item.status !== 'completed'
        );
        this.saveQueue();

        this.isUploading = false;

        // ถ้ายังมีใน queue ให้ตั้งเวลาตรวจสอบอีกที
        if (this.uploadQueue.length > 0) {
            setTimeout(() => this.processQueue(), 60 * 1000);
        }
    }

    // ===========================================
    // RATE LIMITING
    // ===========================================

    checkRateLimit() {
        // ตรวจสอบว่าอัพโหลดเกิน limit หรือยัง
        const today = new Date().toDateString();
        const todayUploads = this.uploadHistory.filter(h =>
            new Date(h.uploadedAt).toDateString() === today
        );

        if (todayUploads.length >= this.maxUploadsPerDay) {
            return false;
        }

        // ตรวจสอบว่าผ่านเวลาที่กำหนดหรือยัง
        if (this.lastUploadTime) {
            const timeSinceLastUpload = Date.now() - this.lastUploadTime;
            if (timeSinceLastUpload < this.uploadDelay) {
                return false;
            }
        }

        return true;
    }

    getNextAvailableTime() {
        if (this.lastUploadTime) {
            return new Date(this.lastUploadTime + this.uploadDelay);
        }
        return new Date();
    }

    // ===========================================
    // CAPTION & HASHTAG GENERATION
    // ===========================================

    generateCaption(content) {
        const maxLength = 2200;

        let caption = content.title;

        if (content.script) {
            const shortScript = content.script.substring(0, 500);
            caption += '\n\n' + shortScript;
        }

        if (caption.length > maxLength - 100) {
            caption = caption.substring(0, maxLength - 100) + '...';
        }

        return caption;
    }

    generateHashtags(content) {
        let hashtags = content.hashtags || '';

        // เพิ่ม TikTok standard hashtags
        const standardTags = ['#fyp', '#foryou', '#foryoupage', '#viral', '#trending'];
        standardTags.forEach(tag => {
            if (!hashtags.includes(tag)) {
                hashtags += ' ' + tag;
            }
        });

        return hashtags;
    }

    // ===========================================
    // CREDENTIALS MANAGEMENT
    // ===========================================

    setCredentials(creds) {
        this.credentials = { ...this.credentials, ...creds };
        this.saveCredentials();
    }

    loadCredentials() {
        const saved = localStorage.getItem('tiktok_credentials');
        return saved ? JSON.parse(saved) : {
            username: '',
            sessionId: '',
            sessionCookie: '',
            accessToken: '',
            businessAccountId: ''
        };
    }

    saveCredentials() {
        localStorage.setItem('tiktok_credentials', JSON.stringify(this.credentials));
    }

    // ===========================================
    // HISTORY & STORAGE
    // ===========================================

    recordUpload(contentId, method, result) {
        this.uploadHistory.push({
            contentId,
            method,
            result,
            uploadedAt: new Date().toISOString()
        });

        // เก็บแค่ 100 รายการล่าสุด
        if (this.uploadHistory.length > 100) {
            this.uploadHistory = this.uploadHistory.slice(-100);
        }

        this.saveHistory();
    }

    loadHistory() {
        const saved = localStorage.getItem('tiktok_upload_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('tiktok_upload_history', JSON.stringify(this.uploadHistory));
    }

    saveQueue() {
        localStorage.setItem('tiktok_upload_queue', JSON.stringify(this.uploadQueue));
    }

    loadQueue() {
        const saved = localStorage.getItem('tiktok_upload_queue');
        this.uploadQueue = saved ? JSON.parse(saved) : [];
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    escapeQuotes(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    getStatus() {
        return {
            method: this.method,
            isUploading: this.isUploading,
            queueLength: this.uploadQueue.length,
            uploadsToday: this.uploadHistory.filter(h =>
                new Date(h.uploadedAt).toDateString() === new Date().toDateString()
            ).length,
            maxUploadsPerDay: this.maxUploadsPerDay,
            nextAvailableTime: this.getNextAvailableTime()
        };
    }
}

// สร้าง instance
const tiktokAutoUpload = new TikTokAutoUpload();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TikTokAutoUpload;
}

console.log('📱 TikTok Auto-Upload loaded');
console.log(`   Method: ${tiktokAutoUpload.method}`);
