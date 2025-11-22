// Supabase Configuration & Database Operations
// PostgreSQL Database with Real-time sync

// ==================== Configuration ====================

const SUPABASE_CONFIG = {
    url: localStorage.getItem('supabase_url') || '',
    anonKey: localStorage.getItem('supabase_key') || ''
};

let supabase = null;
let currentUser = null;

// Initialize Supabase client
function initSupabase() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            // Use global supabase from CDN
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase initialized');
            return true;
        } catch (error) {
            console.error('❌ Supabase initialization failed:', error);
            return false;
        }
    }
    return false;
}

// Check if Supabase is configured
function isSupabaseConfigured() {
    return SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && supabase;
}

// Save Supabase configuration
function saveSupabaseConfig(url, anonKey) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', anonKey);
    SUPABASE_CONFIG.url = url;
    SUPABASE_CONFIG.anonKey = anonKey;
    return initSupabase();
}

// ==================== Authentication ====================

// Sign up new user
async function signUp(email, password, displayName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: displayName
                }
            }
        });

        if (error) throw error;

        showToast('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี', 'success');
        return { success: true, data };
    } catch (error) {
        console.error('Sign up error:', error);
        showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Sign in existing user
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;
        showToast('เข้าสู่ระบบสำเร็จ!', 'success');
        return { success: true, data };
    } catch (error) {
        console.error('Sign in error:', error);
        showToast('เข้าสู่ระบบไม่สำเร็จ: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google'
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Google sign in error:', error);
        showToast('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', 'error');
        return { success: false, error };
    }
}

// Sign out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        currentUser = null;
        showToast('ออกจากระบบสำเร็จ', 'success');
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        showToast('ออกจากระบบไม่สำเร็จ', 'error');
        return { success: false, error };
    }
}

// Get current user
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        currentUser = user;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Listen to auth changes
function onAuthStateChange(callback) {
    if (!supabase) return;

    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        callback(event, session);
    });
}

// ==================== Database Operations ====================

// Table name
const CONTENTS_TABLE = 'contents';

