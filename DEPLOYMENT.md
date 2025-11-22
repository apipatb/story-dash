# 🚀 Deploy Story Dashboard to Vercel

## วิธีที่ 1: Deploy ผ่าน Vercel CLI (แนะนำ - ง่ายที่สุด)

### ติดตั้ง Vercel CLI
```bash
npm install -g vercel
```

### Deploy
```bash
# ไปที่โฟลเดอร์โปรเจค
cd story-dash

# Login to Vercel (ครั้งแรกเท่านั้น)
vercel login

# Deploy
vercel

# หรือ Deploy to Production
vercel --prod
```

Vercel จะถาม:
- Set up and deploy? → **Yes**
- Which scope? → เลือก account ของคุณ
- Link to existing project? → **No** (ถ้าเป็นครั้งแรก)
- What's your project's name? → `story-dashboard` หรือชื่อที่ต้องการ
- In which directory is your code located? → `.` (กด Enter)

เสร็จแล้วจะได้ URL มาทันที เช่น: `https://story-dashboard-abc123.vercel.app`

---

## วิธีที่ 2: Deploy ผ่าน Vercel Dashboard (ง่ายสำหรับมือใหม่)

### 1. เตรียม Repository
ถ้ายังไม่มี git repository บน GitHub:
```bash
# Push ขึ้น GitHub
git remote add origin https://github.com/YOUR_USERNAME/story-dash.git
git push -u origin main
```

### 2. Deploy จาก Vercel Dashboard
1. ไปที่ [vercel.com](https://vercel.com)
2. Sign up / Login (ใช้ GitHub account)
3. คลิก **"Add New Project"**
4. เลือก **"Import Git Repository"**
5. เลือก repository `story-dash`
6. กด **"Deploy"**

เสร็จแล้ว! ไม่ต้อง config อะไรเพิ่มเติม

---

## วิธีที่ 3: Deploy โดยลาก Folder

1. ไปที่ [vercel.com/new](https://vercel.com/new)
2. ลากโฟลเดอร์ `story-dash` ลงในหน้าเว็บ
3. Vercel จะ upload และ deploy ให้อัตโนมัติ

---

## ⚙️ Custom Domain (ถ้าต้องการ)

หลัง deploy สำเร็จแล้ว:
1. ไปที่ Project Settings → Domains
2. เพิ่ม custom domain ของคุณ
3. ตั้งค่า DNS ตามที่ Vercel บอก

---

## 🔄 Auto Deploy

ถ้า deploy ผ่าน GitHub:
- ทุกครั้งที่ push code ใหม่ขึ้น GitHub
- Vercel จะ deploy อัตโนมัติทันที
- ดูผลได้ที่ URL ที่ได้รับ

---

## 📝 Environment Variables (ถ้าใช้ AI API)

ถ้าคุณใช้ Claude หรือ OpenAI API:
1. ไปที่ Project Settings → Environment Variables
2. เพิ่ม:
   - `VITE_CLAUDE_API_KEY` = your_api_key
   - `VITE_OPENAI_API_KEY` = your_api_key
3. Redeploy

**หมายเหตุ:** แต่โปรเจคนี้ใช้ LocalStorage เก็บ API key ฝั่ง client ดังนั้นไม่จำเป็นต้อง set environment variables

---

## ✅ Features ที่ใช้งานได้บน Vercel

- ✅ ทุกฟีเจอร์ทำงานปกติ
- ✅ Dark Mode / Color Themes
- ✅ AI Assistant (ถ้ามี API key)
- ✅ LocalStorage สำหรับเก็บข้อมูล
- ✅ Toast Notifications
- ✅ AI Agents
- ✅ Search & Filters
- ✅ Calendar & Analytics

---

## 🌐 URL ตัวอย่าง

หลัง deploy จะได้ URL แบบนี้:
- **Vercel URL**: `https://story-dashboard.vercel.app`
- **Preview URL** (สำหรับ branch อื่น): `https://story-dashboard-git-feature.vercel.app`

---

## 💡 Tips

1. **ฟรี 100%**: Vercel ให้ใช้ฟรีสำหรับ hobby projects
2. **Auto HTTPS**: มี SSL certificate อัตโนมัติ
3. **Global CDN**: เร็วทั่วโลก
4. **Zero Config**: ไม่ต้อง config อะไร
5. **Analytics**: ดูสถิติการใช้งานได้ฟรี

---

## 🐛 Troubleshooting

### ปัญหา: 404 Not Found
- ตรวจสอบว่า `index.html` อยู่ที่ root ของโปรเจค

### ปัญหา: LocalStorage ไม่ทำงาน
- เป็นเรื่องปกติ เพราะ browser แยก storage ตาม domain
- ข้อมูลจาก localhost จะไม่ปรากฏบน Vercel

### ปัญหา: AI ไม่ทำงาน
- ตรวจสอบว่าใส่ API key ใน Settings แล้ว
- หรือเลือกใช้ "Local AI (Free)" ที่ไม่ต้อง API key

---

## 📞 Support

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

Happy Deploying! 🚀
