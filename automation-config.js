// Automation Configuration - จัดการ API Keys และการตั้งค่าทั้งหมด

class AutomationConfig {
    constructor() {
        this.keys = this.loadKeys();
        this.settings = this.loadSettings();
    }

    // ===========================================
    // API KEYS MANAGEMENT
    // ===========================================

    loadKeys() {
        return {
            openai: localStorage.getItem('openai_api_key') || '',
            elevenlabs: localStorage.getItem('elevenlabs_api_key') || '',
            pictory: localStorage.getItem('pictory_api_key') || '',
            canva: localStorage.getItem('canva_api_key') || '',
            youtube: {
                clientId: localStorage.getItem('youtube_client_id') || '',
                clientSecret: localStorage.getItem('youtube_client_secret') || '',
                accessToken: localStorage.getItem('youtube_access_token') || ''
            },
            facebook: {
                appId: localStorage.getItem('facebook_app_id') || '',
                appSecret: localStorage.getItem('facebook_app_secret') || '',
                accessToken: localStorage.getItem('facebook_access_token') || '',
                pageId: localStorage.getItem('facebook_page_id') || ''
            }
        };
    }

    saveKeys() {
        localStorage.setItem('openai_api_key', this.keys.openai);
        localStorage.setItem('elevenlabs_api_key', this.keys.elevenlabs);
        localStorage.setItem('pictory_api_key', this.keys.pictory);
        localStorage.setItem('canva_api_key', this.keys.canva);

        localStorage.setItem('youtube_client_id', this.keys.youtube.clientId);
        localStorage.setItem('youtube_client_secret', this.keys.youtube.clientSecret);
        localStorage.setItem('youtube_access_token', this.keys.youtube.accessToken);

        localStorage.setItem('facebook_app_id', this.keys.facebook.appId);
        localStorage.setItem('facebook_app_secret', this.keys.facebook.appSecret);
        localStorage.setItem('facebook_access_token', this.keys.facebook.accessToken);
        localStorage.setItem('facebook_page_id', this.keys.facebook.pageId);
    }

    setApiKey(service, key) {
        if (service === 'youtube' || service === 'facebook') {
            this.keys[service] = { ...this.keys[service], ...key };
        } else {
            this.keys[service] = key;
        }

        this.saveKeys();

        // อัพเดทใน components
        this.updateComponents();
    }

    updateComponents() {
        // อัพเดท API keys ใน components ต่างๆ
        if (typeof autoContentGenerator !== 'undefined') {
            autoContentGenerator.setApiKey(this.keys.openai);
        }

        if (typeof aiVideoCreator !== 'undefined') {
            aiVideoCreator.setApiKeys({
                elevenlabs: this.keys.elevenlabs,
                pictory: this.keys.pictory,
                canva: this.keys.canva
            });
        }
    }

    // ===========================================
    // SETTINGS MANAGEMENT
    // ===========================================

    loadSettings() {
        const defaultSettings = {
            automation: {
                enabled: false,
                videosPerDay: 5,
                autoGenerate: true,
                autoCreateVideo: true,
                autoPost: true,
                platforms: ['youtube', 'facebook', 'tiktok']
            },
            posting: {
                times: ['18:00', '20:00'],
                useOptimalTime: true,
                retryOnFail: true,
                maxRetries: 3
            },
            video: {
                resolution: '1080x1920', // 9:16 for Shorts/TikTok
                fps: 30,
                quality: 'high',
                addSubtitles: true,
                addWatermark: false
            },
            content: {
                categories: ['ความเชื่อ/งมงาย', 'วิทยาศาสตร์'],
                language: 'th',
                tone: 'informative',
                length: '30-60', // seconds
                includeHashtags: true
            },
            budget: {
                monthly: 100, // USD
                perVideo: null, // auto calculate
                alerts: {
                    80: true, // alert at 80%
                    100: true
                }
            }
        };

        const saved = localStorage.getItem('automation_settings');
        return saved ? this.mergeDeep(defaultSettings, JSON.parse(saved)) : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('automation_settings', JSON.stringify(this.settings));
    }

    updateSettings(newSettings) {
        this.settings = this.mergeDeep(this.settings, newSettings);
        this.saveSettings();

        // อัพเดท automation scheduler
        if (typeof automationScheduler !== 'undefined') {
            automationScheduler.updateConfig(this.settings.automation);
        }
    }

    // ===========================================
    // VALIDATION & STATUS
    // ===========================================