// Fetch all contents for current user
async function fetchContents() {
    try {
        if (!currentUser) {
            console.warn('No user logged in');
            return [];
        }

        const { data, error } = await supabase
            .from(CONTENTS_TABLE)
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform Supabase data to app format
        return data.map(transformFromSupabase);
    } catch (error) {
        console.error('Fetch contents error:', error);
        showToast('โหลดข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        return [];
    }
}

// Insert new content
async function insertContent(content) {
    try {
        if (!currentUser) throw new Error('No user logged in');

        const supabaseContent = transformToSupabase(content);

        const { data, error } = await supabase
            .from(CONTENTS_TABLE)
            .insert([supabaseContent])
            .select()
            .single();

        if (error) throw error;

        showToast('บันทึกข้อมูลสำเร็จ', 'success');
        return { success: true, data: transformFromSupabase(data) };
    } catch (error) {
        console.error('Insert content error:', error);
        showToast('บันทึกข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Update existing content
async function updateContent(id, content) {
    try {
        if (!currentUser) throw new Error('No user logged in');

        const supabaseContent = transformToSupabase(content);
        delete supabaseContent.id; // Don't update ID
        delete supabaseContent.user_id; // Don't update user_id

        const { data, error } = await supabase
            .from(CONTENTS_TABLE)
            .update(supabaseContent)
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .select()
            .single();

        if (error) throw error;

        showToast('อัพเดทข้อมูลสำเร็จ', 'success');
        return { success: true, data: transformFromSupabase(data) };
    } catch (error) {
        console.error('Update content error:', error);
        showToast('อัพเดทข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Delete content
async function deleteContent(id) {
    try {
        if (!currentUser) throw new Error('No user logged in');

        const { error } = await supabase
            .from(CONTENTS_TABLE)
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        showToast('ลบข้อมูลสำเร็จ', 'success');
        return { success: true };
    } catch (error) {
        console.error('Delete content error:', error);
        showToast('ลบข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Subscribe to real-time changes
function subscribeToChanges(callback) {
    if (!supabase || !currentUser) return null;

    const subscription = supabase
        .channel('contents_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: CONTENTS_TABLE,
                filter: `user_id=eq.${currentUser.id}`
            },
            (payload) => {
                console.log('Real-time update:', payload);
                callback(payload);
            }
        )
        .subscribe();

    return subscription;
}

// ==================== Data Transformation ====================

// Transform app data to Supabase format
function transformToSupabase(content) {
    return {
        id: content.id || Date.now(),
        user_id: currentUser?.id,
        title: content.title,
        category: content.category,
        platforms: content.platforms, // PostgreSQL supports arrays
        script: content.script,
        duration: content.duration,
        schedule: content.schedule,
        status: content.status,
        notes: content.notes,
        monetization: content.monetization, // PostgreSQL supports JSONB
        created_at: content.createdAt ? new Date(content.createdAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

// Transform Supabase data to app format
function transformFromSupabase(data) {
    return {
        id: data.id,
        title: data.title,
        category: data.category,
        platforms: data.platforms || [],
        script: data.script || '',
        duration: data.duration,
        schedule: data.schedule,
        status: data.status,
        notes: data.notes || '',
        monetization: data.monetization || {
            views: { tiktok: 0, youtube: 0, facebook: 0 },
            revenue: { ads: 0, brand: 0, affiliate: 0 },
            brandDeal: ''
        },
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime()
    };
}

// ==================== Migration from LocalStorage ====================

async function migrateFromLocalStorage() {
    try {
        if (!currentUser) throw new Error('No user logged in');

        const localData = localStorage.getItem('storyDashContents');
        if (!localData) {
            showToast('ไม่มีข้อมูลเก่าให้ย้าย', 'info');
            return { success: true, count: 0 };
        }

        const contents = JSON.parse(localData);
        if (!Array.isArray(contents) || contents.length === 0) {
            showToast('ไม่มีข้อมูลเก่าให้ย้าย', 'info');
            return { success: true, count: 0 };
        }

        showLoading(`กำลังย้ายข้อมูล ${contents.length} รายการ...`);

        let successCount = 0;
        for (const content of contents) {
            const result = await insertContent(content);
            if (result.success) successCount++;
        }

        hideLoading();

        if (successCount === contents.length) {
            showToast(`ย้ายข้อมูลสำเร็จ ${successCount} รายการ!`, 'success');

            // Ask user if they want to keep or delete local data
            const keepLocal = confirm('ต้องการเก็บข้อมูลเก่าใน LocalStorage ไว้หรือไม่?\n\n(แนะนำให้ลบออก เพราะใช้ Supabase แล้ว)');
            if (!keepLocal) {
                localStorage.removeItem('storyDashContents');
                showToast('ลบข้อมูลเก่าใน LocalStorage แล้ว', 'info');
            }
        } else {
            showToast(`ย้ายข้อมูลสำเร็จ ${successCount}/${contents.length} รายการ`, 'warning');
        }

        return { success: true, count: successCount };
    } catch (error) {
        hideLoading();
        console.error('Migration error:', error);
        showToast('ย้ายข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        return { success: false, error };
    }
}

// ==================== Offline Support ====================

// Save to local cache for offline use
function cacheContents(contents) {
    try {
        localStorage.setItem('supabase_cache', JSON.stringify(contents));
    } catch (error) {
        console.error('Cache save error:', error);
    }
}

// Load from local cache
function loadCachedContents() {
    try {
        const cached = localStorage.getItem('supabase_cache');
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.error('Cache load error:', error);
        return [];
    }
}

// ==================== Helper Functions ====================

// Check if online
function isOnline() {
    return navigator.onLine;
}

// Export data (for backup)
async function exportAllData() {
    try {
        const contents = await fetchContents();
        const dataStr = JSON.stringify(contents, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `story-dash-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Export ข้อมูลสำเร็จ!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export ไม่สำเร็จ', 'error');
    }
}

// ==================== Database Schema ====================

/*
CREATE TABLE contents (
    id BIGINT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    platforms TEXT[] NOT NULL,
    script TEXT,
    duration NUMERIC,
    schedule TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    notes TEXT,
    monetization JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contents
CREATE POLICY "Users can view own contents"
    ON contents FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own contents
CREATE POLICY "Users can insert own contents"
    ON contents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own contents
CREATE POLICY "Users can update own contents"
    ON contents FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own contents
CREATE POLICY "Users can delete own contents"
    ON contents FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE contents;
*/
