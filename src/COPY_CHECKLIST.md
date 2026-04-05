# ✅ قائمة النسخ السريع - IRAS Project

## 📋 نسخ الملفات حسب الأولوية

اتبع هذه القائمة لنسخ الملفات واحداً تلو الآخر من Figma Make.

---

## 🔴 المجموعة 1: ملفات أساسية (يجب نسخها أولاً)

### ⭐ الأهم على الإطلاق (6 ملفات)

- [ ] `/App.tsx` - التطبيق الرئيسي
- [ ] `/context/SOCContext.tsx` - إدارة البيانات ⭐⭐⭐
- [ ] `/context/AuthContext.tsx` - المصادقة
- [ ] `/styles/globals.css` - التصميم الأساسي
- [ ] `/components/Layout.tsx` - التخطيط
- [ ] `/components/Sidebar.tsx` - القائمة الجانبية

**بعد نسخ هذه الـ 6 ملفات، المشروع له أساس!**

---

## 🟡 المجموعة 2: الصفحات (10 ملفات)

### الصفحات الأساسية (انسخها بالترتيب):

- [ ] `/pages/Login.tsx` - 1️⃣ تسجيل الدخول
- [ ] `/pages/Dashboard.tsx` - 2️⃣ الصفحة الرئيسية
- [ ] `/pages/AlertQueue.tsx` - 3️⃣ إدارة التنبيهات
- [ ] `/pages/AutomatedActions.tsx` - 4️⃣ **الإجراءات التلقائية** ⭐
- [ ] `/pages/Actions.tsx` - 5️⃣ الإجراءات
- [ ] `/pages/CaseReports.tsx` - 6️⃣ التقارير
- [ ] `/pages/SIEM.tsx` - 7️⃣ SIEM
- [ ] `/pages/Documentation.tsx` - 8️⃣ التوثيق
- [ ] `/pages/Playbooks.tsx` - 9️⃣ Playbooks
- [ ] `/pages/Guide.tsx` - 🔟 الدليل

**بعد المجموعة 1 + 2 = 16 ملف → المشروع يعمل بشكل أساسي!**

---

## 🟢 المجموعة 3: المكونات الثانوية (6 ملفات)

- [ ] `/components/AlertModal.tsx`
- [ ] `/components/CaseModal.tsx`
- [ ] `/components/DashboardChart.tsx`
- [ ] `/components/PageHeader.tsx`
- [ ] `/components/figma/ImageWithFallback.tsx`

**بعد المجموعة 1 + 2 + 3 = 21 ملف → المشروع شبه كامل!**

---

## 🔵 المجموعة 4: مكونات UI (47 ملف)

### يمكنك نسخها لاحقاً إذا احتجتها:

<details>
<summary>📂 اضغط لرؤية قائمة مكونات UI الكاملة (47 ملف)</summary>

#### مكونات التفاعل (14 ملف):
- [ ] `/components/ui/button.tsx`
- [ ] `/components/ui/checkbox.tsx`
- [ ] `/components/ui/input.tsx`
- [ ] `/components/ui/input-otp.tsx`
- [ ] `/components/ui/label.tsx`
- [ ] `/components/ui/radio-group.tsx`
- [ ] `/components/ui/select.tsx`
- [ ] `/components/ui/slider.tsx`
- [ ] `/components/ui/switch.tsx`
- [ ] `/components/ui/textarea.tsx`
- [ ] `/components/ui/toggle.tsx`
- [ ] `/components/ui/toggle-group.tsx`
- [ ] `/components/ui/form.tsx`
- [ ] `/components/ui/calendar.tsx`

#### مكونات العرض (12 ملف):
- [ ] `/components/ui/card.tsx`
- [ ] `/components/ui/alert.tsx`
- [ ] `/components/ui/badge.tsx`
- [ ] `/components/ui/avatar.tsx`
- [ ] `/components/ui/progress.tsx`
- [ ] `/components/ui/skeleton.tsx`
- [ ] `/components/ui/table.tsx`
- [ ] `/components/ui/tabs.tsx`
- [ ] `/components/ui/aspect-ratio.tsx`
- [ ] `/components/ui/separator.tsx`
- [ ] `/components/ui/chart.tsx`
- [ ] `/components/ui/carousel.tsx`

#### مكونات الحوار (8 ملفات):
- [ ] `/components/ui/dialog.tsx`
- [ ] `/components/ui/alert-dialog.tsx`
- [ ] `/components/ui/sheet.tsx`
- [ ] `/components/ui/drawer.tsx`
- [ ] `/components/ui/popover.tsx`
- [ ] `/components/ui/tooltip.tsx`
- [ ] `/components/ui/hover-card.tsx`
- [ ] `/components/ui/context-menu.tsx`

#### مكونات التنقل (7 ملفات):
- [ ] `/components/ui/navigation-menu.tsx`
- [ ] `/components/ui/menubar.tsx`
- [ ] `/components/ui/dropdown-menu.tsx`
- [ ] `/components/ui/command.tsx`
- [ ] `/components/ui/breadcrumb.tsx`
- [ ] `/components/ui/pagination.tsx`
- [ ] `/components/ui/sidebar.tsx`

