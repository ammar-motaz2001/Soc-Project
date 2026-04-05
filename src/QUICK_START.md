# ⚡ دليل البدء السريع - IRAS

## 🎯 خطوات البدء (5 دقائق)

### 1️⃣ نسخ الملفات ✅

تأكد من نسخ جميع الملفات التالية:

```bash
✅ جميع الملفات في المجلد الحالي
✅ الحفاظ على الهيكل الموجود
✅ عدم تعديل أسماء المجلدات
```

---

### 2️⃣ إنشاء ملفات التكوين 📝

#### A. إنشاء `package.json`
```bash
# انسخ محتوى package.example.json
cp package.example.json package.json

# أو أنشئ ملف جديد بنفس المحتوى
```

#### B. إنشاء `vite.config.ts`
```bash
cp vite.config.example.ts vite.config.ts
```

#### C. إنشاء `tsconfig.json`
```bash
cp tsconfig.example.json tsconfig.json
```

#### D. إنشاء `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### E. إنشاء `index.html` في المجلد الرئيسي
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="IRAS - Incident Response Automation System" />
    <title>IRAS - نظام الاستجابة للحوادث</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### F. إنشاء `main.tsx` في `/src/`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### G. إنشاء `.gitignore`
```
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment
.env
.env.local
.env.production
```

---

### 3️⃣ تثبيت التبعيات 📦

```bash
# استخدم npm
npm install

# أو yarn
yarn install

# أو pnpm
pnpm install
```

⏱️ **الوقت المتوقع**: 2-3 دقائق

---

### 4️⃣ تشغيل المشروع 🚀

```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

سيفتح المتصفح تلقائياً على:
```
http://localhost:5173
```

---

### 5️⃣ تسجيل الدخول 🔐

استخدم أي من:
```
Username: demo
Password: demo123

أو

Username: أي اسم
Password: أي كلمة مرور (3 أحرف على الأقل)
```

---

## ✅ التحقق من التثبيت

### الصفحات الأساسية:
1. ✅ **Dashboard** - http://localhost:5173/
2. ✅ **Alert Queue** - http://localhost:5173/queue
3. ✅ **Automated Actions** - http://localhost:5173/automated-actions
4. ✅ **Case Reports** - http://localhost:5173/cases

### اختبر الميزات:
1. ✅ افتح تنبيه Critical من Dashboard
2. ✅ راجع الإشعار المنبثق (Toast)
3. ✅ اذهب لصفحة Automated Actions
4. ✅ انقر على أي صف لرؤية التفاصيل

---

## 🐛 حل المشاكل الشائعة

### ❌ خطأ: Module not found
```bash
# حل: تأكد من تثبيت جميع التبعيات
npm install

# أو احذف node_modules وأعد التثبيت
rm -rf node_modules
npm install
```

### ❌ خطأ: Cannot find module './App'
```bash
# تأكد من وجود main.tsx في /src/
# وأن App.tsx موجود في /src/
```

### ❌ Tailwind classes لا تعمل
```bash
# تأكد من وجود globals.css
# وأنه مستورد في main.tsx
```

### ❌ الصفحة فارغة
```bash
# افتح Console في المتصفح
# تحقق من الأخطاء
# تأكد من وجود <div id="root"> في index.html
```

### ❌ Port 5173 مشغول
```bash
# غيّر Port في vite.config.ts
server: {
  port: 3000,  // أو أي رقم آخر
}
```

---

## 📁 الهيكل النهائي المتوقع

```
project/
├── node_modules/           # (بعد npm install)
├── src/
│   ├── main.tsx           # ✨ جديد
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── styles/
│       └── globals.css
├── public/
│   └── vite.svg           # (اختياري)
├── index.html             # ✨ جديد
├── package.json           # ✨ جديد
├── tsconfig.json          # ✨ جديد
├── tsconfig.node.json     # ✨ جديد
├── vite.config.ts         # ✨ جديد
├── .gitignore             # ✨ جديد
├── README.md
├── CHANGELOG.md
├── FILES_CHECKLIST.md
└── PROJECT_EXPORT_GUIDE.md
```

---

## 🎉 تم بنجاح!

إذا وصلت إلى هنا، تهانينا! 🎊

المشروع الآن يعمل بالكامل:
- ✅ Dashboard
- ✅ Alert Queue
- ✅ Automated Actions
- ✅ Case Reports
- ✅ SIEM
- ✅ Documentation
- ✅ Playbooks
- ✅ Guide

---

## 📚 الخطوات التالية

1. 📖 راجع [README.md](./README.md) للتوثيق الكامل
2. ⚡ راجع [README_AUTOMATED_ACTIONS.md](./README_AUTOMATED_ACTIONS.md) لفهم نظام الإجراءات التلقائية
3. 🔍 استكشف الكود في `/src/`
4. 🎨 خصص التصميم في `/styles/globals.css`
5. 🚀 ابدأ التطوير!

---

## 💡 نصائح سريعة

### للتطوير:
```bash
# مراقبة الأخطاء
npm run type-check

# تشغيل Linter
npm run lint
```

### للإنتاج:
```bash
# بناء المشروع
npm run build

# معاينة البناء
npm run preview
```

### للتخصيص:
- الألوان: `/styles/globals.css`
- المكونات: `/components/`
- الصفحات: `/pages/`
- البيانات: `/context/SOCContext.tsx`

---

## 🆘 تحتاج مساعدة؟

راجع:
- 📄 [README.md](./README.md) - التوثيق الكامل
- 📄 [PROJECT_EXPORT_GUIDE.md](./PROJECT_EXPORT_GUIDE.md) - دليل التصدير
- 📄 [FILES_CHECKLIST.md](./FILES_CHECKLIST.md) - قائمة الملفات

---

**وقت الإعداد الكلي**: ~5 دقائق ⚡

**جاهز للتطوير؟ ابدأ الآن!** 🚀
