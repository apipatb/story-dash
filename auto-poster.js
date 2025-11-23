// Auto Poster - โพสต์ video อัตโนมัติไป TikTok, YouTube, Facebook
// รองรับ YouTube API, Facebook API และ TikTok automation

class AutoPoster {
    constructor() {
        this.youtubeToken = localStorage.getItem('youtube_access_token') || '';
        this.facebookToken = localStorage.getItem('facebook_access_token') || '';
        this.facebookPageId = localStorage.getItem('facebook_page_id') || '';
        this.tiktokMethod = 'manual'; // 'manual' or 'auto'
        this.postQueue = [];
        this.isPosting = false;
    }

    // ===========================================
    // YOUTUBE API - AUTO UPLOAD
    // ===========================================

    async uploadToYouTube(videoPackage, content) {
        if (!this.youtubeToken) {
            console.warn('⚠️ ไม่มี YouTube access token');
            return { success: false, error: 'No YouTube token' };
        }

        try {
            console.log('📤 กำลังอัพโหลดไป YouTube...');

            // 1. Initialize resumable upload
            const metadata = {
                snippet: {
                    title: content.title,
                    description: this.generateDescription(content),
                    tags: content.hashtags ? content.hashtags.split(' ').map(t => t.replace('#', '')) : [],
                    categoryId: '22', // People & Blogs
                    defaultLanguage: 'th',
                    defaultAudioLanguage: 'th'
                },
                status: {
                    privacyStatus: 'public', // หรือ 'private', 'unlisted'
                    selfDeclaredMadeForKids: false,
                    madeForKids: false
                }
            };

            // 2. Get upload URL
            const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.youtubeToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': 'video/*'
                },
                body: JSON.stringify(metadata)
            });

            if (!initResponse.ok) {
                throw new Error(`YouTube API Error: ${initResponse.status}`);
            }

            const uploadUrl = initResponse.headers.get('Location');

            // 3. Upload video file
            const videoBlob = await fetch(videoPackage.videoUrl).then(r => r.blob());

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/*'
                },
                body: videoBlob
            });

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();

            console.log('✅ อัพโหลด YouTube สำเร็จ:', result.id);

            return {
                success: true,
                platform: 'youtube',
                videoId: result.id,
                url: `https://youtube.com/watch?v=${result.id}`,
                postedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('YouTube upload error:', error);
            return { success: false, error: error.message };
        }
    }

    // YouTube OAuth2 flow
    async authorizeYouTube() {
        const clientId = localStorage.getItem('youtube_client_id');
        const redirectUri = window.location.origin + '/oauth/youtube';

        if (!clientId) {
            alert('กรุณาตั้งค่า YouTube Client ID ก่อน');
            return;
        }

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=token&` +
            `scope=https://www.googleapis.com/auth/youtube.upload`;

        window.open(authUrl, 'YouTube Authorization', 'width=600,height=800');
    }

    // ===========================================
    // FACEBOOK API - AUTO POST
    // ===========================================

    async uploadToFacebook(videoPackage, content) {
        if (!this.facebookToken || !this.facebookPageId) {
            console.warn('⚠️ ไม่มี Facebook access token หรือ Page ID');
            return { success: false, error: 'No Facebook token/page' };
        }

        try {
            console.log('📤 กำลังอัพโหลดไป Facebook...');

            // 1. Initialize upload
            const initResponse = await fetch(`https://graph.facebook.com/v18.0/${this.facebookPageId}/videos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upload_phase: 'start',
                    access_token: this.facebookToken,
                    file_size: videoPackage.fileSize || 0
                })
            });

            const initData = await initResponse.json();
            const uploadSessionId = initData.upload_session_id;

            // 2. Upload video
            const videoBlob = await fetch(videoPackage.videoUrl).then(r => r.blob());

            const formData = new FormData();
            formData.append('upload_phase', 'transfer');
            formData.append('upload_session_id', uploadSessionId);
            formData.append('access_token', this.facebookToken);
            formData.append('video_file_chunk', videoBlob);

            await fetch(`https://graph.facebook.com/v18.0/${this.facebookPageId}/videos`, {
                method: 'POST',
                body: formData
            });

            // 3. Finish upload
            const finishResponse = await fetch(`https://graph.facebook.com/v18.0/${this.facebookPageId}/videos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upload_phase: 'finish',
                    upload_session_id: uploadSessionId,
                    access_token: this.facebookToken,
                    title: content.title,
                    description: this.generateDescription(content),
                    thumb: videoPackage.thumbnailUrl
                })
            });

            const result = await finishResponse.json();

            console.log('✅ อัพโหลด Facebook สำเร็จ:', result.id);

            return {
                success: true,
                platform: 'facebook',
                videoId: result.id,
                url: `https://facebook.com/${result.id}`,
                postedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Facebook upload error:', error);
            return { success: false, error: error.message };
        }
    }

    // Facebook OAuth flow
    async authorizeFacebook() {
        const appId = localStorage.getItem('facebook_app_id');
        const redirectUri = window.location.origin + '/oauth/facebook';

        if (!appId) {
            alert('กรุณาตั้งค่า Facebook App ID ก่อน');
            return;
        }

        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
            `client_id=${appId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=pages_manage_posts,pages_read_engagement,publish_video`;

        window.open(authUrl, 'Facebook Authorization', 'width=600,height=800');
    }

    // ===========================================
    // TIKTOK - MANUAL / AUTOMATION
    // ===========================================

    async uploadToTikTok(videoPackage, content) {
        // ⚠️ TikTok ไม่มี official upload API สำหรับ regular users
        // มี 2 ทางเลือก:

        // Option 1: Manual (แนะนำ)
        if (this.tiktokMethod === 'manual') {
            return this.prepareTikTokManual(videoPackage, content);
        }

        // Option 2: Automation (ใช้ unofficial method - อาจมีปัญหา)
        return await this.uploadToTikTokAuto(videoPackage, content);
    }

    // Manual TikTok upload (ดาวน์โหลดไฟล์ให้ user อัพเอง)
    prepareTikTokManual(videoPackage, content) {
        console.log('📲 เตรียม TikTok upload (Manual)');

        // สร้างข้อมูลสำหรับ copy
        const caption = this.generateTikTokCaption(content);

        // แสดง modal ให้ user
        const info = {
            success: true,
            platform: 'tiktok',
            method: 'manual',
            videoUrl: videoPackage.videoUrl,
            thumbnailUrl: videoPackage.thumbnailUrl,
            caption: caption,
            instructions: [
                '1. ดาวน์โหลด video ด้านล่าง',
                '2. เปิดแอพ TikTok',
                '3. กด + สร้าง video',
                '4. อัพโหลด video ที่ดาวน์โหลด',
                '5. Copy caption ด้านล่างไปวาง',
                '6. กด Post'
            ]
        };

        // แสดง TikTok upload modal
        if (typeof showTikTokUploadModal === 'function') {
            showTikTokUploadModal(info);
        }

        return info;
    }

    // Auto TikTok upload (unofficial - ใช้ automation)
    async uploadToTikTokAuto(videoPackage, content) {
        console.log('🤖 TikTok automation (Experimental)');

        // ⚠️ วิธีนี้ใช้ browser automation หรือ unofficial API
        // อาจโดน ban หรือไม่ทำงานได้

        return {
            success: false,
            platform: 'tiktok',
            method: 'auto',
            error: 'TikTok auto-upload ยังไม่ support - ใช้ manual method',
            message: 'แนะนำให้ใช้ manual upload เพื่อความปลอดภัย'
        };
    }

    // ===========================================
    // HELPER FUNCTIONS
    // ===========================================

    generateDescription(content) {
        let desc = content.script || '';

        // ตัดให้สั้นลง
        if (desc.length > 5000) {
            desc = desc.substring(0, 4900) + '...';
        }

        // เพิ่ม hashtags
        if (content.hashtags) {
            desc += '\n\n' + content.hashtags;
        }

        // เพิ่ม CTA
        desc += '\n\n❤️ กดไลค์และติดตามเพื่อดูคลิปดีๆ แบบนี้ต่อไป!';

        return desc;
    }

    generateTikTokCaption(content) {
        const maxLength = 2200; // TikTok caption limit

        let caption = content.title + '\n\n';

        // เพิ่มส่วนของ script (สั้นๆ)
        if (content.script) {
            const shortScript = content.script.substring(0, 500);
            caption += shortScript + '\n\n';
        }

        // เพิ่ม hashtags
        if (content.hashtags) {
            caption += content.hashtags;
        }

        // ตัดให้ไม่เกิน limit
        if (caption.length > maxLength) {
            caption = caption.substring(0, maxLength - 3) + '...';
        }

        return caption;
    }

    // ===========================================
    // POST TO ALL PLATFORMS
    // ===========================================

    async postToAllPlatforms(videoPackage, content) {
        console.log(`📤 กำลังโพสต์ "${content.title}" ไปทุก platforms...`);

        const results = {
            youtube: null,
            facebook: null,
            tiktok: null
        };

        // Post to YouTube
        if (content.platform?.includes('youtube') || !content.platform) {
            results.youtube = await this.uploadToYouTube(videoPackage, content);
            await this.delay(5000); // รอ 5 วินาที
        }

        // Post to Facebook
        if (content.platform?.includes('facebook') || !content.platform) {
            results.facebook = await this.uploadToFacebook(videoPackage, content);
            await this.delay(5000);
        }

        // Post to TikTok
        if (content.platform?.includes('tiktok') || !content.platform) {
            results.tiktok = await this.uploadToTikTok(videoPackage, content);
        }

        // บันทึกผลลัพธ์
        this.savePostResults(content.id, results);

        console.log('✅ โพสต์เสร็จสิ้น:', results);

        return results;
    }

    // ===========================================
    // SCHEDULING & QUEUE
    // ===========================================

    async schedulePost(videoPackage, content, postTime) {
        const now = new Date();
        const scheduledTime = new Date(postTime);
        const delay = scheduledTime - now;

        if (delay <= 0) {
            // โพสต์ทันที
            return await this.postToAllPlatforms(videoPackage, content);
        }

        console.log(`⏰ จะโพสต์ที่: ${scheduledTime.toLocaleString('th-TH')}`);

        // ตั้งเวลาโพสต์
        setTimeout(async () => {
            console.log('⏰ ถึงเวลาโพสต์!');
            await this.postToAllPlatforms(videoPackage, content);
        }, delay);

        return {
            scheduled: true,
            postTime: scheduledTime.toISOString(),
            delay: delay
        };
    }

    // เพิ่มใน queue
    addToQueue(videoPackage, content, postTime = null) {
        this.postQueue.push({
            videoPackage,
            content,
            postTime: postTime || this.getBestPostTime()
        });

        console.log(`➕ เพิ่มใน post queue (${this.postQueue.length} รายการ)`);

        // เริ่ม process queue
        this.processQueue();
    }

    // Process queue
    async processQueue() {
        if (this.isPosting || this.postQueue.length === 0) {
            return;
        }

        this.isPosting = true;

        while (this.postQueue.length > 0) {
            const item = this.postQueue.shift();

            // ตรวจสอบว่าถึงเวลาแล้วหรือยัง
            const now = new Date();
            const postTime = new Date(item.postTime);

            if (postTime > now) {
                // ยังไม่ถึงเวลา ใส่กลับไป
                this.postQueue.unshift(item);
                break;
            }

            // ถึงเวลาแล้ว โพสต์เลย
            try {
                await this.postToAllPlatforms(item.videoPackage, item.content);

                // รอ 10 นาทีระหว่าง posts
                if (this.postQueue.length > 0) {
                    await this.delay(10 * 60 * 1000);
                }

            } catch (error) {
                console.error('Error posting:', error);
            }
        }

        this.isPosting = false;

        // ถ้ายังมีใน queue ให้ตั้งเวลาตรวจสอบอีกที
        if (this.postQueue.length > 0) {
            setTimeout(() => this.processQueue(), 60 * 1000); // ตรวจทุก 1 นาที
        }
    }

    // หาเวลาที่ดีที่สุดในการโพสต์
    getBestPostTime() {
        // ใช้ข้อมูลจาก Best Time Analyzer
        const now = new Date();
        const hour = now.getHours();

        // ถ้าอยู่ในช่วง prime time (18:00-21:00) โพสต์เลย
        if (hour >= 18 && hour <= 21) {
            return now;
        }

        // ไม่งั้นรอถึง 18:00
        const next18 = new Date(now);
        next18.setHours(18, 0, 0, 0);

        if (now.getHours() >= 18) {
            // ถ้าเลย 18:00 แล้ว กำหนดเป็นพรุ่งนี้
            next18.setDate(next18.getDate() + 1);
        }

        return next18;
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    savePostResults(contentId, results) {
        const allResults = JSON.parse(localStorage.getItem('post_results') || '{}');
        allResults[contentId] = {
            ...results,
            postedAt: new Date().toISOString()
        };
        localStorage.setItem('post_results', JSON.stringify(allResults));
    }

    getPostResults(contentId) {
        const allResults = JSON.parse(localStorage.getItem('post_results') || '{}');
        return allResults[contentId] || null;
    }

    getStatus() {
        return {
            isPosting: this.isPosting,
            queueLength: this.postQueue.length,
            hasTokens: {
                youtube: !!this.youtubeToken,
                facebook: !!this.facebookToken
            },
            tiktokMethod: this.tiktokMethod
        };
    }
}

// สร้าง instance
const autoPoster = new AutoPoster();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoPoster;
}
