# 🚑 VENOM — منظومة الإسعاف والتوجيه الطبي الفوري
### AI-Powered First Aid Triage & Emergency Guidance System (PWA)
**Author & Team Lead:** Ziad Asaad (زياد أسعد)

---

## 📌 نبذة عن المشروع
منظومة إسعافات أولية ذكية وتفاعلية متوافقة مع معايير الـ PWA، تعمل بالكامل **أوفلاين بدون إنترنت (100% Client-Side)**، وتوفر:
1. **فرز سريري فوري (Clinical Triage Tree):** لتحديد خطورة الحالة (أخضر / برتقالي / أحمر) وفق المعايير الطبية الدولية (ERC / AHA).
2. **خريطة تشريحية تفاعلية (Interactive Anatomical 3D Map):** لاختيار موضع الإصابة بالضغط المباشر على مجسم الجسم.
3. **مساعد محادثة ذكي (First Aid Chatbot):** للتعامل مع لغة المستخدم اليومية واستخراج بروتوكولات الإسعاف المناسبة.
4. **مسرع الإنعاش القلبي الرئوي (CPR Metronome):** إيقاع صوتي وبصري بمعدل 110 نبضة/دقيقة متوافق مع توصيات جمعية القلب الأمريكية.
5. **دليل الطوارئ والعيادات:** أرقام طوارئ فورية ودليل للعيادات والمراكز الصحية وحساب أقرب نقطة إسعاف.

---

## 🚀 طريقة التشغيل المحلي السريع (Quick Start)

### المتطلبات
* مثبت لديك بيئة **Node.js** (الإصدار 16 أو أحدث).

### الخطوات
1. افتح موجه الأوامر (Terminal / PowerShell) في هذا المجلد:
   ```bash
   cd "B:\task ziad"
   ```
2. شغّل السيرفر المحلي:
   ```bash
   node server.js
   ```
3. افتح المتصفح على أحد الرابطين:
   * من نفس الجهاز: [http://localhost:3000](http://localhost:3000)
   * من الموبايل على نفس شبكة الواي فاي: الرابط الموضح في شاشة السيرفر (مثل `http://192.168.1.xxx:3000`)

---

## 📁 الهيكل التنظيمي للمشروع (Project Structure)

```
task ziad/
├── README.md                          ← هذا الملف (دليل المشروع والتشغيل السريع)
├── FINAL_PROJECT_REPORT.md            ← التقرير الأكاديمي النهائي الشامل للمشروع
├── Ziad_Asaad_Frontend_UX_Report.md   ← تقرير ومصفوفة مهام واجهة المستخدم (Author: Ziad Asaad)
├── server.js                          ← سيرفر Node.js المحلي خفيف وسريع ويدعم الـ IP التلقائي
│
├── docs/
│   └── team_photos_original/          ← الصور الأصلية عالية الدقة لأعضاء الفريق (أرشيف)
│
└── first_aid_system/
    ├── training_data.csv              ← قاعدة بيانات السيناريوهات السريرية والتدريب
    └── frontend/                      ← تطبيق الويب والواجهات الكاملة
        ├── index.html                 ← الشاشة الرئيسية وتجربة الطوارئ
        ├── manifest.json              ← ملف تعريف تطبيق الويب التقدمي (PWA Manifest)
        ├── sw.js                      ← مشغل الذاكرة المخبأة للعمل أوفلاين (Service Worker v62)
        ├── favicon.ico                ← أيقونة المتصفح
        ├── vercel.json                ← إعدادات الاستضافة السحابية على Vercel
        │
        ├── assets/
        │   ├── fontawesome/           ← خطوط وأيقونات Font Awesome محلية أوفلاين
        │   └── images/                ← صور وأيقونات التطبيق المحسّنة (بما فيها حقيبة الإسعاف والهاتف 3D)
        │
        ├── components/                ← المكونات التفاعلية (Web Components / Widgets)
        │   ├── severity-badge.js      ← شارات قياس الخطورة
        │   ├── step-card.js           ← بطاقات خطوات الإسعاف
        │   └── team-modal.js          ← نافذة استعراض أعضاء الفريق
        │
        ├── css/                       ← ملفات التنسيق والتصميم
        │   ├── main.css               ← التنسيق العام وتصميم الواجهات
        │   ├── dark-mode.css          ← دعم الوضع الداكن (Dark Mode)
        │   ├── chat.css               ← تصميم واجهة المحادثة
        │   └── triage.css             ← تصميم شاشة الفرز التفاعلي
        │
        ├── js/                        ← المنطق البرمجي (Client-Side Logic)
        │   ├── app.js                 ← المتحكم العام بالنظام
        │   ├── api.js                 ← محرك الذكاء السريري والفرز الطبي المحلي
        │   ├── chat.js                ← منطق الشات والتوجيه الفوري
        │   ├── triage.js              ← منطق أسئلة الفرز التفاعلية
        │   ├── voice.js               ← دعم الإدخال والأوامر الصوتية
        │   └── map.js                 ← دليل العيادات ومحاكاة الموقع
        │
        └── pages/                     ← الصفحات الفرعية
            ├── chat.html              ← صفحة الشات الذكي
            ├── triage.html            ← صفحة الفرز الطبي الشجري
            ├── contacts.html          ← صفحة أرقام الطوارئ والعيادات
            └── learn.html             ← صفحة التعلّم ومسرع CPR
```

---

## 👥 فريق العمل ومصفوفة المسؤوليات (Team Members)

| العضو | الاسم | الدور البرمجي والمسؤولية التقنية |
| :---: | :--- | :--- |
| **VENOM-01** | **زياد أسعد (Ziad Asaad)** *(Project Lead & System Author)* | **Frontend / UI/UX Lead & PWA Architecture** |
| **VENOM-02** | **فرح الشربيني** | **Data Engineering & Clinical Dataset** |
| **VENOM-03** | **سيف الإسلام عادل** | **IR Engine & Clinical Knowledge Retrieval** |
| **VENOM-04** | **رضا القبلاوي** | **ML / NLU & Conversational Chatbot** |
| **VENOM-05** | **جميلة توفيق** | **Knowledge Base & Clinical Inference Tree** |
| **VENOM-06** | **ميرنا هاني** | **Backend, API Architecture & Integration** |

---

## 👨‍💻 المؤلف وحقوق التطوير
* **المؤلف والمهندس الرئيسي للواجهات والـ PWA:** [زياد أسعد (Ziad Asaad)](https://ziadasaad.vercel.app/)
* **LinkedIn:** [Zeyad Asaad](https://www.linkedin.com/in/zeyad-asaad-469b10387)