#### مكونات البنية (4 ملفات):
- [ ] `/components/ui/accordion.tsx`
- [ ] `/components/ui/collapsible.tsx`
- [ ] `/components/ui/resizable.tsx`
- [ ] `/components/ui/scroll-area.tsx`

#### Utilities (2 ملف):
- [ ] `/components/ui/use-mobile.ts`
- [ ] `/components/ui/utils.ts`
- [ ] `/components/ui/sonner.tsx`

</details>

**ملاحظة**: معظم الصفحات ستعمل حتى بدون نسخ كل مكونات UI.

---

## 📝 المجموعة 5: ملفات التكوين (تُنشأ يدوياً)

### هذه الملفات ليست موجودة في Figma Make - أنشئها بنفسك:

#### ✏️ index.html
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IRAS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### ✏️ src/main.tsx
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

#### ✏️ package.json
```json
{
  "name": "iras-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0",
    "lucide-react": "latest",
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

#### ✏️ vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

#### ✏️ tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
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

## 🎯 خطة النسخ الموصى بها

### المسار السريع (30 دقيقة):

1. ✅ **المجموعة 1** (6 ملفات) - 5 دقائق
2. ✅ **المجموعة 2** (10 ملفات) - 10 دقائق
3. ✅ **المجموعة 3** (5 ملفات) - 5 دقائق
4. ✅ **المجموعة 5** (أنشئ الملفات) - 5 دقائق
5. ✅ **npm install** - 3 دقائق
6. ✅ **npm run dev** - 1 دقيقة
7. ✅ **اختبار** - 1 دقيقة

**المجموع**: ~30 دقيقة للحصول على مشروع يعمل!

### المسار الكامل (1-2 ساعة):

- المسار السريع + المجموعة 4 (47 مكون UI)

---

## 📊 تتبع التقدم

```
الإجمالي: 75 ملف

المجموعة 1: [ ] [ ] [ ] [ ] [ ] [ ]         (6/6)
المجموعة 2: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]  (10/10)
المجموعة 3: [ ] [ ] [ ] [ ] [ ]              (5/5)
المجموعة 4: انظر التفاصيل أعلاه             (47/47)
المجموعة 5: [ ] [ ] [ ] [ ] [ ]              (5/5)

التقدم الكلي: _____ / 75
```

---

## ✅ قائمة التحقق النهائية

بعد نسخ كل شيء:

- [ ] جميع الملفات في الأماكن الصحيحة
- [ ] تم تشغيل `npm install`
- [ ] تم تشغيل `npm run dev`
- [ ] المتصفح يفتح على http://localhost:5173
- [ ] صفحة Login تظهر
- [ ] يمكنني تسجيل الدخول
- [ ] Dashboard يعمل
- [ ] Alert Queue يعمل
- [ ] Automated Actions تعمل ⭐
- [ ] لا توجد أخطاء في Console

---

## 💡 نصائح للنسخ

### كيف أنسخ ملف من Figma Make:

1. **افتح الملف** في Figma Make
2. **حدد كل النص**: `Ctrl+A` (Windows) أو `Cmd+A` (Mac)
3. **انسخ**: `Ctrl+C` أو `Cmd+C`
4. **افتح محرر نصوص** (VS Code, Notepad++, إلخ)
5. **أنشئ ملف جديد** بنفس الاسم
6. **الصق**: `Ctrl+V` أو `Cmd+V`
7. **احفظ** الملف

### ✅ تأكد من:
- الاسم صحيح (مثل `App.tsx` وليس `app.tsx`)
- الامتداد صحيح (`.tsx`, `.ts`, `.css`)
- المسار صحيح (في `/pages/` أو `/components/`)

---

## 🚀 بدائل أسرع

### الخيار 1: استخدم Figma Make مباشرة
**لا حاجة للنسخ أصلاً!** المشروع يعمل الآن.

### الخيار 2: نسخ انتقائي
انسخ فقط الصفحات التي تهمك:
- Dashboard
- AlertQueue
- AutomatedActions

### الخيار 3: استخدم Git (إن وُجد)
إذا كان Figma Make يدعم Git export.

---

## ❓ مشاكل شائعة

### "الملفات كثيرة جداً!"
**الحل**: ابدأ بالمجموعة 1 فقط (6 ملفات)، ثم أضف الباقي تدريجياً.

### "لا أعرف أين أضع الملف"
**الحل**: راجع الهيكل في [VISUAL_GUIDE.md](./VISUAL_GUIDE.md)

### "حصلت على أخطاء بعد npm install"
**الحل**: تأكد من نسخ `package.json` بالضبط كما هو.

---

## 🎊 انتهيت من النسخ؟

بعد النسخ:

```bash
# 1. افتح Terminal في مجلد المشروع
cd path/to/iras-project

# 2. ثبّت التبعيات
npm install

# 3. شغّل المشروع
npm run dev

# 4. افتح المتصفح
# http://localhost:5173
```

**مبروك! 🎉 مشروعك يعمل الآن!**

---

**آخر تحديث**: December 18, 2024  
**الحالة**: ✅ جاهز للنسخ
