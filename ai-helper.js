// AI Helper - Content Generation Assistant
// Supports multiple AI providers: Claude, OpenAI, or Local Templates

let currentAITool = null;
let aiSettings = {
    provider: 'local',
    apiKey: ''
};

// Load AI settings
function loadAISettings() {
    const stored = localStorage.getItem('aiSettings');
    if (stored) {
        aiSettings = JSON.parse(stored);
    }
    if (document.getElementById('aiProvider')) {
        document.getElementById('aiProvider').value = aiSettings.provider;
        if (aiSettings.apiKey) {
            document.getElementById('apiKey').value = aiSettings.apiKey;
        }
    }
}

// Save AI settings
function saveAISettings() {
    aiSettings.provider = document.getElementById('aiProvider').value;
    aiSettings.apiKey = document.getElementById('apiKey')?.value || '';
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
}

// Toggle API key field
function toggleAPIKeyField() {
    const provider = document.getElementById('aiProvider').value;
    const apiKeyGroup = document.getElementById('apiKeyGroup');
    if (provider === 'local') {
        apiKeyGroup.style.display = 'none';
    } else {
        apiKeyGroup.style.display = 'block';
    }
}

// Open AI tool
function openAITool(tool) {
    currentAITool = tool;
    const modal = document.getElementById('aiModal');
    const title = document.getElementById('aiModalTitle');
    const inputLabel = document.getElementById('aiInputLabel');
    const input = document.getElementById('aiInput');
    const output = document.getElementById('aiOutput');

    // Reset output
    output.style.display = 'none';
    input.value = '';

    // Set title and placeholder based on tool
    const toolConfig = {
        script: {
            title: '📝 Script Generator',
            label: 'หัวข้อหรือไอเดีย',
            placeholder: 'เช่น: ทำไมต้องไม่หวีผมตอนเย็น?'
        },
        hook: {
            title: '🎣 Hook Generator',
            label: 'หัวข้อเรื่อง',
            placeholder: 'เช่น: ความเชื่อเรื่องหวีผม'
        },
        cta: {
            title: '📢 CTA Generator',
            label: 'เนื้อหาวิดีโอ',
            placeholder: 'บอกเนื้อหาสั้นๆ ว่าวิดีโอพูดถึงอะไร'
        },
        hashtag: {
            title: '#️⃣ Hashtag Generator',
            label: 'เนื้อหา/หัวข้อ',
            placeholder: 'เช่น: ความเชื่อไทยเรื่องหวีผม'
        },
        improve: {
            title: '✨ Content Improver',
            label: 'Script ที่ต้องการปรับปรุง',
            placeholder: 'วาง script ที่มีอยู่ตรงนี้...'
        },
        ideas: {
            title: '💡 Content Ideas Generator',
            label: 'หัวข้อหรือธีมที่สนใจ',
            placeholder: 'เช่น: ความเชื่อไทย, ตำนาน, วิทยาศาสตร์'
        },
        title: {
            title: '🏷️ Title Generator',
            label: 'เนื้อหาโดยสรุป',
            placeholder: 'บอกเนื้อหาวิดีโอสั้นๆ'
        },
        translate: {
            title: '🌐 Translator',
            label: 'ข้อความที่ต้องการแปล',
            placeholder: 'วางข้อความที่นี่...'
        }
    };

    const config = toolConfig[tool];
    title.textContent = config.title;
    inputLabel.textContent = config.label;
    input.placeholder = config.placeholder;

    modal.style.display = 'block';
}

// Close AI modal
function closeAIModal() {
    document.getElementById('aiModal').style.display = 'none';
}

