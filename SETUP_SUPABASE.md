# Supabase Setup Guide - Story Dashboard

This guide will help you set up Supabase for your Story Dashboard application, enabling cloud storage, authentication, and real-time sync across devices.

## 🎯 Why Supabase?

- **Cloud Storage**: Your data is safely stored in the cloud
- **Multi-Device Sync**: Access your content from any device
- **Real-time Updates**: Changes sync instantly across devices
- **Authentication**: Secure user accounts with email/password or Google OAuth
- **Backup**: Automatic backups and data security

## 📋 Prerequisites

- A Supabase account (free tier available)
- Your Story Dashboard app

## 🚀 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `story-dashboard` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

## 🗄️ Step 2: Create Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Create contents table
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
    monetization JSONB DEFAULT '{"views": {"tiktok": 0, "youtube": 0, "facebook": 0}, "revenue": {"ads": 0, "brand": 0, "affiliate": 0}, "brandDeal": ""}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own contents
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

-- Create indexes for better performance
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);

-- Enable Realtime (for live sync)
ALTER PUBLICATION supabase_realtime ADD TABLE contents;
```

4. Click **Run** or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

## 🔑 Step 3: Get Your API Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the left menu
3. You'll see two important values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Copy both values** - you'll need them in the next step

## 🔐 Step 4: Configure Authentication (Optional but Recommended)

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. **Email** is enabled by default
3. Configure email templates if desired:
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation email, magic link, etc.

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Click on **Google**
3. Toggle "Enable Sign in with Google"
4. Follow the instructions to set up Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs
   - Paste Client ID and Client Secret
5. Click **Save**

## 🎨 Step 5: Configure Story Dashboard App

1. Open your Story Dashboard app
2. You'll see the Supabase Setup screen
3. Click "ตั้งค่า Supabase" (Setup Supabase)
4. Enter your credentials:
   - **Supabase URL**: Paste the Project URL from Step 3
   - **Anon Key**: Paste the anon public key from Step 3
5. Click "เชื่อมต่อ" (Connect)

## 👤 Step 6: Create Your Account

After connecting to Supabase, you have two options:

### Option A: Sign Up with Email

1. Click "สมัครสมาชิก" (Sign Up)
2. Fill in:
   - Display Name
   - Email
   - Password (minimum 6 characters)
3. Click "สมัครสมาชิก" (Sign Up)
4. **Check your email** for a confirmation link
5. Click the confirmation link
6. Return to the app and log in

### Option B: Sign In with Google

1. Click "เข้าสู่ระบบด้วย Google" (Sign in with Google)
2. You'll be redirected to Google
3. Choose your Google account
4. Grant permissions
5. You'll be redirected back and automatically logged in

## 📦 Step 7: Migrate Existing Data (If Applicable)

If you have existing data in localStorage:

1. After logging in, you'll see a prompt asking if you want to migrate
2. Click "OK" to migrate your data to Supabase
3. Wait for migration to complete
4. You can choose to keep or delete the localStorage backup

## ✅ Verification

To verify everything is working:

1. Create a new content item
2. Open the browser console (F12)
3. You should see: `✅ Supabase initialized`
4. Check your Supabase dashboard:
   - Go to **Table Editor** → **contents**
   - You should see your content items

## 🔄 Real-time Sync

Real-time sync is automatically enabled. To test:

1. Log in on one device/browser
2. Log in with the same account on another device/browser
3. Create or edit content on one device
4. Watch it update instantly on the other device

## 📊 Database Schema Reference

### Contents Table

| Column       | Type         | Description                          |
|------------- |------------- |------------------------------------- |
| id           | BIGINT       | Unique content ID (timestamp)        |
| user_id      | UUID         | User who created this content        |
| title        | TEXT         | Content title                        |
| category     | TEXT         | Category (superstition/science/etc)  |
| platforms    | TEXT[]       | Target platforms (array)             |
| script       | TEXT         | Content script                       |
| duration     | NUMERIC      | Video duration in minutes            |
| schedule     | TIMESTAMPTZ  | Scheduled post date/time             |
| status       | TEXT         | Status (draft/ready/posted)          |
| notes        | TEXT         | Additional notes/hashtags            |
| monetization | JSONB        | Views, revenue, brand deals          |
| created_at   | TIMESTAMPTZ  | Creation timestamp                   |
| updated_at   | TIMESTAMPTZ  | Last update timestamp                |

### Monetization Structure (JSONB)

```json
{
  "views": {
    "tiktok": 0,
    "youtube": 0,
    "facebook": 0
  },
  "revenue": {
    "ads": 0,
    "brand": 0,
    "affiliate": 0
  },
  "brandDeal": ""
}
```

## 🔒 Security Features

### Row Level Security (RLS)

RLS is enabled, meaning:
- Users can only see their own content
- Users can only modify their own content
- Data is protected at the database level

### Authentication

- Passwords are hashed and secured by Supabase
- Email verification prevents unauthorized signups
- OAuth tokens are managed securely

## 🛠️ Troubleshooting

### "Connection failed" error

- Check that your URL and Key are correct
- Ensure you copied the full key (it's very long)
- Check your internet connection

### "Policy violation" error

- Make sure you're logged in
- Check that RLS policies were created correctly
- Re-run the SQL schema if needed

### Data not syncing

- Check browser console for errors
- Ensure Realtime is enabled in Supabase
- Verify your internet connection

### Can't receive confirmation email

- Check spam folder
- Verify email address is correct
- Go to Supabase Authentication → Users → Resend confirmation

## 🌐 Offline Mode

If you prefer to work offline or don't want to use Supabase:

1. On the login screen, click "ใช้งานแบบ Offline" (Use Offline Mode)
2. Data will be stored in browser localStorage only
3. No sync across devices
4. No cloud backup

## 🔄 Switching Between Accounts

1. Click your email in the top section
2. Click "ออกจากระบบ" (Logout)
3. Log in with a different account

## 📱 Using on Multiple Devices

1. Set up Supabase on your first device
2. On additional devices:
   - Open Story Dashboard
   - Enter the same Supabase URL and Key
   - Log in with the same account
3. Your data will sync automatically

## 💾 Backup and Export

### Export Your Data

1. Go to Settings (⚙️)
2. Click "Export JSON"
3. Your data is downloaded as a backup file

### Import Data

1. Go to Settings (⚙️)
2. Click "Import Data"
3. Select your JSON backup file

## 🎓 Next Steps

After setup, explore these features:

- **AI Agents**: Use AI to optimize content and generate scripts
- **Revenue Tracking**: Track views and earnings from your content
- **Calendar View**: Plan your content schedule visually
- **Analytics**: See performance stats across platforms

## 📞 Support

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Verify your Supabase project is active
3. Check Supabase status: [https://status.supabase.com](https://status.supabase.com)
4. Review the SQL schema and policies

## 🔐 Security Best Practices

- **Never share your Anon Key publicly** (it's safe in client-side code but don't commit to public repos with service role key)
- **Use strong passwords** for your account
- **Enable 2FA** on your Supabase account
- **Regularly backup your data** using Export feature
- **Don't share your Supabase project credentials**

---

**Congratulations!** 🎉 Your Story Dashboard is now powered by Supabase with cloud storage, authentication, and real-time sync!