    validateKeys() {
        const validation = {
            openai: !!this.keys.openai,
            elevenlabs: !!this.keys.elevenlabs,
            pictory: !!this.keys.pictory,
            canva: !!this.keys.canva,
            youtube: !!(this.keys.youtube.clientId && this.keys.youtube.clientSecret),
            facebook: !!(this.keys.facebook.appId && this.keys.facebook.appSecret)
        };

        const requiredKeys = ['openai']; // Only OpenAI is absolutely required
        const optionalKeys = ['elevenlabs', 'pictory', 'canva', 'youtube', 'facebook'];

        const ready = requiredKeys.every(key => validation[key]);
        const complete = [...requiredKeys, ...optionalKeys].every(key => validation[key]);

        return {
            validation,
            ready, // พร้อมเริ่มต้น (มี OpenAI)
            complete, // ครบทุก API
            missing: Object.keys(validation).filter(key => !validation[key])
        };
    }

    getSetupStatus() {
        const keyStatus = this.validateKeys();

        return {
            step1_keys: {
                required: {
                    openai: !!this.keys.openai
                },
                optional: {
                    elevenlabs: !!this.keys.elevenlabs,
                    pictory: !!this.keys.pictory,
                    canva: !!this.keys.canva
                },
                platforms: {
                    youtube: !!(this.keys.youtube.clientId),
                    facebook: !!(this.keys.facebook.appId)
                }
            },
            step2_settings: {
                automation: this.settings.automation.enabled,
                videosPerDay: this.settings.automation.videosPerDay,
                platforms: this.settings.automation.platforms
            },
            step3_ready: keyStatus.ready,
            overall: keyStatus.ready ? 'ready' : 'setup_needed'
        };
    }

    // ===========================================
    // COST ESTIMATION
    // ===========================================

    estimateCosts(videosPerDay = 5) {
        const monthly = videosPerDay * 30;

        const costs = {
            openai: {
                perVideo: 0.15, // GPT-4o-mini
                monthly: monthly * 0.15
            },
            elevenlabs: {
                perVideo: 0.08, // ~2 min audio
                monthly: monthly * 0.08,
                plan: monthly * 0.08 < 25 ? 'Starter ($5)' : 'Creator ($25)'
            },
            pictory: {
                perVideo: 0.26, // ~$39/150 videos
                monthly: Math.min(39, Math.ceil(monthly / 150) * 39),
                plan: monthly <= 30 ? 'Standard ($23)' : 'Premium ($39)'
            },
            canva: {
                perVideo: 0,
                monthly: 0,
                plan: 'Free (or Pro $12.99)'
            },
            youtube: {
                perVideo: 0,
                monthly: 0,
                plan: 'Free'
            },
            facebook: {
                perVideo: 0,
                monthly: 0,
                plan: 'Free'
            }
        };

        const total = {
            perVideo: costs.openai.perVideo + costs.elevenlabs.perVideo + costs.pictory.perVideo,
            monthly: costs.openai.monthly + costs.elevenlabs.monthly + costs.pictory.monthly
        };

        const revenue = {
            estimated: monthly * 50000 * 0.002, // 50k views * $0.002 CPM average
            optimistic: monthly * 100000 * 0.004,
            conservative: monthly * 20000 * 0.001
        };

        const roi = {
            conservative: ((revenue.conservative - total.monthly) / total.monthly * 100).toFixed(0),
            estimated: ((revenue.estimated - total.monthly) / total.monthly * 100).toFixed(0),
            optimistic: ((revenue.optimistic - total.monthly) / total.monthly * 100).toFixed(0)
        };

        return {
            costs,
            total,
            revenue,
            roi,
            videosPerDay,
            videosPerMonth: monthly
        };
    }

    // ===========================================
    // UTILITIES
    // ===========================================

    mergeDeep(target, source) {
        const output = Object.assign({}, target);

        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // ===========================================
    // EXPORT / IMPORT CONFIG
    // ===========================================

    export() {
        return {
            keys: this.keys,
            settings: this.settings,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    import(data) {
        if (data.keys) {
            this.keys = data.keys;
            this.saveKeys();
        }

        if (data.settings) {
            this.settings = data.settings;
            this.saveSettings();
        }

        this.updateComponents();
    }

    reset() {
        if (confirm('⚠️ รีเซ็ตการตั้งค่าทั้งหมด? (API keys จะถูกลบ)')) {
            localStorage.removeItem('automation_settings');
            localStorage.removeItem('openai_api_key');
            localStorage.removeItem('elevenlabs_api_key');
            localStorage.removeItem('pictory_api_key');
            localStorage.removeItem('canva_api_key');
            localStorage.removeItem('youtube_client_id');
            localStorage.removeItem('youtube_client_secret');
            localStorage.removeItem('facebook_app_id');
            localStorage.removeItem('facebook_app_secret');

            location.reload();
        }
    }
}

// สร้าง instance
const automationConfig = new AutomationConfig();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationConfig;
}
