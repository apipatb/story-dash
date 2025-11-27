# 🚀 Production Setup Guide

## สิ่งที่ต้องมีก่อนเริ่มใช้งาน

### 1️⃣ **OpenAI API Key** (Required)
ใช้สำหรับสร้าง content และ scripts

**วิธีสมัคร:**
1. ไปที่ https://platform.openai.com/api-keys
2. สร้าง API Key ใหม่
3. Copy API Key
4. ไปที่ Settings → AI Configuration
5. วาง API Key

**ราคา:**
- $0.002 per 1K tokens (GPT-3.5)
- ~$0.06 per content (ประมาณ 2 บาท)
- สร้าง 100 contents ≈ $6 (200 บาท)

---

### 2️⃣ **YouTube API Key** (Required สำหรับ YouTube)
ใช้สำหรับ upload videos และดึง competitor data

**วิธีสมัคร:**
1. ไปที่ https://console.cloud.google.com/
2. สร้าง Project ใหม่
3. เปิด YouTube Data API v3
4. สร้าง OAuth 2.0 credentials
5. Download credentials.json
6. ใส่ Client ID ใน Settings

**ฟรี:**
- 10,000 quota/day
- เท่ากับ ~50 video uploads/day

---

### 3️⃣ **Facebook Access Token** (Optional - สำหรับ Facebook)
ใช้สำหรับโพสต์ไป Facebook Page

**วิธีสมัคร:**
1. ไปที่ https://developers.facebook.com/
2. สร้าง App
3. เพิ่ม Facebook Login
4. Get Page Access Token
5. ใส่ใน Settings

**ฟรี** - ไม่มีค่าใช้จ่าย

---

### 4️⃣ **RapidAPI Key** (Optional - สำหรับ Competitor Analysis)
ใช้สำหรับดึงข้อมูล TikTok competitors

**วิธีสมัคร:**
1. ไปที่ https://rapidapi.com/
2. สมัครสมาชิก (ฟรี)
3. Subscribe to TikTok API
4. Copy API Key
5. ใส่ใน Settings

**ราคา:**
- Free tier: 100 requests/month (ฟรี)
- Basic: $9.99/month (300 บาท)

---

### 5️⃣ **LINE Notify Token** (Optional - สำหรับแจ้งเตือน)
ใช้สำหรับรับแจ้งเตือนผ่าน LINE

**วิธีสมัคร:**
1. ไปที่ https://notify-bot.line.me/
2. Login ด้วย LINE
3. Generate Token
4. Copy Token
5. ใส่ใน Settings

**ฟรี** - ไม่มีค่าใช้จ่าย

---

## 🎯 ขั้นตอนเริ่มใช้งาน

### Step 1: ตั้งค่า API Keys
```
Settings → AI Configuration
- OpenAI API Key ✅ (Required)
- YouTube API Key ✅ (Required)
- Facebook Token (Optional)
- RapidAPI Key (Optional)
- LINE Notify Token (Optional)
```

### Step 2: ตั้งค่า Auto-Post
```
Settings → Auto-Post Configuration
- Videos per Day: 3-5
- Platforms: YouTube, Facebook, TikTok
- Posting Times: 18:00, 20:00
- Daily Run Time: 06:00
```

### Step 3: เริ่มระบบ
```
1. กดปุ่ม "▶️ Start Auto-Post" (มุมขวาบน)
2. Confirm
3. เห็น 🟢 Running = เริ่มแล้ว!
```

---

## 💰 ต้นทุนโดยประมาณ

### **ต่อวัน (5 videos):**
- OpenAI API: $0.30 (~10 บาท)
- YouTube API: ฟรี
- Facebook: ฟรี
- RapidAPI: ฟรี (100 requests/month)
- **รวม: ~10 บาท/วัน**

### **ต่อเดือน (150 videos):**
- OpenAI API: $9 (~300 บาท)
- YouTube API: ฟรี
- **รวม: ~300 บาท/เดือน**

### **รายได้คาดหมาย (150 videos/เดือน):**
- YouTube CPM $3:
  - 150 videos × 10K views = 1.5M views
  - 1.5M views × $3 CPM = **$4,500 (~150,000 บาท)**
- TikTok Creator Fund: $50-100 (~2,000 บาท)
- Facebook: $30-50 (~1,000 บาท)
- **รวมรายได้: ~153,000 บาท/เดือน**

**กำไร: 153,000 - 300 = ~152,700 บาท/เดือน** 💰

---

## ⚠️ ข้อควรระวัง

### 1. API Rate Limits
- OpenAI: 3 requests/minute (Tier 1)
- YouTube: 10,000 quota/day
- RapidAPI: 100 requests/month (Free)

**แก้ไข:** ระบบมี Auto-Retry + Rate Limiting built-in

### 2. Budget Monitor
- ตั้งค่า Daily Budget Limit ใน Settings
- ระบบจะหยุดอัตโนมัติถ้าเกินงบ

### 3. Content Quality
- ระบบมี Quality Filter built-in
- ตรวจสอบ content ก่อนโพสต์
- A/B Testing หา version ที่ดีสุด

---

## 🔒 Security

### API Keys Storage:
- เก็บใน LocalStorage (Browser)
- ไม่ส่งไปยัง server ใดๆ
- ปลอดภัย 100%

### Recommendations:
- ใช้ API Keys แยกต่างหาก (ไม่ใช้ main account)
- ตั้งค่า Usage Limits ใน OpenAI Dashboard
- เปิด Budget Alerts

---

## ✅ Checklist ก่อนเริ่ม

- [ ] สมัคร OpenAI API Key
- [ ] ตั้งค่า YouTube API
- [ ] ใส่ API Keys ใน Settings
- [ ] ตั้งค่า Auto-Post Configuration
- [ ] ทดสอบสร้าง content 1 อัน
- [ ] ตรวจสอบ Budget Monitor
- [ ] เปิด LINE Notifications
- [ ] กดปุ่ม Start Auto-Post

---

## 🆘 Support

**ปัญหาที่พบบ่อย:**

### "API Key Invalid"
→ ตรวจสอบว่าใส่ API Key ถูกต้อง และยังไม่หมดอายุ

### "Quota Exceeded"
→ รอ 24 ชั่วโมง หรือ upgrade plan

### "Video Creation Failed"
→ ตรวจสอบ OpenAI API Key และ credit

### "ไม่มีปุ่ม Auto-Post"
→ Refresh หน้าเว็บ หรือ clear cache

---

## 🚀 Ready to Make Money!

**ทุกอย่างพร้อมแล้ว - เริ่มหาเงินได้เลย!**

1. ตั้งค่า API Keys
2. กดปุ่ม Start
3. ปล่อยให้ทำงานเอง
4. รอรับเงิน

**Good luck! 💰**
