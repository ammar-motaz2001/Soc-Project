# 🛡️ IRAS - Incident Response Automation System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

**نظام شامل لإدارة التنبيهات الأمنية والاستجابة للحوادث**

[Features](#-features) • [Screenshots](#-screenshots) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📋 نظرة عامة

**IRAS** هو نظام محاكاة احترافي لمركز عمليات الأمان (SOC)، مصمم لمساعدة فرق الأمن السيبراني على إدارة التنبيهات الأمنية والاستجابة للحوادث بكفاءة عالية.

### ✨ الميزة الرئيسية: نظام الإجراءات التلقائية

يتميز IRAS بنظام **إجراءات تلقائية ذكي** يُنفذ 4-6 إجراءات أمنية فوراً عند اكتشاف تنبيهات بمستوى Critical أو High، مع عرض إشعارات فورية تحتوي على أسماء الإجراءات المُنفذة.

---

## 🚀 الميزات الرئيسية

### 🔔 إدارة التنبيهات
- ✅ Dashboard تفاعلي مع إحصائيات شاملة
- ✅ Alert Queue مع فلاتر متقدمة وبحث
- ✅ نظام Assign للمحللين
- ✅ Resolve كـ True Positive أو False Positive
- ✅ Modal تفصيلي لكل تنبيه

### ⚡ الإجراءات التلقائية (Automated Actions)
- ✅ تشغيل تلقائي فوري للتنبيهات Critical/High
- ✅ 4-6 إجراءات متنوعة لكل تنبيه:
  - 📧 Security Alert Notification
  - 🔍 Threat Intelligence Enrichment
  - 🛡️ Containment Actions (Endpoint Isolation, IP Blocking, Email Quarantine)
  - 📊 SIEM Log Correlation
- ✅ Toast notifications مع أسماء الإجراءات
- ✅ صفحة تفصيلية احترافية مع:
  - 6 بطاقات إحصائيات
  - رسوم بيانية تفاعلية (Pie + Bar charts)
  - جدول قابل للتوسع مع execution timeline
  - فلاتر متعددة (Status, Category, Search)

### 📊 إدارة الحالات
- ✅ Case Reports شاملة
- ✅ Timeline tracking
- ✅ Actions taken و Findings
- ✅ Recommendations حسب نوع التهديد
- ✅ Modal احترافي لكل حالة

### 🔗 SIEM Integration
- ✅ واجهة Splunk
- ✅ URL Configuration
- ✅ Status Monitoring

### 📚 التوثيق والأدلة
- ✅ 6 تبويبات توثيق شاملة
- ✅ Alert Triage Playbook
- ✅ Classification Guidelines
- ✅ Company Information
- ✅ Asset Inventory

### 📖 Playbooks
- ✅ 4 playbooks جاهزة للاستخدام
- ✅ Search functionality
- ✅ Category filtering

### 🧭 System Guide
- ✅ دليل شامل للنظام
- ✅ شرح جميع الصفحات
- ✅ Getting Started guide

---

## 🎨 التصميم

### الألوان
```css
--bg: #0F1722           /* خلفية رئيسية */
--card: #19232C         /* بطاقات */
--text: #E6EEF6         /* نص رئيسي */
--muted: #98A0AC        /* نص ثانوي */
--accent: #A7EA3B       /* لون مميز */
--danger: #FF6B6B       /* تحذيرات */
```

### Severity Colors
- 🔴 **Critical**: `#FF6B6B`
- 🟡 **High**: `#FFD966`
- 🔵 **Medium**: `#60A5FA`
- 🟢 **Low**: `#A7F3D0`

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/0F1722/A7EA3B?text=Dashboard+View)