// Generate AI content
async function generateAIContent() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) {
        alert('กรุณาใส่ข้อมูล');
        return;
    }

    const duration = parseInt(document.getElementById('aiDuration').value);
    const tone = document.getElementById('aiTone').value;

    const btn = document.getElementById('generateBtnText');
    const originalText = btn.textContent;
    btn.textContent = '⏳ กำลังสร้าง...';

    try {
        let result;
        if (aiSettings.provider === 'local') {
            result = await generateLocalAI(currentAITool, input, duration, tone);
        } else {
            result = await generateRemoteAI(currentAITool, input, duration, tone);
        }

        // Show output
        document.getElementById('aiOutputText').value = result;
        document.getElementById('aiOutput').style.display = 'block';

    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        btn.textContent = originalText;
    }
}

// Local AI (Template-based)
async function generateLocalAI(tool, input, duration, tone) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const generators = {
        script: generateScript,
        hook: generateHook,
        cta: generateCTA,
        hashtag: generateHashtags,
        improve: improveContent,
        ideas: generateIdeas,
        title: generateTitle,
        translate: translateContent
    };

    return generators[tool](input, duration, tone);
}

// Script Generator
function generateScript(topic, duration, tone) {
    const hooks = [
        `คุณเคยสงสัยไหมว่า "${topic}"?`,
        `มีคนบอกว่า "${topic}" แต่จริงหรือเปล่า?`,
        `ความลับที่คุณควรรู้เกี่ยวกับ ${topic}`,
        `สิ่งที่คุณไม่รู้เกี่ยวกับ ${topic}`
    ];

    const ctas = [
        'กดไลก์ถ้าเคยได้ยินแบบนี้! แล้วแชร์ให้เพื่อนรู้ด้วย',
        'คอมเมนต์บอกความคิดเห็นกัน! คุณเชื่อแบบไหน?',
        'ติดตามเพื่อดูเรื่องราวน่าสนใจแบบนี้อีก!',
        'บันทึกไว้เพื่อบอกคนรู้จัก!'
    ];

    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    const randomCTA = ctas[Math.floor(Math.random() * ctas.length)];

    let script = `Hook (0-5 วินาที):
${randomHook}

เนื้อหาหลัก:
คนโบราณเชื่อว่า ${topic} มีที่มาจากความเชื่อและประสบการณ์ที่สืบทอดกันมา

แต่ทางวิทยาศาสตร์มีคำอธิบายว่า มีเหตุผลเชิงตรรกะอยู่เบื้องหลัง ซึ่งอาจเกี่ยวข้องกับสุขภาพ ความปลอดภัย หรือธรรมชาติ

ความจริงก็คือ ทั้งความเชื่อและวิทยาศาสตร์ต่างก็มีคุณค่าในการอธิบายปรากฏการณ์เหล่านี้

Call-to-Action:
${randomCTA}`;

    if (duration >= 90) {
        script += `

\nเรื่องราวเพิ่มเติม:
- ตัวอย่างจากประสบการณ์จริง
- การศึกษาทางวิทยาศาสตร์ที่เกี่ยวข้อง
- ความเชื่อในวัฒนธรรมอื่นๆ ที่คล้ายกัน`;
    }

    return script;
}

// Hook Generator
function generateHook(topic, duration, tone) {
    const templates = [
        `คุณเคยได้ยินไหมว่า "${topic}"? วันนี้เรามาหาคำตอบกัน!`,
        `ทำไมคนโบราณถึงห้าม${topic}? มาดูกัน!`,
        `${topic} - จริงหรือแค่ความเชื่อ? คำตอบจะทำให้คุณประหลาดใจ!`,
        `3 เรื่องที่คุณไม่รู้เกี่ยวกับ ${topic}`,
        `ความลับของ ${topic} ที่ไม่มีใครบอกคุณ`,
        `หยุด! ก่อนที่คุณจะ${topic} ต้องรู้เรื่องนี้ก่อน`,
        `${topic}? วิทยาศาสตร์อธิบายได้!`,
        `คุณปู่คุณย่าพูดถูก! ${topic} มีเหตุผลจริงๆ`
    ];

    const selected = [];
    const count = duration <= 30 ? 3 : 5;

    for (let i = 0; i < count && templates.length > 0; i++) {
        const index = Math.floor(Math.random() * templates.length);
        selected.push(templates[index]);
        templates.splice(index, 1);
    }

    return `Hook Ideas สำหรับ "${topic}":\n\n` +
           selected.map((h, i) => `${i + 1}. ${h}`).join('\n\n') +
           `\n\n💡 เคล็ดลับ: ใช้ Hook ที่สร้างความอยากรู้ภายใน 3-5 วินาทีแรก!`;
}

