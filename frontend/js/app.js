/**
 * App Master Coordinator - First Aid System
 * Manages Theme, Bilingual Localization, Navigation & Page Initializers
 * Author: Ziad Asaad - Frontend / UX Lead & Author
 */

const App = {
  currentTheme: 'light',
  currentLang: 'ar',

  // UI Strings Dictionary
  i18n: {
    ar: {
      appName: 'VENOM مسعف الذكي',
      appTagline: 'منظومة الإسعاف والتوجيه الطبي الفوري',
      emergencyWarning: 'هذا النظام للتوعية والإسعاف الأولي السريع — في حالات الطوارئ القصوى اتصل بـ 123 فوراً',
      callNow: 'اتصل الآن (123)',
      navHome: 'الرئيسية',
      navChat: 'المساعد الإسعافي',
      navTriage: 'الفرز الطبي',
      navContacts: 'أرقام الطوارئ',
      navLearn: 'تعلّم الإسعافات',
      quickSearchPlaceholder: 'صف الإصابة أو الحالة الإسعافية (نزيف شرياني، حروق، بلع لسان، غصة، إغماء)...',
            teamBtnCredit: 'تيم VENOM التقني (6 أعضاء)',
      teamBtnBadge: 'تيم VENOM التقني',
      footerSupervisor: 'منظومة الطوارئ الذكية — تطوير وإشراف:',
      footerTrusted: 'إرشادات طبية موثوقة',
      footerOffline: 'يعمل أوفلاين وسحابياً',
      footerResponsive: 'متوافق مع الهواتف',
      startAssessment: 'عرض بروتوكول الإسعاف'
    },
    en: {
      appName: 'VENOM — Smart First Aid',
      appTagline: 'AI-Powered First Aid Triage & Emergency Guidance System',
      emergencyWarning: 'For educational & immediate first aid guidance only — in real emergencies dial 123 immediately',
      callNow: 'Call 123 Now',
      navHome: 'Home',
      navChat: 'AI Assistant',
      navTriage: 'Quick Triage',
      navContacts: 'Clinics & Contacts',
      navLearn: 'Learn & Quiz',
      quickSearchPlaceholder: 'Describe the emergency (e.g. boiling water burn, choking, fainting)...',
            teamBtnCredit: 'VENOM Tech Team (6 Members)',
      teamBtnBadge: 'VENOM Tech Team',
      footerSupervisor: 'Smart Emergency System — Developed & Supervised by:',
      footerTrusted: 'Verified Medical Protocols',
      footerOffline: 'Works Offline & Cloud',
      footerResponsive: 'Mobile Optimized',
      startAssessment: 'Start Triage'
    }
  },

  init() {
    this.initSplashScreen();
    this.initTheme();
    this.initLanguage();
    this.bindGlobalEvents();
    this.highlightActiveNav();
    this.initFloatingSOS();
    this.initNetworkStatus();
    this.initBodyMap();
    this.registerServiceWorker();
    if (window.TeamModal) { window.TeamModal.init(); }
  },

  /* ========================================================================
     0. LUXURIOUS NATIVE PWA SPLASH SCREEN
     ======================================================================== */
  initSplashScreen() {
    const splash = document.getElementById('app-splash-screen');
    if (!splash) return;

    const bar = document.getElementById('splash-progress-bar');
    const statusText = document.getElementById('splash-status-text');

    let dismissed = false;
    const dismissSplash = () => {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add('splash-hidden');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 520);
    };

    splash.addEventListener('click', dismissSplash);
    splash.addEventListener('touchstart', dismissSplash, { passive: true });

    // Exactly 1.5 seconds total choreographed progression
    setTimeout(() => {
      if (bar) bar.style.width = '45%';
      if (statusText) {
        statusText.textContent = this.currentLang === 'en' ? 'Initializing Medical Core...' : 'تهيئة المنظومة الطبية والذكاء الإسعافي...';
      }
    }, 150);

    setTimeout(() => {
      if (bar) bar.style.width = '80%';
      if (statusText) {
        statusText.textContent = this.currentLang === 'en' ? 'Loading Medical Protocols...' : 'جاري فحص بروتوكولات الطوارئ المعتمدة...';
      }
    }, 600);

    setTimeout(() => {
      if (bar) bar.style.width = '100%';
      if (statusText) {
        statusText.textContent = this.currentLang === 'en' ? 'Ready to Assist ✓' : 'جاهز للإنقاذ الطبي المباشر ✓';
        statusText.style.color = '#16a34a';
      }
    }, 1050);

    // Smooth native dismiss at exactly 1.5s (1500ms)
    setTimeout(() => {
      dismissSplash();
    }, 1500);
  },

  /* ========================================================================
     THEME MANAGEMENT (Dark / Light Mode)
     ======================================================================== */
  initTheme() {
    const savedTheme = localStorage.getItem('fa_theme') || (document.documentElement.getAttribute('data-theme') || 'light');
    this.setTheme(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(nextTheme);
      });
    }
  },

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('fa_theme', theme);

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    }

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
  },

  /* ========================================================================
     LANGUAGE MANAGEMENT (Arabic RTL / English LTR)
     ======================================================================== */
  initLanguage() {
    const savedLang = localStorage.getItem('fa_lang') || 'ar';
    this.setLanguage(savedLang);

    const langToggleBtn = document.getElementById('lang-switch-btn');
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', () => {
        const nextLang = this.currentLang === 'ar' ? 'en' : 'ar';
        this.setLanguage(nextLang);
      });
    }
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('fa_lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    const langBtnText = document.getElementById('lang-btn-text');
    if (langBtnText) {
      langBtnText.innerText = lang === 'ar' ? 'English' : 'العربية';
    }

    // Apply translations to data-i18n elements
    this.translateDOM();
    if (window.TeamModal && window.TeamModal.isOpen) { window.TeamModal.open(); }
  },

  translateDOM() {
    const dict = this.i18n[this.currentLang] || this.i18n.ar;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerText = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });
  },

  /* ========================================================================
     GLOBAL BINDINGS & SEARCH REDIRECTION
     ======================================================================== */
  bindGlobalEvents() {
    // Hero Quick Search Form
    const searchForm = document.getElementById('hero-search-form');
    const searchInput = document.getElementById('hero-search-input');

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) {
          // If already on chat page, send directly, else redirect
          if (window.location.pathname.includes('chat.html')) {
            if (typeof ChatController !== 'undefined') {
              ChatController.inputField.value = q;
              ChatController.handleSendMessage();
            }
          } else {
            // Determine relative path to chat.html
            const prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
            window.location.href = `${prefix}chat.html?q=${encodeURIComponent(q)}`;
          }
        }
      });
    }

    // Check URL params on chat page
    if (window.location.pathname.includes('chat.html')) {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q');
      if (initialQuery && typeof ChatController !== 'undefined') {
        setTimeout(() => {
          ChatController.inputField.value = initialQuery;
          ChatController.handleSendMessage();
        }, 300);
      }
    }
  },

  highlightActiveNav() {
    const currentPath = window.location.pathname;
    
    // Desktop Nav
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (currentPath.endsWith(href) || (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('frontend') || currentPath.endsWith('frontend/'))))) {
        link.classList.add('active');
      }
    });

    // Mobile Bottom Nav
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (currentPath.endsWith(href) || (href.includes('index.html') && (currentPath.endsWith('/') || currentPath.endsWith('frontend') || currentPath.endsWith('frontend/'))))) {
        link.classList.add('active');
      }
    });
  },

  /* ========================================================================
     FLOATING SMART SOS DOCK (Interactive 1-Tap Emergency Dialer)
     ======================================================================== */
  initFloatingSOS() {
    let triggerBtn = document.getElementById('sosTriggerBtn');
    let menu = document.getElementById('sosExpandMenu');
    let closeBtn = document.getElementById('sosMenuClose');

    if (!triggerBtn) {
      const dock = document.createElement('aside');
      dock.className = 'floating-sos-dock';
      dock.id = 'floatingSosDock';
      dock.innerHTML = `
        <div class="sos-expand-menu" id="sosExpandMenu" aria-hidden="true">
          <div class="sos-menu-header">
            <span class="sos-menu-title"><i class="fa-solid fa-triangle-exclamation" style="color: #dc2626;"></i> طوارئ مصر السريعة</span>
            <button type="button" class="sos-menu-close" id="sosMenuClose" aria-label="إغلاق">&times;</button>
          </div>
          <div class="sos-menu-items">
            <a href="tel:123" class="sos-menu-item red">
              <div class="sos-item-icon"><i class="fa-solid fa-truck-medical"></i></div>
              <div class="sos-item-details">
                <span class="sos-item-name">إسعاف مصر</span>
                <span class="sos-item-sub">حالات الخطر والإنقاذ</span>
              </div>
              <span class="sos-item-num">123</span>
            </a>
            <a href="tel:122" class="sos-menu-item blue">
              <div class="sos-item-icon"><i class="fa-solid fa-shield-halved"></i></div>
              <div class="sos-item-details">
                <span class="sos-item-name">شرطة النجدة</span>
                <span class="sos-item-sub">البلاغات والحوادث</span>
              </div>
              <span class="sos-item-num">122</span>
            </a>
            <a href="tel:180" class="sos-menu-item orange">
              <div class="sos-item-icon"><i class="fa-solid fa-fire-extinguisher"></i></div>
              <div class="sos-item-details">
                <span class="sos-item-name">الحماية المدنية</span>
                <span class="sos-item-sub">المطافئ والإنقاذ</span>
              </div>
              <span class="sos-item-num">180</span>
            </a>
          </div>
        </div>
        <button type="button" class="sos-trigger-btn" id="sosTriggerBtn" aria-label="أرقام الطوارئ السريعة">
          <span class="sos-pulse-ring"></span>
          <span class="sos-pulse-ring-2"></span>
          <i class="fa-solid fa-phone-volume"></i>
          <span class="sos-trigger-text">طوارئ SOS</span>
        </button>
      `;
      document.body.appendChild(dock);
      triggerBtn = document.getElementById('sosTriggerBtn');
      menu = document.getElementById('sosExpandMenu');
      closeBtn = document.getElementById('sosMenuClose');
    }

    if (triggerBtn && menu) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.remove('open');
        });
      }

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !triggerBtn.contains(e.target)) {
          menu.classList.remove('open');
        }
      });

      // Press Escape to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          menu.classList.remove('open');
        }
      });
    }
  },

  /* ========================================================================
     INTERACTIVE BODY MAP CONTROLLER (Section 2.5 - Visual Symptom Checker)
     ======================================================================== */
  initBodyMap() {
    const mapSection = document.getElementById('bodyMapSection');
    if (!mapSection) return;

    const zonesData = {
      head: {
        title: 'إصابات وطوارئ الرأس والدماغ',
        subtitle: 'الارتجاج، النزيف الدماغي، فقدان الوعي، علامات السكتة الدماغية (FAST)',
        icon: '<i class="fa-solid fa-brain"></i>',
        severity: 'كود أحمر / برتقالي',
        alert: 'علامات السكتة الدماغية (انحراف الوجه، ثقل اللسان، ضعف الذراع) تستوجب نقل المريض فوراً للمستشفى خلال أقل من 3 ساعات.',
        steps: [
          '<strong>فقدان الوعي مع وجود تنفس:</strong> ضعه فوراً في وضع الإفاقة الجانبي لمنع اختناقه باللسان أو القيء وراقب تنفسه باستمرار.',
          '<strong>ضربة الرأس والارتجاج:</strong> لا تسمح للمصاب بالنوم إذا كان يعاني من تقيؤ متكرر، دوار شديد، أو تشوش في الرؤية واطلب 123 فوراً.',
          '<strong>اشتباه كسر الرقبة والجمجمة:</strong> لا تحرك الرأس أو الرقبة نهائياً وثبت الرأس بين يديك حتى وصول المسعفين.'
        ],
        query: 'ارتجاج+المخ+نزيف+الرأس+فقدان+الوعي'
      },
      face: {
        title: 'طوارئ الوجه والعينين والفك',
        subtitle: 'نزيف الأنف (الرعاف)، دخول مواد كيميائية بالعين، كسور الفك والأسنان',
        icon: '<i class="fa-solid fa-eye"></i>',
        severity: 'كود أصفر / برتقالي',
        alert: 'عند دخول مادة كيميائية أو سائل تنظيف بالعين، ابدأ غسيل العين بالماء الجاري فوراً لمدة 15 دقيقة بدون فركها.',
        steps: [
          '<strong>نزيف الأنف (الرعاف):</strong> اجلس مائلاً قليلاً للأمام واضغط بإصبعيك على أرنبة الأنف اللينة لمدة 10 دقائق متواصلة (ممنوع إرجاع الرأس للخلف).',
          '<strong>حروق ومواد العين الكيميائية:</strong> افتح الجفنين واغسل العين المصابة بماء صنبور فاتر جارٍ من الداخل إلى الخارج لمدة 15-20 دقيقة.',
          '<strong>خلع وسقوط الأسنان بحادث:</strong> امسك السن من التاج (وليس الجذر)، واشطفها بلطف بالحليب أو محلول ملحي، وتوجه لطبيب الأسنان خلال ساعة.'
        ],
        query: 'نزيف+الأنف+حروق+العين+كسر+الفك'
      },
      neck: {
        title: 'طوارئ الرقبة ومجرى الهواء',
        subtitle: 'انسداد مجرى الهواء، النزيف الشرياني السباتي، كسور الفقرات العنقية',
        icon: '<i class="fa-solid fa-lungs"></i>',
        severity: 'كود أحمر (خطر داهم)',
        alert: 'أي نزيف نافذ في الرقبة يجب الضغط عليه مباشرة بشاش معقم، مع تجنب الضغط على الشريانين السباتيين معاً في آن واحد.',
        steps: [
          '<strong>انسداد القصبة الهوائية:</strong> تحقق فوراً من سلامة مجرى الهواء، وفي حال انسداده ابدأ مناورات فتح مجرى الهواء وإزالة أي جسم غريب ظاهر.',
          '<strong>حوادث السقوط واشتباه كسر الرقبة:</strong> ثبّت الرأس والرقبة والكتفين في خط مستقيم واحد دون أي التواء منعاً لحدوث شلل رباعي.',
          '<strong>النزيف الشرياني في الرقبة:</strong> اضغط فوراً بضمادة معقمة على موضع الجرح بدقة، واتصل بـ 123 فوراً.'
        ],
        query: 'طوارئ+الرقبة+مجرى+الهواء+كسر+العمود+الفقري'
      },
      chest: {
        title: 'طوارئ الصدر والقلب والتنفس',
        subtitle: 'ألم واعتصار الصدر (اشتباه الجلطة)، ضيق التنفس، الغصة والاختناق',
        icon: '<i class="fa-solid fa-heart-pulse"></i>',
        severity: 'كود أحمر (حرج جداً)',
        alert: 'توقف القلب أو التنفس يستوجب الضغطات الصدرية الفورية (110 BPM) والاتصال بـ 123 بدون أي تأخير.',
        steps: [
          '<strong>ألم الصدر والاشتباه بالذبحة/الجلطة:</strong> اجعل المصاب في وضع نصف جالس، واطلب منه الراحة التامة ومضغ قرص أسبرين (إذا لم تكن لديه حساسية أو نزيف).',
          '<strong>الغصة والاختناق (انسداد مجرى الهواء):</strong> قم بإجراء مناورة هايمليخ (5 ضربات ظهرية تليها 5 ضغطات بطنية للأعلى والداخل).',
          '<strong>توقف عضلة القلب:</strong> ابدأ ضغطات الصدر (30 ضغطة تليها نفسا إنقاذ) بعمق 5-6 سم بمعدل 110 ضغطة/دقيقة.'
        ],
        query: 'إنعاش+قلبي+CPR+ألم+الصدر'
      },
      abdomen: {
        title: 'طوارئ البطن والمعدة والجهاز الهضمي',
        subtitle: 'التسمم بالمنظفات والمواد الكيميائية، النزيف الباطني، المغص الكلوي الحاد',
        icon: '<i class="fa-solid fa-circle-radiation"></i>',
        severity: 'كود برتقالي / أصفر',
        alert: 'في حالات ابتلاع مواد كاوية (كلور، فلاش، أحماض) يُمنع منعاً باتاً إجبار المصاب على التقيؤ أو إعطاؤه حليباً.',
        steps: [
          '<strong>التسمم بالمواد الكاوية أو المنظفات:</strong> انقل المصاب للهواء الطلق، واحتفظ بعبوة المادة السامة، واتصل بمركز السموم فوراً.',
          '<strong>النزيف الداخلي أو الكدمات الحادة:</strong> ضع المصاب مستلقياً على ظهره مع رفع الساقين 30 سم لتنشيط الدورة الدموية وغطّه للتدفئة.',
          '<strong>المغص الحاد والاشتباه بالزائدة:</strong> امنع المصاب من تناول المسكنات القوية أو الأكل والشرب حتى يفحصه الطبيب.'
        ],
        query: 'تسمم+غذائي+مواد+كيميائية'
      },
      arms: {
        title: 'طوارئ الكتفين والذراعين',
        subtitle: 'خلع الكتف، كسر العضد، النزيف الشرياني العضدي (Brachial)',
        icon: '<i class="fa-solid fa-hand-fist"></i>',
        severity: 'كود أصفر / برتقالي',
        alert: 'لا تحاول أبداً إعادة عظمة الكتف المخلوعة أو الكسر المشوه إلى مكانها بنفسك تجنباً لقطع الأعصاب والأوعية الدموية.',
        steps: [
          '<strong>خلع الكتف أو كسر عظمة العضد:</strong> ثبت الذراع المصابة في الوضعية المريحة للمريض باستخدام علّاقة عنقية وشال مثلث.',
          '<strong>النزيف الشرياني في الذراع:</strong> اضغط بقوة على موضع الجرح بقطعة قماش معقمة، وارفع الذراع المصابة فوق مستوى القلب.',
          '<strong>تطبيق الكمادات الباردة:</strong> ضع كمادات ثلج غير مباشرة لتقليل التورم وتخفيف الألم حتى الوصول للمستشفى.'
        ],
        query: 'كسر+الذراع+خلع+الكتف+نزيف+شرياني'
      },
      hands: {
        title: 'طوارئ اليدين والمعصمين والأصابع',
        subtitle: 'الحروق الحرارية والكي بالسوائل، الجروح القطعية، كسور وبتر الأصابع',
        icon: '<i class="fa-solid fa-hand-holding-medical"></i>',
        severity: 'كود أصفر / برتقالي',
        alert: 'في حالات بتر الأصابع: لف الجزء المبتور في شاش معقم وضعه في كيس جاف محكم، ثم ضع الكيس داخل وعاء ثلج (لا تضع العضو في الماء مباشرة).',
        steps: [
          '<strong>حروق اليدين بالماء الساخن أو النار:</strong> ضع اليد فوراً تحت ماء الصنبور الفاتر الجاري لمدة 15-20 دقيقة (ممنوع الثلج أو معجون الأسنان).',
          '<strong>النزيف الحاد من راحة اليد أو الأصابع:</strong> اضغط بضمادة معقمة واطلب من المصاب قبض يده فوق الشاش مع رفعها فوق مستوى القلب.',
          '<strong>كسر المعصم (Colles Fracture):</strong> ثبّت المعصم بجبيرة مسطحة تمتد من منتصف الساعد حتى أطراف الأصابع.'
        ],
        query: 'حروق+اليد+كسر+المعصم+بتر+الأصابع'
      },
      legs: {
        title: 'طوارئ الفخذين والركبتين',
        subtitle: 'كسور عظم الفخذ (Femur)، النزيف الشرياني الفخذي، تمزق أربطة الركبة',
        icon: '<i class="fa-solid fa-bone"></i>',
        severity: 'كود أحمر / برتقالي',
        alert: 'كسر عظم الفخذ قد يسبب نزيفاً داخلياً حاداً يصل لـ 1.5 لتر دم؛ راقب علامات الصدمة (شحوب، تعرق بارد، سرعة نبض) واطلب 123 فوراً.',
        steps: [
          '<strong>كسر عظم الفخذ:</strong> امنع المصاب من الحركة تماماً، وثبت الساق المصابة بالساق السليمة برباط عريض في 4 أماكن.',
          '<strong>النزيف الشرياني الفخذي:</strong> اضغط بكلتا يديك وبكل ثقلك بضمادة ضاغطة على الجرح، وفي الحالات القصوى استخدم حزام تورنيكيت ضاغط.',
          '<strong>إصابات الركبة والأربطة:</strong> ضع كمادات ثلج وثبت الركبة بوضعية مريحة دون إجبارها على الثني.'
        ],
        query: 'كسر+الفخذ+نزيف+شرياني+فخذي'
      },
      feet: {
        title: 'طوارئ الساقين والقدمين والكاحل',
        subtitle: 'التواء الكاحل الحاد (Sprain)، كسر الساق، لدغات الثعابين والعقارب',
        icon: '<i class="fa-solid fa-person-walking"></i>',
        severity: 'كود أصفر',
        alert: 'في لدغات الثعابين والعقارب: ممنوع جرح الجلد أو شفط السم أو وضع الثلج أو ربط رباط ضاغط قاطع للدم.',
        steps: [
          '<strong>التواء الكاحل وتمزق الأربطة:</strong> طبق بروتوكول RICE: الراحة (Rest)، كمادات ثلج (Ice)، رباط ضاغط (Compress)، ورفع القدم (Elevate).',
          '<strong>كسور الساق المكشوفة (المركبة):</strong> غطِّ العظم البارز بشاش معقم رطب دون محاولة إرجاعه وثبت الطرف بجبيرة.',
          '<strong>لدغات الثعابين والعقارب:</strong> هدئ المصاب واجعله ساكناً تماماً لإبطاء انتشار السم، واغسل مكان اللدغة بالماء والصابون بهدوء وتوجه للمستشفى.'
        ],
        query: 'التواء+الكاحل+كسر+الساق+لدغات+العقارب'
      }
    };

    const updateZoneUI = (zoneKey) => {
      const data = zonesData[zoneKey];
      if (!data) return;

      // Update pills
      document.querySelectorAll('.bodymap-zone-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.zone === zoneKey);
      });

      // Update SVG nodes
      document.querySelectorAll('.body-zone-group').forEach(grp => {
        grp.classList.toggle('active', grp.dataset.zone === zoneKey);
      });

      // Update SVG leader callout badges
      document.querySelectorAll('.hud-badge-item').forEach(badge => {
        badge.classList.toggle('active', badge.dataset.zone === zoneKey);
      });

      // Update Card content
      const iconEl = document.getElementById('bmZoneIcon');
      const titleEl = document.getElementById('bmZoneTitle');
      const subtitleEl = document.getElementById('bmZoneSubtitle');
      const sevEl = document.getElementById('bmSeverityPill');
      const alertEl = document.getElementById('bmAlertText');
      const stepsListEl = document.getElementById('bmStepsList');
      const chatLink = document.getElementById('bmChatLink');

      const isRed = data.severity && data.severity.includes('أحمر');
      const isOrange = data.severity && data.severity.includes('برتقالي') && !isRed;

      if (iconEl) {
        iconEl.innerHTML = data.icon;
        iconEl.classList.toggle('is-emergency-red', isRed);
      }
      if (titleEl) titleEl.innerText = data.title;
      if (subtitleEl) subtitleEl.innerText = data.subtitle;

      if (sevEl) {
        sevEl.className = 'protocol-severity-pill';
        if (isRed) {
          sevEl.classList.add('severity-red');
          sevEl.innerHTML = `<span class="severity-dot red-dot"></span><span>${data.severity}</span>`;
        } else if (isOrange) {
          sevEl.classList.add('severity-orange');
          sevEl.innerHTML = `<span class="severity-dot orange-dot"></span><span>${data.severity}</span>`;
        } else {
          sevEl.classList.add('severity-yellow');
          sevEl.innerHTML = `<span class="severity-dot yellow-dot"></span><span>${data.severity}</span>`;
        }
      }

      if (alertEl) alertEl.innerText = data.alert;
      if (chatLink) chatLink.href = `pages/chat.html?q=${data.query}`;

      if (stepsListEl) {
        stepsListEl.innerHTML = data.steps.map((st, i) => `
          <li><span class="bm-step-num">${i + 1}</span><span>${st}</span></li>
        `).join('');
      }
    };

    // Bind click events on pills
    document.querySelectorAll('.bodymap-zone-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        updateZoneUI(pill.dataset.zone);
      });
    });

    // Bind click events on SVG body zones
    document.querySelectorAll('.body-zone-group').forEach(group => {
      group.addEventListener('click', () => {
        updateZoneUI(group.dataset.zone);
      });
    });

    // Bind click events on SVG HUD callout badges
    document.querySelectorAll('.hud-badge-item').forEach(badge => {
      badge.addEventListener('click', () => {
        updateZoneUI(badge.dataset.zone);
      });
    });
  },

  /* ========================================================================
     SMART NETWORK MONITOR (100% Offline Capability with Zero Cloud Dependency)
     ======================================================================== */
  initNetworkStatus() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      console.log(`[FirstAid System] System running in ${isOnline ? 'Online' : 'Offline'} mode. All clinical NLP rules active.`);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  },

  /* ========================================================================
     PWA SERVICE WORKER REGISTRATION (Enables true offline loading on Vercel)
     ======================================================================== */
  registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully at root scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }
  }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

if (typeof window !== 'undefined') {
  window.App = App;
}