### Automated Actions
![Automated Actions](https://via.placeholder.com/800x400/0F1722/A7EA3B?text=Automated+Actions+Page)

### Alert Queue
![Alert Queue](https://via.placeholder.com/800x400/0F1722/A7EA3B?text=Alert+Queue)

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة UI
- **TypeScript** - لغة البرمجة (100%)
- **React Router v6** - التنقل
- **Tailwind CSS v4** - التصميم

### Libraries
- **Lucide React** - الأيقونات
- **Recharts** - الرسوم البيانية
- **Chart.js** - Dashboard charts
- **Sonner** - Toast notifications

### State Management
- **React Context API** - إدارة الحالة
- **LocalStorage** - حفظ البيانات

---

## 📥 التثبيت

### المتطلبات
- Node.js 18+ 
- npm / yarn / pnpm

### الخطوات

```bash
# 1. استنساخ المشروع
git clone <repository-url>
cd iras-project

# 2. تثبيت التبعيات
npm install
# أو
yarn install
# أو
pnpm install

# 3. تشغيل المشروع
npm run dev
# أو
yarn dev
# أو
pnpm dev

# 4. فتح المتصفح على
# http://localhost:5173
```

### البناء للإنتاج

```bash
npm run build
# أو
yarn build
# أو
pnpm build
```

---

## 📖 الاستخدام

### تسجيل الدخول
```
Username: أي اسم مستخدم
Password: 3 أحرف على الأقل

أو استخدم: demo / demo123
```

### سير العمل الأساسي

1. **Dashboard**: راجع الإحصائيات والتنبيهات
2. **Alert Queue**: عرض جميع التنبيهات
3. **Assign**: تعيين تنبيه لنفسك
4. **Investigate**: راجع التفاصيل
5. **Resolve**: حل كـ TP أو FP
6. **Case Reports**: راجع الحالات المغلقة

### نظام الإجراءات التلقائية

عند ظهور تنبيه Critical أو High:
1. ✅ يتم تشغيل الإجراءات تلقائياً
2. 🔔 تظهر إشعار Toast مع أسماء الإجراءات
3. 📊 يمكن مراجعة التفاصيل في صفحة Automated Actions
4. 🔍 كل إجراء له execution timeline كامل

---

## 📁 هيكل المشروع

```
iras-project/
├── src/
│   ├── App.tsx                      # التطبيق الرئيسي
│   │
│   ├── pages/                       # الصفحات (10)
│   │   ├── Dashboard.tsx
│   │   ├── AlertQueue.tsx
│   │   ├── Actions.tsx
│   │   ├── AutomatedActions.tsx    ⭐
│   │   ├── CaseReports.tsx
│   │   ├── SIEM.tsx
│   │   ├── Documentation.tsx
│   │   ├── Playbooks.tsx
│   │   ├── Guide.tsx
│   │   └── Login.tsx
│   │
│   ├── components/                  # المكونات (6)
│   │   ├── AlertModal.tsx
│   │   ├── CaseModal.tsx
│   │   ├── DashboardChart.tsx
│   │   ├── Layout.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Sidebar.tsx
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── ui/                      # (47 مكون)
│   │
│   ├── context/                     # Context API (2)
│   │   ├── AuthContext.tsx
│   │   └── SOCContext.tsx          ⭐
│   │
│   └── styles/
│       └── globals.css
│
├── CHANGELOG.md
├── FILES_CHECKLIST.md
├── PROJECT_EXPORT_GUIDE.md
├── README_AUTOMATED_ACTIONS.md
└── README.md
```

---

## 📚 التوثيق

### الأدلة المتوفرة
- 📄 [README_AUTOMATED_ACTIONS.md](./README_AUTOMATED_ACTIONS.md) - دليل نظام الإجراءات التلقائية
- 📄 [PROJECT_EXPORT_GUIDE.md](./PROJECT_EXPORT_GUIDE.md) - دليل التصدير الشامل
- 📄 [FILES_CHECKLIST.md](./FILES_CHECKLIST.md) - قائمة التحقق من الملفات
- 📄 [CHANGELOG.md](./CHANGELOG.md) - سجل التحديثات

### داخل التطبيق
- 📖 **Documentation** - أدلة وplaybooks
- 🧭 **Guide** - دليل النظام الكامل

---

## 🔐 الأمان والبيانات

### LocalStorage
```javascript
// المفاتيح المستخدمة
'iras_auth'           // حالة المصادقة
'soc_sim_data_v4'     // بيانات التنبيهات والحالات
```

### البيانات المحفوظة
```typescript
{
  alerts: Alert[],                    // التنبيهات
  cases: Case[],                      // الحالات المغلقة
  automatedActions: AutomatedAction[] // الإجراءات التلقائية
}
```

⚠️ **ملاحظة**: هذا نظام تجريبي، لا يُنصح باستخدامه لبيانات حساسة في الإنتاج.

---

## 🧪 التطوير

### Scripts المتاحة

```bash
# تشغيل التطوير
npm run dev

# البناء للإنتاج
npm run build

# معاينة البناء
npm run preview

# TypeScript type check
npm run type-check

# Linting
npm run lint
```

### إضافة صفحة جديدة

1. إنشاء ملف في `/pages/NewPage.tsx`
2. إضافة Route في `App.tsx`
3. إضافة عنصر في `Sidebar.tsx`

---

## 🤝 المساهمة

نرحب بالمساهمات! اتبع الخطوات التالية:

1. Fork المشروع
2. إنشاء Branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الإصدارات

### v1.0.0 (Current) - December 18, 2024
- ✅ نظام كامل للإجراءات التلقائية
- ✅ 10 صفحات وظيفية
- ✅ 6 مكونات أساسية + 47 مكون UI
- ✅ توثيق شامل
- ✅ Responsive design كامل
- ✅ TypeScript 100%

راجع [CHANGELOG.md](./CHANGELOG.md) للتفاصيل الكاملة.

---

## 🎯 خارطة الطريق

### قريباً
- [ ] Export functionality للتقارير
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Advanced filtering options

### المستقبل
- [ ] Backend API integration
- [ ] Database persistence
- [ ] Role-based access control
- [ ] Real SIEM integration
- [ ] Mobile app

---

## 📊 الإحصائيات

- **إجمالي الملفات**: 74 ملف
- **الصفحات**: 10 صفحات
- **المكونات**: 53 مكون
- **أسطر الكود**: ~8,000+ سطر
- **TypeScript**: 100%
- **Test Coverage**: 0% (قيد التطوير)

---

## 🙏 شكر وتقدير

- **Lucide Icons** - الأيقونات الجميلة
- **Recharts** - الرسوم البيانية
- **Tailwind CSS** - نظام التصميم
- **React Team** - المكتبة الرائعة

---

## 📧 الاتصال

لأي استفسارات أو اقتراحات:
- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 💬 Discord: YourDiscord#0000
- 🐦 Twitter: [@YourTwitter](https://twitter.com/YourTwitter)

---

## 📜 الترخيص

هذا المشروع مرخص بموجب MIT License - راجع [LICENSE](./LICENSE) للتفاصيل.

---

## ⭐ دعم المشروع

إذا أعجبك المشروع، لا تنسَ إعطائه ⭐ على GitHub!

---

<div align="center">

**صُنع بـ ❤️ بواسطة فريق IRAS**

![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb)
![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-blue)
![Made with Tailwind](https://img.shields.io/badge/Made%20with-Tailwind%20CSS-38bdf8)

[⬆ العودة للأعلى](#-iras---incident-response-automation-system)

</div>