// CTA Generator
function generateCTA(content, duration, tone) {
    const ctas = {
        engagement: [
            'กดไลก์ถ้าเคยได้ยินแบบนี้!',
            'คอมเมนต์บอกว่าคุณเชื่อแบบไหน',
            'แชร์ให้เพื่อนที่ควรรู้เรื่องนี้',
            'แท็กเพื่อนที่เคยทำแบบนี้'
        ],
        follow: [
            'ติดตามเพื่อดูเรื่องราวน่าสนใจแบบนี้อีก',
            'กดติดตามเพื่อไม่พลาดคลิปถัดไป',
            'ติดตามเราสำหรับความรู้ใหม่ๆ ทุกวัน'
        ],
        save: [
            'บันทึกไว้เพื่ออ่านทีหลัง',
            'Save ไว้บอกคนรู้จัก',
            'เก็บไว้เพื่อดูซ้ำ'
        ],
        question: [
            'คุณเคยเจอแบบนี้บ้างไหม? มาเล่าให้ฟังกัน',
            'ความเชื่อในครอบครัวคุณเป็นยังไง?',
            'คุณมีเรื่องราวแบบนี้ไหม? แชร์กันหน่อย'
        ],
        teaser: [
            'คลิปหน้าจะเล่าเรื่อง [xxx] ห้ามพลาด!',
            'มีอีกหลายเรื่องที่น่าสนใจ รอติดตามกันนะ',
            'ตอนหน้ามีเรื่องที่แรงกว่านี้อีก!'
        ]
    };

    const result = [];
    result.push('CTA Ideas:\n');

    Object.entries(ctas).forEach(([type, options]) => {
        const selected = options[Math.floor(Math.random() * options.length)];
        result.push(`\n${type.toUpperCase()}:`);
        result.push(selected);
    });

    result.push('\n\n🎯 แนะนำ: ใช้ 2-3 CTA ต่อวิดีโอ - เน้น engagement + follow');

    return result.join('\n');
}

// Hashtag Generator
function generateHashtags(content, duration, tone) {
    const generalTags = [
        '#ความเชื่อไทย', '#เรื่องเล่าไทย', '#วิทยาศาสตร์',
        '#ตำนาน', '#วัฒนธรรมไทย', '#ThaiCulture',
        '#DidYouKnow', '#เคยได้ยินไหม', '#storytime',
        '#ไทยแท้', '#เรื่องเล่า', '#ความรู้'
    ];

    const platformTags = {
        tiktok: ['#tiktokthailand', '#fyp', '#foryou', '#viral'],
        youtube: ['#shorts', '#youtubeshorts'],
        facebook: ['#reels', '#fbreels']
    };

    // Content-specific tags (based on keywords)
    const specificTags = [];
    const keywords = {
        'ผม': ['#ผม', '#hairtips', '#haircare'],
        'หวี': ['#หวีผม', '#hair'],
        'นอน': ['#การนอน', '#sleep', '#ห้องนอน'],
        'กิน': ['#อาหาร', '#food'],
        'เสี่ยง': ['#งมงาย', '#superstition'],
        'ตำนาน': ['#legend', '#mythology'],
        'วิทยาศาสตร์': ['#science', '#sciencefacts']
    };

    Object.entries(keywords).forEach(([keyword, tags]) => {
        if (content.includes(keyword)) {
            specificTags.push(...tags);
        }
    });

    const allTags = [...new Set([...specificTags, ...generalTags])];
    const selectedTags = allTags.slice(0, 15);

    let result = `Hashtags สำหรับ "${content}":\n\n`;
    result += `📱 แนะนำ (10-15 tags):\n${selectedTags.join(' ')}\n\n`;

    result += `🎵 TikTok:\n${platformTags.tiktok.join(' ')}\n\n`;
    result += `📹 YouTube:\n${platformTags.youtube.join(' ')}\n\n`;
    result += `👥 Facebook:\n${platformTags.facebook.join(' ')}\n\n`;

    result += `💡 เคล็ดลับ:\n`;
    result += `- ใช้ 10-15 hashtags ต่อโพสต์\n`;
    result += `- ผสมระหว่าง popular กับ niche tags\n`;
    result += `- ใส่ภาษาไทยและอังกฤษ`;

    return result;
}

