# 📥 كيفية الحصول على الملفات - دليل مبسط

## 🎯 الخبر السار: الملفات موجودة بالفعل!

جميع ملفات المشروع موجودة في بيئة **Figma Make** الحالية وتعمل بشكل كامل.

---

## 📱 الطريقة 1: استخدام المشروع مباشرة في Figma Make (الأسهل)

### لست بحاجة لتصدير شيء!

المشروع يعمل الآن في Figma Make:
- ✅ افتح المتصفح في Preview
- ✅ جرّب جميع الصفحات
- ✅ اختبر الميزات
- ✅ كل شيء محفوظ تلقائياً

**هذه الطريقة مثالية إذا كنت تريد فقط استخدام المشروع!** 🎉

---

## 💻 الطريقة 2: نسخ الملفات إلى مشروع خارجي

### الخطوة 1️⃣: قائمة الملفات الأساسية

هذه هي الملفات التي تحتاج لنسخها (يمكنك رؤيتها في Figma Make):

```
📁 المشروع/
│
├── 📄 App.tsx                         ← ابدأ من هنا
│
├── 📁 pages/                          ← 10 صفحات
│   ├── Dashboard.tsx
│   ├── AlertQueue.tsx
│   ├── Actions.tsx
│   ├── AutomatedActions.tsx          ⭐ مهم
│   ├── CaseReports.tsx
│   ├── SIEM.tsx
│   ├── Documentation.tsx
│   ├── Playbooks.tsx
│   ├── Guide.tsx
│   └── Login.tsx
│
├── 📁 components/                     ← 6 مكونات رئيسية
│   ├── AlertModal.tsx
│   ├── CaseModal.tsx
│   ├── DashboardChart.tsx
│   ├── Layout.tsx
│   ├── PageHeader.tsx
│   ├── Sidebar.tsx
│   └── 📁 ui/                        ← 47 مكون
│
├── 📁 context/                        ← مهم جداً!
│   ├── AuthContext.tsx
│   └── SOCContext.tsx                ⭐ القلب
│
└── 📁 styles/
    └── globals.css                    ⭐ مهم
```

---

### الخطوة 2️⃣: كيف أنسخ ملف؟

#### في Figma Make:

1. **افتح الملف** من القائمة الجانبية
2. **حدد كل النص** (Ctrl+A أو Cmd+A)
3. **انسخ** (Ctrl+C أو Cmd+C)
4. **الصق في محرر النصوص** على جهازك
5. **احفظ الملف** بنفس الاسم والامتداد

**مثال**:
```
- افتح App.tsx في Figma Make
- اضغط Ctrl+A (حدد الكل)
- اضغط Ctrl+C (نسخ)
- افتح VS Code أو أي محرر
- أنشئ ملف App.tsx
- الصق (Ctrl+V)
- احفظ
```

---

### الخطوة 3️⃣: الملفات التي تحتاج إنشاؤها يدوياً

بعض الملفات ليست موجودة في Figma Make، تحتاج لإنشائها:

#### A. إنشاء `index.html` في المجلد الرئيسي

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IRAS - نظام الاستجابة للحوادث</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### B. إنشاء `src/main.tsx`

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

#### C. إنشاء `package.json`

```json
{
  "name": "iras-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0",
    "lucide-react": "^0.460.0",
    "recharts": "^2.13.3",
    "sonner": "2.0.3",
    "chart.js": "^4.4.6",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

#### D. إنشاء `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

#### E. إنشاء `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

---

## 🎯 دليل خطوة بخطوة للمبتدئين

### الطريقة الكاملة:

#### 1. أنشئ مجلد جديد على جهازك
```bash
mkdir iras-project
cd iras-project
```

#### 2. أنشئ الهيكل الأساسي
```
iras-project/
├── src/
│   ├── components/
│   │   └── ui/
│   ├── pages/
│   ├── context/
│   └── styles/
└── public/
```

#### 3. انسخ الملفات واحداً تلو الآخر

**ابدأ بالملفات المهمة**:

1. ✅ `src/App.tsx` - انسخ من Figma Make
2. ✅ `src/context/SOCContext.tsx` - انسخ من Figma Make
3. ✅ `src/context/AuthContext.tsx` - انسخ من Figma Make
4. ✅ `src/styles/globals.css` - انسخ من Figma Make
5. ✅ `src/components/Layout.tsx` - انسخ من Figma Make
6. ✅ `src/components/Sidebar.tsx` - انسخ من Figma Make

**ثم الصفحات**:

7. ✅ `src/pages/Dashboard.tsx`
8. ✅ `src/pages/AlertQueue.tsx`
9. ✅ `src/pages/AutomatedActions.tsx` ⭐
10. ✅ وهكذا...

#### 4. أنشئ الملفات الإضافية

- ✅ `index.html` (انسخ من الأعلى)
- ✅ `src/main.tsx` (انسخ من الأعلى)
- ✅ `package.json` (انسخ من الأعلى)
- ✅ `vite.config.ts` (انسخ من الأعلى)
- ✅ `tsconfig.json` (انسخ من الأعلى)

#### 5. ثبّت التبعيات
```bash
npm install
```

#### 6. شغّل المشروع
```bash
npm run dev
```

---

## ❓ أسئلة شائعة

### س: كم ملف أحتاج لنسخه؟
**ج**: حوالي 75 ملف. لكن الأساسية حوالي 20 ملف فقط، الباقي مكونات UI.

### س: هل يمكنني نسخ جزء فقط؟
**ج**: نعم! يمكنك البدء بـ:
- App.tsx
- Context (2 ملف)
- صفحة واحدة (مثل Dashboard)
- styles/globals.css

### س: الملفات كثيرة، هل هناك طريقة أسرع؟
**ج**: نعم! استخدم Figma Make مباشرة بدون تصدير 😊

### س: هل يمكنني استخدام Git؟
**ج**: نعم! إذا كان Figma Make يدعم Git، يمكنك عمل Push لمشروعك.

### س: أين أجد الملفات في Figma Make؟
**ج**: في القائمة الجانبية اليسرى، توجد قائمة بجميع الملفات.

---

## 🚀 الخيار الأسرع

### استخدم Figma Make مباشرة!

**لماذا تعقّد الأمور؟** 

المشروع يعمل بالفعل في Figma Make:
- ✅ لا حاجة للتصدير
- ✅ لا حاجة لـ npm install
- ✅ كل شيء جاهز
- ✅ يعمل فوراً

**فقط استخدمه!** 🎉

---

## 💡 نصيحة

إذا كنت تريد:
- **مجرد استخدام المشروع** → استخدم Figma Make مباشرة ✅
- **التعديل والتطوير محلياً** → انسخ الملفات واحداً واحداً
- **مشاركة المشروع** → انسخ كل شيء لمشروع Git

---

## 🆘 محتاج مساعدة إضافية؟

أخبرني:
- هل تريد استخدام المشروع في Figma Make فقط؟
- أم تريد نسخه لجهازك؟
- هل لديك خبرة بـ React و npm؟

سأساعدك حسب احتياجك! 😊

---

**الخلاصة**: المشروع موجود وجاهز في Figma Make الآن! 🎊
