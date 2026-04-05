# 🎨 الدليل المرئي السريع - IRAS

## 📋 محتويات الدليل
1. [هيكل المشروع](#-هيكل-المشروع)
2. [تدفق البيانات](#-تدفق-البيانات)
3. [الصفحات الرئيسية](#-الصفحات-الرئيسية)
4. [نظام الإجراءات التلقائية](#-نظام-الإجراءات-التلقائية)
5. [المكونات](#-المكونات)

---

## 📁 هيكل المشروع

```
iras-project/
│
├── 📄 index.html                    # نقطة الدخول
├── 📄 package.json                  # التبعيات
├── 📄 vite.config.ts               # تكوين Vite
├── 📄 tsconfig.json                # تكوين TypeScript
│
├── 📁 src/                         # 🎯 الكود الرئيسي
│   │
│   ├── 📄 main.tsx                 # نقطة دخول React
│   ├── 📄 App.tsx                  # التطبيق + Routing
│   │
│   ├── 📁 pages/                   # 📄 الصفحات (10)
│   │   ├── 🏠 Dashboard.tsx
│   │   ├── 🔔 AlertQueue.tsx
│   │   ├── ✅ Actions.tsx
│   │   ├── ⚡ AutomatedActions.tsx ⭐
│   │   ├── 📊 CaseReports.tsx
│   │   ├── 🔍 SIEM.tsx
│   │   ├── 📚 Documentation.tsx
│   │   ├── 📖 Playbooks.tsx
│   │   ├── 🧭 Guide.tsx
│   │   └── 🔐 Login.tsx
│   │
│   ├── 📁 components/              # 🧩 المكونات
│   │   ├── AlertModal.tsx
│   │   ├── CaseModal.tsx
│   │   ├── DashboardChart.tsx
│   │   ├── Layout.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Sidebar.tsx
│   │   ├── 📁 figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── 📁 ui/                  # (47 مكون)
│   │
│   ├── 📁 context/                 # 🔄 إدارة الحالة
│   │   ├── AuthContext.tsx         # المصادقة
│   │   └── SOCContext.tsx          # البيانات ⭐
│   │
│   └── 📁 styles/                  # 🎨 التصميم
│       └── globals.css
│
└── 📁 Documentation/                # 📚 التوثيق
    ├── README.md
    ├── QUICK_START.md
    ├── EXPORT_SUMMARY.md
    ├── FILES_CHECKLIST.md
    ├── PROJECT_EXPORT_GUIDE.md
    ├── README_AUTOMATED_ACTIONS.md
    ├── CHANGELOG.md
    └── VISUAL_GUIDE.md (هذا الملف)
```

---

## 🔄 تدفق البيانات

```
┌─────────────────────────────────────────────────────────────┐
│                    User Login (AuthContext)                 │
│                    ✅ isAuthenticated = true                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    App.tsx (Routing)                        │
│            Protected Routes → All Pages                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              SOCContext (State Management)                  │
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │    Alerts     │  │    Cases     │  │ AutomatedActions│ │
│  │  (التنبيهات)  │  │  (الحالات)   │  │  (الإجراءات)    │ │
│  └───────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│          │                 │                    │          │
│          └─────────────────┴────────────────────┘          │
│                            │                               │
│                    LocalStorage                            │
│                  (soc_sim_data_v4)                         │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Dashboard   │    │ Alert Queue  │    │   Actions    │
│              │    │              │    │              │
│ - Stats      │    │ - Table      │    │ - Resolve    │
│ - Charts     │    │ - Filters    │    │ - TP/FP      │
│ - Alerts     │    │ - Assign     │    │ - Cases      │
└──────────────┘    └──────────────┘    └──────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │  Automated Actions      │
                │                         │
                │ - 4-6 actions per alert │
                │ - Toast notifications   │
                │ - Detailed page         │
                └─────────────────────────┘
```

---

## 🏠 الصفحات الرئيسية

### 1. Dashboard 🏠
```
┌─────────────────────────────────────────────────────┐
│                    IRAS Dashboard                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │   Total   │ │  Closed   │ │    TP     │       │
│  │   Alerts  │ │  Alerts   │ │   Cases   │       │
│  │     7     │ │     0     │ │     0     │       │
│  └───────────┘ └───────────┘ └───────────┘       │
│                                                     │
│  ┌─────────────────────┐  ┌──────────────────┐   │
│  │                     │  │                  │   │
│  │   📊 Chart         │  │  Open Alerts     │   │
│  │   Alert Types      │  │                  │   │
│  │   or Severity      │  │  8820 - Critical │   │
│  │                     │  │  8819 - High     │   │
│  │                     │  │  ...             │   │
│  └─────────────────────┘  └──────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Alert Queue 🔔
```
┌─────────────────────────────────────────────────────┐
│                   Alert Queue                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Assigned Alert: You are assigned to 8820          │
│                                                     │
│  🔍 Search  │ 📊 Severity: All  │ 📁 Type: All    │
│                                                     │
│  ┌─────┬──────────────────┬──────────┬──────────┐ │
│  │ ID  │ Alert Rule       │ Severity │ Type     │ │
│  ├─────┼──────────────────┼──────────┼──────────┤ │
│  │8820 │PowerShell Exec   │Critical  │Endpoint  │ │
│  │8819 │Failed SSH        │High      │Network   │ │
│  │8816 │Blocked URL       │High      │Firewall  │ │
│  │...  │...               │...       │...       │ │
│  └─────┴──────────────────┴──────────┴──────────┘ │
│                                                     │
│                          [Prev] Page 1/2 [Next]    │
└─────────────────────────────────────────────────────┘
```

### 3. Automated Actions ⚡ ⭐
```
┌─────────────────────────────────────────────────────────┐
│              Automated Actions Dashboard                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ Total  │ │Success │ │Pending │ │Failed  │         │
│  │   24   │ │   22   │ │   2    │ │   0    │         │
│  └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │  📊 Pie Chart   │  │  📊 Bar Chart    │          │
│  │  By Category    │  │  By Status       │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                         │
│  🔍 Search  │ Status: All  │ Category: All            │
│                                                         │
│  ┌────┬─────────────────────┬──────────┬──────────┐  │
│  │ ▼  │ Action Type         │ Category │ Status   │  │
│  ├────┼─────────────────────┼──────────┼──────────┤  │
│  │ ▶  │Security Notification│Notif.    │Success   │  │
│  │ ▶  │Threat Intelligence  │Invest.   │Success   │  │
│  │ ▶  │Block IP Address     │Contain.  │Success   │  │
│  │ ▼  │SIEM Correlation     │Invest.   │Success   │  │
│  │    │  └─ Step 1: Log Collection (✓)             │  │
│  │    │  └─ Step 2: Pattern Matching (✓)           │  │
│  │    │  └─ Step 3: Timeline Creation (✓)          │  │
│  └────┴─────────────────────┴──────────┴──────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Case Reports 📊
```
┌─────────────────────────────────────────────────────┐
│                  Case Reports                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Total   │ │   True   │ │  False   │          │
│  │  Cases   │ │ Positive │ │ Positive │          │
│  │    0     │ │     0    │ │     0    │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                     │
│  ┌────────┬──────────────────┬──────────┬────────┐│
│  │Case ID │ Alert Rule       │Resolution│ Action ││
│  ├────────┼──────────────────┼──────────┼────────┤│
│  │ (Empty - No cases yet)                        ││
│  │                                                ││
│  │ Resolve alerts to generate case reports       ││
│  └────────┴──────────────────┴──────────┴────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ نظام الإجراءات التلقائية

### التدفق الكامل:

```
┌─────────────────────────────────────────────────────┐
│  Step 1: Alert Detection                           │
│                                                     │
│  Alert 8820 (Critical) Detected                    │
│  ↓                                                  │
│  Is Severity Critical or High? ✅ YES              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Step 2: Generate Automated Actions                │
│                                                     │
│  📧 1. Security Notification         (0.3s) ✓     │
│  🔍 2. Threat Intel Enrichment       (3.4s) ✓     │
│  🛡️ 3. Endpoint Isolation            (2.1s) ✓     │
│  🚫 4. Block IP / Quarantine Email   (1.2s) ✓     │
│  📊 5. SIEM Log Correlation          (5.2s) ✓     │
│  📝 6. Process Termination           (1.2s) ✓     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Step 3: Toast Notification                        │
│                                                     │
│  🚨 Critical Alert Detected!                       │
│  Alert 8820: Suspicious PowerShell Execution       │
│                                                     │
│  Automated Actions Executed:                       │
│  ✓ Security Alert Notification                     │
│  ✓ Threat Intelligence Enrichment                  │
│  ✓ Isolate Endpoint                                │
│  +3 more actions                                   │
│                                                     │
│  [View All Actions]                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Step 4: Save to LocalStorage                      │
│                                                     │
│  soc_sim_data_v4 {                                 │
│    alerts: [...],                                  │
│    cases: [...],                                   │
│    automatedActions: [                             │
│      { id, actionType, status, ... }              │
│    ]                                               │
│  }                                                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Step 5: Display in Automated Actions Page         │
│                                                     │
│  User can:                                         │
│  - View statistics                                 │
│  - See charts                                      │
│  - Filter actions                                  │
│  - Expand rows for details                         │
│  - Review execution timeline                       │
└─────────────────────────────────────────────────────┘
```

### أنواع الإجراءات حسب نوع التنبيه:

```
┌──────────────────────────────────────────────────────┐
│            Alert Type: ENDPOINT                      │
├──────────────────────────────────────────────────────┤
│  If Critical:                                        │
│  ✓ Isolate Endpoint (عزل الجهاز)                    │
│  ✓ Terminate Process (إيقاف العمليات)               │
│  ✓ Security Notification                            │
│  ✓ Threat Intel Enrichment                          │
│  ✓ SIEM Correlation                                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│        Alert Type: NETWORK / FIREWALL                │
├──────────────────────────────────────────────────────┤
│  ✓ Block Malicious IP (حظر IP)                      │
│  ✓ Security Notification                            │
│  ✓ Threat Intel Enrichment                          │
│  ✓ SIEM Correlation                                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│            Alert Type: PHISHING                      │
├──────────────────────────────────────────────────────┤
│  ✓ Quarantine Email (عزل البريد)                    │
│  ✓ Security Notification                            │
│  ✓ Threat Intel Enrichment                          │
│  ✓ SIEM Correlation                                 │
└──────────────────────────────────────────────────────┘
```

---

## 🧩 المكونات

### Layout Structure:

```
┌──────────────────────────────────────────────────────┐
│                      App.tsx                         │
│  (Router + Protected Routes + Toaster)               │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              AuthProvider                      │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │           SOCProvider                    │ │ │
│  │  │  ┌────────────────────────────────────┐ │ │ │
│  │  │  │          Layout                    │ │ │ │
│  │  │  │  ┌──────────┐  ┌───────────────┐ │ │ │ │
│  │  │  │  │ Sidebar  │  │  Page Content │ │ │ │ │
│  │  │  │  │          │  │               │ │ │ │ │
│  │  │  │  │ - Home   │  │  PageHeader   │ │ │ │ │
│  │  │  │  │ - Queue  │  │  + Content    │ │ │ │ │
│  │  │  │  │ - Auto   │  │               │ │ │ │ │
│  │  │  │  │ - Cases  │  │               │ │ │ │ │
│  │  │  │  │ ...      │  │               │ │ │ │ │
│  │  │  │  └──────────┘  └───────────────┘ │ │ │ │
│  │  │  └────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Component Hierarchy:

```
App.tsx
  ├── AuthProvider
  │   └── SOCProvider
  │       ├── Router
  │       │   ├── /login → Login.tsx
  │       │   └── /* → Layout
  │       │       ├── Sidebar.tsx
  │       │       └── Pages:
  │       │           ├── Dashboard.tsx
  │       │           │   ├── PageHeader
  │       │           │   ├── Stats Cards
  │       │           │   ├── DashboardChart
  │       │           │   └── AlertModal
  │       │           │
  │       │           ├── AlertQueue.tsx
  │       │           │   ├── PageHeader
  │       │           │   ├── Filters
  │       │           │   ├── Table
  │       │           │   └── AlertModal
  │       │           │
  │       │           ├── AutomatedActions.tsx ⭐
  │       │           │   ├── PageHeader
  │       │           │   ├── Stats (6 cards)
  │       │           │   ├── Charts (Pie + Bar)
  │       │           │   ├── Filters
  │       │           │   └── Expandable Table
  │       │           │
  │       │           ├── CaseReports.tsx
  │       │           │   ├── PageHeader
  │       │           │   ├── Stats
  │       │           │   ├── Table
  │       │           │   └── CaseModal
  │       │           │
  │       │           └── ... (Other Pages)
  │       │
  │       └── Toaster (sonner)
  │
  └── GlobalStyles (globals.css)
```

---

## 🎨 التصميم البصري

### Color Scheme:

```
┌─────────────────────────────────────────┐
│           IRAS Color Palette            │
├─────────────────────────────────────────┤
│                                         │
│  🟢 Primary (Accent)                    │
│  #A7EA3B ████████████ (أخضر)           │
│                                         │
│  🔵 Background                          │
│  #0F1722 ████████████ (أزرق داكن)      │
│                                         │
│  ⬛ Card                                │
│  #19232C ████████████ (رمادي داكن)     │
│                                         │
│  ⬜ Text                                │
│  #E6EEF6 ████████████ (أبيض)           │
│                                         │
│  ⚪ Muted                               │
│  #98A0AC ████████████ (رمادي)          │
│                                         │
│  🔴 Critical                            │
│  #FF6B6B ████████████ (أحمر)           │
│                                         │
│  🟡 High                                │
│  #FFD966 ████████████ (أصفر)           │
│                                         │
│  🔵 Medium                              │
│  #60A5FA ████████████ (أزرق)           │
│                                         │
│  🟢 Low                                 │
│  #A7F3D0 ████████████ (أخضر فاتح)      │
│                                         │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints:

```
┌─────────────────────────────────────────┐
│           Screen Sizes                  │
├─────────────────────────────────────────┤
│                                         │
│  📱 Mobile (< 640px)                    │
│  ├── Hamburger Menu                     │
│  ├── Bottom Navigation (5 items)       │
│  └── Single Column Layout              │
│                                         │
│  📱 Tablet (640px - 1024px)            │
│  ├── Hamburger Menu                     │
│  ├── Bottom Navigation                 │
│  └── 2 Column Grid                     │
│                                         │
│  💻 Desktop (> 1024px)                 │
│  ├── Fixed Sidebar (260px)             │
│  ├── No Bottom Navigation              │
│  └── Multi Column Grid                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔑 نقاط رئيسية للتذكر

### 1. البيانات:
```javascript
// كل شيء محفوظ في LocalStorage
localStorage.getItem('soc_sim_data_v4')

// البنية:
{
  alerts: [],           // التنبيهات
  cases: [],            // الحالات
  automatedActions: []  // الإجراءات (جديد!)
}
```

### 2. التشغيل التلقائي:
```javascript
// في SOCContext.tsx
useEffect(() => {
  // مراقبة التنبيهات الجديدة
  const highPriority = alerts.filter(
    a => a.severity === 'Critical' || a.severity === 'High'
  );
  
  // توليد الإجراءات تلقائياً
  // عرض Toast
  // حفظ في State + LocalStorage
}, [alerts]);
```

### 3. المسارات:
```
/                    → Dashboard
/queue               → Alert Queue
/actions             → Actions (Closed)
/automated-actions   → Automated Actions ⭐
/cases               → Case Reports
/siem                → SIEM
/docs                → Documentation
/playbooks           → Playbooks
/guide               → Guide
/login               → Login
```

---

## 🎯 خلاصة مرئية

```
┌──────────────────────────────────────────────────────┐
│                  IRAS SYSTEM MAP                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  👤 User Login                                       │
│      ↓                                               │
│  🏠 Dashboard (إحصائيات + رسوم بيانية)              │
│      ↓                                               │
│  🔔 Alert Queue (عرض التنبيهات)                     │
│      ↓                                               │
│  ⚡ NEW ALERT DETECTED! (Critical/High)              │
│      ↓                                               │
│  🤖 Automated Actions Triggered (4-6 actions)        │
│      ├─ 📧 Notification                             │
│      ├─ 🔍 Threat Intel                             │
│      ├─ 🛡️ Containment                              │
│      └─ 📊 Correlation                              │
│      ↓                                               │
│  🔔 Toast Notification (مع أسماء الإجراءات)         │
│      ↓                                               │
│  ⚡ Automated Actions Page (تفاصيل كاملة)            │
│      ├─ Stats                                        │
│      ├─ Charts                                       │
│      ├─ Filters                                      │
│      └─ Expandable Table                            │
│      ↓                                               │
│  ✅ Resolve Alert (TP/FP)                            │
│      ↓                                               │
│  📊 Case Report Created                              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

**🎨 انتهى الدليل المرئي! استمتع بالمشروع! 🚀**

راجع [README.md](./README.md) للتوثيق الكامل  
راجع [QUICK_START.md](./QUICK_START.md) للبدء السريع