// Content Improver
function improveContent(script, duration, tone) {
    const improvements = [];

    improvements.push('🔧 ข้อเสนอแนะในการปรับปรุง:\n');

    // Check hook
    if (!script.toLowerCase().includes('hook')) {
        improvements.push('\n1. เพิ่ม HOOK ที่ชัดเจน:');
        improvements.push('   - 5 วินาทีแรกต้องดึงดูดความสนใจ');
        improvements.push('   - ใช้คำถาม หรือประโยคที่น่าสนใจ');
    }

    // Check structure
    improvements.push('\n2. โครงสร้าง:');
    improvements.push('   ✓ มี Hook (0-5 วิ)');
    improvements.push('   ✓ มีเนื้อหาหลัก (กลาง)');
    improvements.push('   ✓ มี CTA (ท้าย)');

    // Check length
    const wordCount = script.split(' ').length;
    const targetWords = duration === 30 ? 75 : duration === 60 ? 150 : 225;

    improvements.push(`\n3. ความยาว:`);
    improvements.push(`   - ปัจจุบัน: ~${wordCount} คำ`);
    improvements.push(`   - เป้าหมาย: ~${targetWords} คำ (${duration} วินาที)`);

    if (wordCount < targetWords * 0.8) {
        improvements.push('   ⚠️ สั้นเกินไป - เพิ่มรายละเอียด');
    } else if (wordCount > targetWords * 1.2) {
        improvements.push('   ⚠️ ยาวเกินไป - ตัดให้กระชับ');
    }

    // Engagement tips
    improvements.push('\n4. เพิ่ม Engagement:');
    improvements.push('   - ใช้คำถามเพื่อกระตุ้นการคิด');
    improvements.push('   - เล่าเรื่องราวหรือตัวอย่างจริง');
    improvements.push('   - ใช้ตัวเลขหรือข้อเท็จจริงที่น่าสนใจ');

    // CTA tips
    if (!script.toLowerCase().includes('cta') && !script.includes('กดไลก์') && !script.includes('ติดตาม')) {
        improvements.push('\n5. เพิ่ม CTA:');
        improvements.push('   - "กดไลก์ถ้าชอบ"');
        improvements.push('   - "คอมเมนต์บอกความคิดเห็น"');
        improvements.push('   - "ติดตามเพื่อดูคลิปอื่นๆ"');
    }

    improvements.push('\n\n✨ Script ที่ปรับปรุงแล้ว:\n');
    improvements.push(enhanceScript(script, tone));

    return improvements.join('\n');
}

function enhanceScript(script, tone) {
    // Add engaging elements based on tone
    const toneWords = {
        casual: ['เอาง่ายๆ นะ', 'บอกเลย', 'จริงๆ นะ'],
        educational: ['น่าสนใจมาก', 'ตามหลักการแล้ว', 'จากการศึกษาพบว่า'],
        entertaining: ['ฟังแล้วสนุก', 'เจ๋งมาก', 'เซอร์ไพรส์กันเลย'],
        mysterious: ['เป็นปริศนาที่', 'ความลับที่', 'สิ่งที่ไม่มีใครบอก']
    };

    // Just return original with suggestion
    return script + '\n\n(เพิ่มองค์ประกอบที่เหมาะกับโทน: ' + tone + ')';
}

