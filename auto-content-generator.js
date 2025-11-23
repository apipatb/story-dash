// Auto Content Generator - AI สร้าง content ideas และ scripts อัตโนมัติ
// ใช้ OpenAI GPT-4 สร้าง 5 videos ต่อวัน

class AutoContentGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.dailyQuota = 5; // 5 videos per day
        this.generatedToday = 0;
        this.isRunning = false;
    }

    // ตั้งค่า API Key
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
    }

    // ตรวจสอบว่าถึง quota หรือยัง
    checkQuota() {
        const today = new Date().toDateString();
        const lastRun = localStorage.getItem('auto_gen_last_run');

        if (lastRun !== today) {
            this.generatedToday = 0;
            localStorage.setItem('auto_gen_last_run', today);
            localStorage.setItem('auto_gen_count', '0');
        } else {
            this.generatedToday = parseInt(localStorage.getItem('auto_gen_count') || '0');
        }

        return this.generatedToday < this.dailyQuota;
    }

    // สร้าง trending topics
    async generateTrendingTopics() {
        const topics = [
            'ความเชื่อไทย',
            'งมงาย',
            'พิธีกรรม',
            'เรื่องลี้ลับ',
            'สิ่งศักดิ์สิทธิ์',
            'ของขลัง',
            'โชคลาง',
            'ฮวงจุ้ย',
            'ดวงชะตา',
            'เลขเด็ด'
        ];

        const angles = [
            'จริงหรือไม่? วิทยาศาสตร์ตอบ',
            'ความจริงที่น่าตกใจ',
            'ทำไมคนโบราณถึงเชื่อ?',
            'เหตุผลทางวิทยาศาสตร์',
            'ข้อเท็จจริงที่คุณไม่รู้',
            'ผลวิจัยล่าสุดเปิดเผย',
            'ความลับที่ซ่อนอยู่'
        ];

        const structures = [
            'ทำไม{topic}? {angle}',
            '{topic} {angle}',
            'คุณรู้หรือไม่? {topic} {angle}',
            'เปิดความลับ: {topic} {angle}',
            '{topic} ที่คุณต้องรู้ {angle}'
        ];

        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        const randomStructure = structures[Math.floor(Math.random() * structures.length)];

        return randomStructure
            .replace('{topic}', randomTopic)
            .replace('{angle}', randomAngle);
    }

    // สร้าง content idea ด้วย AI
    async generateContentIdea() {
        if (!this.apiKey) {
            throw new Error('กรุณาตั้งค่า OpenAI API Key ก่อน');
        }

        const topic = await this.generateTrendingTopics();

        // ใช้ OpenAI API
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // ใช้ mini version ประหยัดกว่า
                    messages: [
                        {
                            role: 'system',
                            content: 'คุณคือผู้เชี่ยวชาญด้านการสร้าง content สำหรับ TikTok, YouTube Shorts และ Facebook Reels เกี่ยวกับความเชื่อไทยผสมวิทยาศาสตร์'
                        },
                        {
                            role: 'user',
                            content: `สร้างไอเดีย content เกี่ยวกับ "${topic}" โดยมีโครงสร้าง:

1. ชื่อเรื่องที่ดึงดูดสนใจ (ไม่เกิน 60 ตัวอักษร)
2. Hook (ประโยคแรก 3-5 วินาที ที่ดึงดูดให้หยุดดู)
3. เนื้อหาหลัก (อธิบายความเชื่อ + คำอธิบายทางวิทยาศาสตร์)
4. CTA (Call to Action ท้ายคลิป)
5. Hashtags (5-10 hashtags)

ให้เป็น JSON format:
{
  "title": "...",
  "hook": "...",
  "content": "...",
  "cta": "...",
  "hashtags": ["..."],
  "category": "ความเชื่อ/งมงาย",
  "platform_tips": {
    "tiktok": "...",
    "youtube": "...",
    "facebook": "..."
  }
}`
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = JSON.parse(data.choices[0].message.content);

            return content;

        } catch (error) {
            console.error('Error generating content:', error);
            // Fallback: ใช้ template ถ้า API ล้มเหลว
            return this.generateFallbackContent(topic);
        }
    }

    // Fallback content ถ้า API ไม่ทำงาน
    generateFallbackContent(topic) {
        return {
            title: topic,
            hook: `คุณเคยสงสัยไหมว่า "${topic}"?`,
            content: `มาดูกันว่าความเชื่อเรื่อง "${topic}" นั้นมีที่มาอย่างไร และวิทยาศาสตร์อธิบายอย่างไร`,
            cta: 'ถ้าชอบกด ❤️ แล้วฟอลโลว์เพื่อดู content ดีๆ แบบนี้ต่อไป!',
            hashtags: ['#ความเชื่อไทย', '#วิทยาศาสตร์', '#ทำไม', '#คุณรู้หรือไม่'],
            category: 'ความเชื่อ/งมงาย',
            platform_tips: {
                tiktok: 'ใช้เสียงเพลงฮิต + transition สวยๆ',
                youtube: 'ใส่ timestamp และ chapters',
                facebook: 'เขียน caption ยาว + ถาม engaging questions'
            }
        };
    }

    // สร้าง full script พร้อม timing
    async generateFullScript(idea) {
        if (!this.apiKey) {
            throw new Error('กรุณาตั้งค่า OpenAI API Key ก่อน');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'คุณคือนักเขียน script มืออาชีพสำหรับ short-form video (15-60 วินาที)'
                        },
                        {
                            role: 'user',
                            content: `เขียน script เต็มรูปแบบสำหรับ video "${idea.title}"

Hook: ${idea.hook}
เนื้อหา: ${idea.content}
CTA: ${idea.cta}

ให้เป็น format:

[0-5 วินาที] Hook:
(บรรยายพร้อมลูกเล่นที่ดึงดูด)

[5-15 วินาที] เนื้อหาส่วนที่ 1:
(อธิบายความเชื่อ)

[15-30 วินาที] เนื้อหาส่วนที่ 2:
(อธิบายวิทยาศาสตร์)

[30-40 วินาที] เนื้อหาส่วนที่ 3:
(สรุป + ข้อเท็จจริงน่าสนใจ)

[40-45 วินาที] CTA:
(เรียกดู action)

Visual Suggestions:
- ช่วง 0-5 วินาที: ...
- ช่วง 5-15 วินาที: ...
- ช่วง 15-30 วินาที: ...
- ช่วง 30-40 วินาที: ...
- ช่วง 40-45 วินาที: ...

Text Overlays:
- ...

Background Music Mood: ...`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error generating script:', error);
            return this.generateFallbackScript(idea);
        }
    }

    // Fallback script
    generateFallbackScript(idea) {
        return `[0-5 วินาที] Hook:
${idea.hook}

[5-30 วินาที] เนื้อหาหลัก:
${idea.content}

[30-35 วินาที] CTA:
${idea.cta}

Visual Suggestions:
- ใช้ภาพประกอบที่เกี่ยวข้อง
- ใส่ text overlays สำคัญ
- ใช้ transition นุ่มนวล

Background Music: เพลงไทยผสมสมัยใหม่`;
    }

    // สร้าง content อัตโนมัติ 1 ชิ้น
    async generateOne() {
        if (!this.checkQuota()) {
            throw new Error(`ถึง quota แล้ววันนี้ (${this.dailyQuota} videos/วัน)`);
        }

        console.log('🤖 กำลังสร้าง content อัตโนมัติ...');

        // 1. สร้าง idea
        const idea = await this.generateContentIdea();
        console.log('✅ สร้าง idea:', idea.title);

        // 2. สร้าง full script
        const script = await this.generateFullScript(idea);
        console.log('✅ สร้าง script เสร็จ');

        // 3. บันทึกลง contents array
        const newContent = {
            id: Date.now().toString(),
            title: idea.title,
            category: idea.category,
            platform: ['tiktok', 'youtube', 'facebook'],
            script: script,
            status: 'ready', // พร้อมสร้าง video
            hashtags: idea.hashtags.join(' '),
            createdAt: new Date().toISOString(),
            generatedBy: 'AI',
            platformTips: idea.platform_tips
        };

        // เพิ่มลงใน contents (global variable)
        if (typeof contents !== 'undefined') {
            contents.push(newContent);
            saveContents();
            renderContents();
        }

        // อัพเดท quota
        this.generatedToday++;
        localStorage.setItem('auto_gen_count', this.generatedToday.toString());

        console.log(`✅ สร้าง content สำเร็จ (${this.generatedToday}/${this.dailyQuota})`);

        return newContent;
    }

    // สร้างหลาย content อัตโนมัติ
    async generateBatch(count = 5) {
        const results = [];

        for (let i = 0; i < count; i++) {
            if (!this.checkQuota()) {
                console.log('⚠️ ถึง quota แล้ว');
                break;
            }

            try {
                const content = await this.generateOne();
                results.push(content);

                // รอ 2 วินาทีระหว่าง API calls เพื่อไม่ให้โดน rate limit
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`Error generating content ${i + 1}:`, error);
            }
        }

        return results;
    }

    // เริ่มระบบ Auto Generation (run ทุกวันเวลา 06:00)
    async startAutoMode() {
        if (this.isRunning) {
            console.log('⚠️ Auto mode กำลังทำงานอยู่แล้ว');
            return;
        }

        this.isRunning = true;
        console.log('🚀 เริ่ม Auto Content Generation Mode');

        // ทำงานทันที
        await this.generateBatch(this.dailyQuota);

        // ตั้ง interval ทำงานทุกวันเวลา 06:00
        this.scheduleDaily();
    }

    // ตั้งเวลาทำงานอัตโนมัติ
    scheduleDaily() {
        const now = new Date();
        const target = new Date();
        target.setHours(6, 0, 0, 0); // 06:00 น.

        if (now > target) {
            // ถ้าเลย 06:00 แล้ว กำหนดเป็นพรุ่งนี้
            target.setDate(target.getDate() + 1);
        }

        const timeUntilTarget = target - now;

        console.log(`⏰ ตั้งเวลา Auto Generate ถัดไปที่: ${target.toLocaleString('th-TH')}`);

        setTimeout(async () => {
            console.log('🌅 ถึงเวลา Auto Generate!');
            await this.generateBatch(this.dailyQuota);

            // ตั้งรอบถัดไปอีก 24 ชั่วโมง
            setInterval(async () => {
                await this.generateBatch(this.dailyQuota);
            }, 24 * 60 * 60 * 1000);
        }, timeUntilTarget);
    }

    // หยุด Auto Mode
    stopAutoMode() {
        this.isRunning = false;
        console.log('⏸️ หยุด Auto Content Generation Mode');
    }

    // ดูสถานะ
    getStatus() {
        return {
            isRunning: this.isRunning,
            hasApiKey: !!this.apiKey,
            generatedToday: this.generatedToday,
            dailyQuota: this.dailyQuota,
            remaining: this.dailyQuota - this.generatedToday
        };
    }
}

// สร้าง instance
const autoContentGenerator = new AutoContentGenerator();

// Export สำหรับใช้ในหน้าอื่น
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoContentGenerator;
}
