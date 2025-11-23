// AI Video Creator - สร้าง video อัตโนมัติด้วย AI
// ใช้ ElevenLabs (Text-to-Speech) + Pictory (Video Generation) + Canva (Thumbnail)

class AIVideoCreator {
    constructor() {
        this.elevenlabsKey = localStorage.getItem('elevenlabs_api_key') || '';
        this.pictoryKey = localStorage.getItem('pictory_api_key') || '';
        this.canvaKey = localStorage.getItem('canva_api_key') || '';
        this.isProcessing = false;
        this.queue = [];
    }

    // ตั้งค่า API Keys
    setApiKeys(keys) {
        if (keys.elevenlabs) {
            this.elevenlabsKey = keys.elevenlabs;
            localStorage.setItem('elevenlabs_api_key', keys.elevenlabs);
        }
        if (keys.pictory) {
            this.pictoryKey = keys.pictory;
            localStorage.setItem('pictory_api_key', keys.pictory);
        }
        if (keys.canva) {
            this.canvaKey = keys.canva;
            localStorage.setItem('canva_api_key', keys.canva);
        }
    }

    // =====================================
    // 1. TEXT-TO-SPEECH (ElevenLabs)
    // =====================================

    async generateVoiceover(script, voiceId = 'KlT0Vou9VJmSw3v3pTYY') {
        // voiceId: ใช้เสียงภาษาไทย (หรือเสียงใดก็ได้ที่ ElevenLabs มี)

        if (!this.elevenlabsKey) {
            console.warn('⚠️ ไม่มี ElevenLabs API Key - ใช้ Web Speech API แทน');
            return await this.generateVoiceoverFallback(script);
        }

        try {
            console.log('🎙️ กำลังสร้างเสียงบรรยาย...');

            // แยก script ตามช่วงเวลา
            const cleanScript = this.extractNarration(script);

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenlabsKey
                },
                body: JSON.stringify({
                    text: cleanScript,
                    model_id: 'eleven_multilingual_v2', // รองรับภาษาไทย
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API Error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            console.log('✅ สร้างเสียงบรรยายสำเร็จ');
            return { audioUrl, audioBlob, duration: await this.getAudioDuration(audioUrl) };

        } catch (error) {
            console.error('Error generating voiceover:', error);
            return await this.generateVoiceoverFallback(script);
        }
    }

    // Fallback: ใช้ Web Speech API (ฟรี แต่คุณภาพไม่ดีเท่า)
    async generateVoiceoverFallback(script) {
        console.log('🔊 ใช้ Web Speech API (Fallback)');

        const cleanScript = this.extractNarration(script);

        // ใช้ browser's SpeechSynthesis API
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(cleanScript);
            utterance.lang = 'th-TH';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Note: Web Speech API ไม่สามารถ export เป็นไฟล์ได้โดยตรง
            // ต้องใช้ recording หรือใช้บริการอื่น

            window.speechSynthesis.speak(utterance);

            resolve({
                audioUrl: null,
                audioBlob: null,
                duration: cleanScript.length / 15, // ประมาณ 15 ตัวอักษร/วินาที
                fallback: true,
                message: 'ใช้ Web Speech API - แนะนำให้ตั้งค่า ElevenLabs API Key เพื่อคุณภาพที่ดีกว่า'
            });
        });
    }

    // แยกเอาแต่บรรยายออกจาก script (ตัด timing และ visual suggestions)
    extractNarration(script) {
        // ตัดส่วน [0-5 วินาที], Visual Suggestions, etc.
        let narration = script
            .replace(/\[.*?\]/g, '') // ตัด [0-5 วินาที]
            .replace(/Hook:|เนื้อหาส่วนที่.*?:|CTA:|Visual Suggestions:.*$/s, '')
            .replace(/- .*$/gm, '') // ตัด bullet points
            .trim();

        return narration;
    }

    // คำนวณความยาวเสียง
    async getAudioDuration(audioUrl) {
        return new Promise((resolve) => {
            const audio = new Audio(audioUrl);
            audio.addEventListener('loadedmetadata', () => {
                resolve(audio.duration);
            });
        });
    }

    // =====================================
    // 2. VIDEO GENERATION (Pictory AI)
    // =====================================

    async generateVideo(content) {
        if (!this.pictoryKey) {
            console.warn('⚠️ ไม่มี Pictory API Key - ใช้ระบบจำลอง');
            return await this.generateVideoFallback(content);
        }

        try {
            console.log('🎬 กำลังสร้าง video...');

            // Pictory API workflow
            // 1. Create project
            const project = await this.createPictoryProject(content);

            // 2. Add scenes based on script
            await this.addPictoryScenes(project.id, content.script);

            // 3. Render video
            const video = await this.renderPictoryVideo(project.id);

            console.log('✅ สร้าง video สำเร็จ');
            return video;

        } catch (error) {
            console.error('Error generating video:', error);
            return await this.generateVideoFallback(content);
        }
    }

    // Create Pictory project
    async createPictoryProject(content) {
        const response = await fetch('https://api.pictory.ai/pictoryapis/v1/project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Pictory-User-Id': 'YOUR_USER_ID',
                'Authorization': `Bearer ${this.pictoryKey}`
            },
            body: JSON.stringify({
                projectName: content.title,
                aspectRatio: '9:16', // Vertical video for TikTok/Shorts
                language: 'th'
            })
        });

        return await response.json();
    }

    // Add scenes to Pictory
    async addPictoryScenes(projectId, script) {
        // แยก script เป็น scenes ตามช่วงเวลา
        const scenes = this.parseScriptToScenes(script);

        for (const scene of scenes) {
            await fetch(`https://api.pictory.ai/pictoryapis/v1/project/${projectId}/scene`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.pictoryKey}`
                },
                body: JSON.stringify({
                    text: scene.text,
                    duration: scene.duration,
                    visualQuery: scene.visual // ค้นหาภาพที่เกี่ยวข้อง
                })
            });
        }
    }

    // Render final video
    async renderPictoryVideo(projectId) {
        const response = await fetch(`https://api.pictory.ai/pictoryapis/v1/project/${projectId}/render`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.pictoryKey}`
            }
        });

        const result = await response.json();

        // รอจนกว่า video จะ render เสร็จ
        return await this.waitForRender(result.renderId);
    }

    // รอ render เสร็จ
    async waitForRender(renderId) {
        let status = 'processing';
        let videoUrl = null;

        while (status === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 10000)); // รอ 10 วินาที

            const response = await fetch(`https://api.pictory.ai/pictoryapis/v1/render/${renderId}`, {
                headers: {
                    'Authorization': `Bearer ${this.pictoryKey}`
                }
            });

            const data = await response.json();
            status = data.status;
            videoUrl = data.videoUrl;
        }

        return { videoUrl, renderId };
    }

    // แยก script เป็น scenes
    parseScriptToScenes(script) {
        const scenes = [];
        const lines = script.split('\n');
        let currentScene = null;

        for (const line of lines) {
            const timeMatch = line.match(/\[(\d+)-(\d+) วินาที\]/);

            if (timeMatch) {
                if (currentScene) {
                    scenes.push(currentScene);
                }

                currentScene = {
                    startTime: parseInt(timeMatch[1]),
                    endTime: parseInt(timeMatch[2]),
                    duration: parseInt(timeMatch[2]) - parseInt(timeMatch[1]),
                    text: '',
                    visual: ''
                };
            } else if (currentScene && line.trim()) {
                if (line.startsWith('Visual:')) {
                    currentScene.visual = line.replace('Visual:', '').trim();
                } else {
                    currentScene.text += line.trim() + ' ';
                }
            }
        }

        if (currentScene) {
            scenes.push(currentScene);
        }

        return scenes;
    }

    // Fallback video generation (สำหรับ demo)
    async generateVideoFallback(content) {
        console.log('📹 ใช้ระบบจำลองการสร้าง video (Demo Mode)');

        return {
            videoUrl: 'demo_video.mp4',
            status: 'simulated',
            message: 'ตั้งค่า Pictory API Key เพื่อสร้าง video จริง',
            duration: 45,
            resolution: '1080x1920'
        };
    }

    // =====================================
    // 3. THUMBNAIL GENERATION (Canva API)
    // =====================================

    async generateThumbnail(content) {
        if (!this.canvaKey) {
            console.warn('⚠️ ไม่มี Canva API Key - ใช้ระบบจำลอง');
            return await this.generateThumbnailFallback(content);
        }

        try {
            console.log('🖼️ กำลังสร้าง thumbnail...');

            // ใช้ Canva API สร้าง thumbnail
            const response = await fetch('https://api.canva.com/v1/designs', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.canvaKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    design_type: 'Social Media Post',
                    width: 1080,
                    height: 1920,
                    title: content.title,
                    elements: [
                        {
                            type: 'text',
                            content: content.title,
                            fontSize: 80,
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            position: { x: 100, y: 800 }
                        },
                        {
                            type: 'shape',
                            shape: 'rectangle',
                            color: '#6366f1',
                            opacity: 0.8,
                            position: { x: 0, y: 750 },
                            size: { width: 1080, height: 400 }
                        }
                    ]
                })
            });

            const result = await response.json();

            console.log('✅ สร้าง thumbnail สำเร็จ');
            return {
                thumbnailUrl: result.export_url,
                designId: result.id
            };

        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return await this.generateThumbnailFallback(content);
        }
    }

    // Fallback thumbnail (ใช้ Canvas)
    async generateThumbnailFallback(content) {
        console.log('🎨 สร้าง thumbnail ด้วย Canvas (Fallback)');

        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);

        // Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 70px Arial';
        ctx.textAlign = 'center';

        // Word wrap title
        const words = content.title.split(' ');
        let line = '';
        let y = 900;

        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > 900 && line !== '') {
                ctx.fillText(line, 540, y);
                line = word + ' ';
                y += 80;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 540, y);

        // Convert to blob
        const thumbnailBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });

        const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

        return {
            thumbnailUrl,
            thumbnailBlob,
            fallback: true
        };
    }

    // =====================================
    // 4. CREATE COMPLETE VIDEO PACKAGE
    // =====================================

    async createCompleteVideo(content) {
        console.log(`🎬 เริ่มสร้าง video สำหรับ: "${content.title}"`);

        try {
            // 1. Generate voiceover
            const voice = await this.generateVoiceover(content.script);
            console.log(`✅ เสียง: ${voice.duration}s`);

            // 2. Generate video
            const video = await this.generateVideo(content);
            console.log('✅ Video สร้างเสร็จ');

            // 3. Generate thumbnail
            const thumbnail = await this.generateThumbnail(content);
            console.log('✅ Thumbnail สร้างเสร็จ');

            // 4. Update content with video info
            const videoPackage = {
                contentId: content.id,
                videoUrl: video.videoUrl,
                thumbnailUrl: thumbnail.thumbnailUrl,
                voiceUrl: voice.audioUrl,
                duration: voice.duration,
                createdAt: new Date().toISOString(),
                status: 'ready_to_post' // พร้อมโพสต์
            };

            // บันทึกลง localStorage
            this.saveVideoPackage(content.id, videoPackage);

            console.log('🎉 สร้าง video package สำเร็จ!');
            return videoPackage;

        } catch (error) {
            console.error('Error creating video package:', error);
            throw error;
        }
    }

    // บันทึก video package
    saveVideoPackage(contentId, videoPackage) {
        const packages = JSON.parse(localStorage.getItem('video_packages') || '{}');
        packages[contentId] = videoPackage;
        localStorage.setItem('video_packages', JSON.stringify(packages));
    }

    // ดึง video package
    getVideoPackage(contentId) {
        const packages = JSON.parse(localStorage.getItem('video_packages') || '{}');
        return packages[contentId] || null;
    }

    // =====================================
    // 5. BATCH PROCESSING
    // =====================================

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const content = this.queue.shift();

            try {
                await this.createCompleteVideo(content);

                // อัพเดทสถานะ content
                if (typeof updateContentStatus === 'function') {
                    updateContentStatus(content.id, 'ready_to_post');
                }

                // รอ 30 วินาทีระหว่าง video เพื่อไม่ให้โดน rate limit
                if (this.queue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 30000));
                }

            } catch (error) {
                console.error(`Error processing ${content.title}:`, error);
            }
        }

        this.isProcessing = false;
    }

    // เพิ่มใน queue
    addToQueue(content) {
        this.queue.push(content);
        console.log(`➕ เพิ่ม "${content.title}" ใน queue (${this.queue.length} รายการ)`);

        // เริ่มประมวลผลทันทีถ้ายังไม่ได้ทำ
        this.processQueue();
    }

    // เพิ่มหลายรายการ
    addBatchToQueue(contents) {
        this.queue.push(...contents);
        console.log(`➕ เพิ่ม ${contents.length} รายการใน queue`);
        this.processQueue();
    }

    // ดูสถานะ
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.queue.length,
            hasApiKeys: {
                elevenlabs: !!this.elevenlabsKey,
                pictory: !!this.pictoryKey,
                canva: !!this.canvaKey
            }
        };
    }
}

// สร้าง instance
const aiVideoCreator = new AIVideoCreator();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIVideoCreator;
}