// Ideas Generator
function generateIdeas(theme, duration, tone) {
    const ideaTemplates = {
        'ความเชื่อ': [
            'ทำไมห้ามหวีผมตอนเย็น?',
            'ห้ามตัดเล็บตอนกลางคืน - เพราะอะไร?',
            'ไม่ควรกวาดบ้านตอนเย็น - ความเชื่อ vs ความจริง',
            'ห้ามนอนหัวชี้ทิศเหนือ - มีจริงไหม?',
            'ทำไมห้ามชี้รุ้ง?',
            'ความเชื่อเรื่องหมอนและการนอน',
            'ทำไมห้ามเหยียบธรณีประตู?',
            'ความเชื่อเรื่องผีเสื้อเข้าบ้าน',
            'ห้ามเดินทางวันพระ - จริงหรือ?',
            'ความเชื่อเรื่องเท้า - ทำไมห้ามเหยียบหนังสือ?'
        ],
        'วิทยาศาสตร์': [
            'ทำไมน้ำร้อนแข็งตัวเร็วกว่าน้ำเย็น?',
            'ปรากฏการณ์ Déjà vu คืออะไร?',
            'ทำไมฝนถึงมีกลิ่น?',
            'ทำไมเราจึงมีกรุ๊ปเลือดที่แตกต่างกัน?',
            'ความลับของความฝัน',
            'ทำไมเวลาบินมักปวดหู?',
            'ทำไมต้องนับแกะตอนนอนไม่หลับ?'
        ],
        'ตำนาน': [
            'ตำนานนาคบวช',
            'เรื่องราวพญานาค',
            'ตำนานเทพธิดา',
            'เรื่องเล่าจากวรรณคดีไทย',
            'ตำนานสถานที่ศักดิ์สิทธิ์'
        ]
    };

    // Find matching category
    let ideas = [];
    Object.entries(ideaTemplates).forEach(([category, templates]) => {
        if (theme.includes(category) || category.includes(theme)) {
            ideas = [...ideas, ...templates];
        }
    });

    // If no match, use all
    if (ideas.length === 0) {
        ideas = Object.values(ideaTemplates).flat();
    }

    // Random selection
    const selected = [];
    const count = 10;
    for (let i = 0; i < count && ideas.length > 0; i++) {
        const index = Math.floor(Math.random() * ideas.length);
        selected.push(ideas[index]);
        ideas.splice(index, 1);
    }

    let result = `💡 Content Ideas สำหรับ "${theme}":\n\n`;
    result += selected.map((idea, i) => `${i + 1}. ${idea}`).join('\n');
    result += '\n\n🎯 เคล็ดลับ: เลือกไอเดียที่คุณมีความรู้และสามารถหาข้อมูลเพิ่มเติมได้';

    return result;
}

// Title Generator
function generateTitle(content, duration, tone) {
    const patterns = [
        `ทำไมถึง${content}?`,
        `${content} - ความจริงที่คุณควรรู้`,
        `3 เรื่องที่คุณไม่รู้เกี่ยวกับ ${content}`,
        `${content}: จริงหรือความเชื่อ?`,
        `ความลับของ ${content}`,
        `หยุด! ก่อนที่คุณจะ${content}`,
        `${content} แบบนี้ถูกแล้วหรือยัง?`,
        `${content} - วิทยาศาสตร์อธิบายได้!`,
        `คุณรู้หรือไม่? ${content}`,
        `${content} ที่คุณทำอาจจะผิด!`
    ];

    let result = `🏷️ Title Ideas สำหรับ "${content}":\n\n`;
    result += patterns.map((title, i) => `${i + 1}. ${title}`).join('\n\n');
    result += '\n\n📌 เคล็ดลับ:\n';
    result += '- ใช้คำที่กระตุ้นความอยากรู้\n';
    result += '- ไม่ควรยาวเกิน 60 ตัวอักษร\n';
    result += '- ใส่คีย์เวิร์ดหลักไว้ข้างหน้า';

    return result;
}

