// Authentication UI & Logic

// ==================== UI Functions ====================

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('supabaseSetupForm').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('supabaseSetupForm').style.display = 'none';
}

function showSupabaseSetup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('supabaseSetupForm').style.display = 'block';

    // Pre-fill if already configured
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    if (url) document.getElementById('supabaseUrl').value = url;
    if (key) document.getElementById('supabaseKey').value = key;
}

function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
}

function hideAuthScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}

// ==================== Auth Handlers ====================

async function handleSupabaseSetup() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();

    if (!url || !key) {
        showToast('กรุณากรอก URL และ Key', 'warning');
        return;
    }

    showLoading('กำลังเชื่อมต่อกับ Supabase...');

    const success = saveSupabaseConfig(url, key);

    hideLoading();

    if (success) {
        showToast('เชื่อมต่อ Supabase สำเร็จ!', 'success');
        showLoginForm();
    } else {
        showToast('เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบ URL และ Key', 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'warning');
        return;
    }

    if (!isSupabaseConfigured()) {
        showToast('กรุณาตั้งค่า Supabase ก่อน', 'warning');
        showSupabaseSetup();
        return;
    }

    showLoading('กำลังเข้าสู่ระบบ...');

    const result = await signIn(email, password);

    hideLoading();

    if (result.success) {
        await onLoginSuccess();
    }
}

async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        showToast('กรุณากรอกข้อมูลให้ครบ', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'warning');
        return;
    }

    if (!isSupabaseConfigured()) {
        showToast('กรุณาตั้งค่า Supabase ก่อน', 'warning');
        showSupabaseSetup();
        return;
    }

    showLoading('กำลังสมัครสมาชิก...');

    const result = await signUp(email, password, name);

    hideLoading();

    if (result.success) {
        showToast('ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบอีเมลของคุณ', 'success');
        showLoginForm();
    }
}

async function handleGoogleLogin() {
    if (!isSupabaseConfigured()) {
        showToast('กรุณาตั้งค่า Supabase ก่อน', 'warning');
        showSupabaseSetup();
        return;
    }

    const result = await signInWithGoogle();

    if (result.success) {
        // Will redirect to Google OAuth
        showToast('กำลังเปลี่ยนเส้นทางไปยัง Google...', 'info');
    }
}

async function handleLogout() {
    const confirmed = confirm('ต้องการออกจากระบบหรือไม่?');
    if (!confirmed) return;

    showLoading('กำลังออกจากระบบ...');

    const result = await signOut();

    hideLoading();

    if (result.success) {
        onLogoutSuccess();
    }
}

// Use offline mode (LocalStorage only)
function useOfflineMode() {
    const confirmed = confirm('ใช้งานแบบ Offline?\n\nข้อมูลจะเก็บในเครื่องเท่านั้น ไม่ sync ข้ามอุปกรณ์\n\nแนะนำให้ใช้ Supabase เพื่อความปลอดภัยและ sync ข้ามอุปกรณ์');

    if (confirmed) {
        localStorage.setItem('use_offline_mode', 'true');
        window.location.reload();
    }
}

// ==================== Auth State ====================

async function onLoginSuccess() {
    const user = await getCurrentUser();

    if (user) {
        // Show user info
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userInfo').style.display = 'block';

        // Hide auth screen
        hideAuthScreen();

        // Check if migration needed
        await checkAndMigrate();

        // Load data
        await loadDataFromSupabase();

        showToast(`ยินดีต้อนรับ ${user.email}!`, 'success');
    }
}

function onLogoutSuccess() {
    // Clear UI
    document.getElementById('userEmail').textContent = '';
    document.getElementById('userInfo').style.display = 'none';

    // Clear contents
    contents = [];
    renderContents();
    updateStats();

    // Show auth screen
    showAuthScreen();
}

// ==================== Data Loading ====================

async function loadDataFromSupabase() {
    try {
        showLoading('กำลังโหลดข้อมูล...');

        const data = await fetchContents();

        if (data) {
            contents = data;
            cacheContents(contents); // Cache for offline use

            renderContents();
            updateStats();

            if (typeof updateRevenueStats === 'function') {
                updateRevenueStats();
            }

            // Subscribe to real-time changes
            subscribeToChanges(handleRealtimeUpdate);
        }

        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Load data error:', error);
        showToast('โหลดข้อมูลไม่สำเร็จ', 'error');
    }
}

function handleRealtimeUpdate(payload) {
    console.log('Realtime update:', payload);

    // Refresh data
    loadDataFromSupabase();

    showToast('ข้อมูลอัพเดทแล้ว', 'info', 2000);
}

// ==================== Migration ====================

async function checkAndMigrate() {
    const localData = localStorage.getItem('storyDashContents');

    if (localData) {
        const confirmed = confirm('พบข้อมูลเก่าใน LocalStorage\n\nต้องการย้ายข้อมูลไปยัง Supabase หรือไม่?');

        if (confirmed) {
            await migrateFromLocalStorage();
        }
    }
}

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', async function() {
    // Check if using offline mode
    const useOffline = localStorage.getItem('use_offline_mode') === 'true';

    if (useOffline) {
        console.log('📴 Using Offline Mode (LocalStorage)');
        hideAuthScreen();
        return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
        console.log('⚙️ Supabase not configured');
        showAuthScreen();
        return;
    }

    // Initialize Supabase
    const initialized = initSupabase();

    if (!initialized) {
        console.log('❌ Supabase initialization failed');
        showAuthScreen();
        return;
    }

    // Check current user
    const user = await getCurrentUser();

    if (user) {
        console.log('✅ User logged in:', user.email);
        await onLoginSuccess();
    } else {
        console.log('👤 No user logged in');
        showAuthScreen();
    }

    // Listen to auth changes
    onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (event === 'SIGNED_IN' && session) {
            await onLoginSuccess();
        } else if (event === 'SIGNED_OUT') {
            onLogoutSuccess();
        }
    });
});

// ==================== Override saveContents for Supabase ====================

// Store original localStorage save function
const originalSaveContents = window.saveContents;

// Override saveContents to use Supabase when logged in
window.saveContents = async function() {
    // If using Supabase and user is logged in
    if (isSupabaseConfigured() && currentUser) {
        // Data will be saved through insertContent/updateContent
        // No need to save to localStorage
        cacheContents(contents); // Cache only
    } else {
        // Fallback to localStorage
        originalSaveContents();
    }
};