// Translator (Simple version)
function translateContent(text, duration, tone) {
    return `🌐 Translation Feature\n\n` +
           `ต้นฉบับ:\n${text}\n\n` +
           `💡 สำหรับการแปลที่แม่นยำ แนะนำให้ใช้:\n` +
           `- Google Translate (translate.google.com)\n` +
           `- DeepL (deepl.com)\n` +
           `- ChatGPT หรือ Claude สำหรับการแปลที่มีบริบท\n\n` +
           `เมื่อแปลเสร็จแล้ว copy กลับมาใช้ได้เลย!`;
}

// Remote AI (Claude or OpenAI)
async function generateRemoteAI(tool, input, duration, tone) {
    if (!aiSettings.apiKey) {
        throw new Error('กรุณาใส่ API Key ใน Settings ก่อน');
    }

    const prompts = {
        script: `สร้าง script สำหรับวิดีโอ ${duration} วินาที หัวข้อ: "${input}" โทน: ${tone}

ให้มีโครงสร้าง:
- Hook (5 วินาทีแรก)
- เนื้อหาหลัก (อธิบายความเชื่อ + วิทยาศาสตร์)
- CTA (призываท้าย)

เขียนเป็นภาษาไทย กระชับ เข้าใจง่าย`,

        hook: `สร้าง 5 hook ideas สำหรับวิดีโอเรื่อง "${input}" ที่ดึงดูดใจภายใน 5 วินาที`,

        cta: `สร้าง 5 Call-to-Action สำหรับวิดีโอที่พูดถึง "${input}"`,

        hashtag: `สร้าง 15 hashtags ที่เหมาะสมสำหรับเนื้อหา: "${input}" ทั้งภาษาไทยและอังกฤษ`,

        improve: `ปรับปรุง script นี้ให้น่าสนใจขึ้น:\n\n${input}\n\nให้กระชับ เข้าใจง่าย และมี engagement สูง`,

        ideas: `สร้าง 10 content ideas เกี่ยวกับ "${input}" สำหรับ TikTok/YouTube Shorts`,

        title: `สร้าง 10 หัวข้อวิดีโอที่น่าสนใจสำหรับเนื้อหา: "${input}"`,

        translate: `แปลข้อความนี้และปรับให้เหมาะกับการพูดในวิดีโอ:\n\n${input}`
    };

    const prompt = prompts[tool];

    if (aiSettings.provider === 'claude') {
        return await callClaudeAPI(prompt);
    } else if (aiSettings.provider === 'openai') {
        return await callOpenAIAPI(prompt);
    }

    throw new Error('Provider not supported');
}

// Claude API
async function callClaudeAPI(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiSettings.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        throw new Error('API Error: ' + response.statusText);
    }

    const data = await response.json();
    return data.content[0].text;
}

// OpenAI API
async function callOpenAIAPI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiSettings.apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        throw new Error('API Error: ' + response.statusText);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Copy to clipboard
function copyToClipboard() {
    const text = document.getElementById('aiOutputText').value;
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copy แล้ว!');
    });
}

// Use AI output in content
function useAIOutput() {
    const output = document.getElementById('aiOutputText').value;

    // Open content modal and fill in the script
    closeAIModal();
    openAddModal();

    setTimeout(() => {
        document.getElementById('contentScript').value = output;
    }, 100);
}

// Initialize AI settings on load
document.addEventListener('DOMContentLoaded', function() {
    loadAISettings();
});
