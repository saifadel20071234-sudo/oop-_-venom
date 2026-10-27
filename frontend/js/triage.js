/**
 * Triage Wizard Controller
 * Manages the 3-step interactive clinical triage evaluation
 * Author: Ziad Asaad - Frontend / UX Lead & Author
 */

const TriageController = {
  currentStep: 1,
  selectedCategory: null,
  selectedSymptoms: [],

  // Dynamic symptoms database by category
  symptomsDatabase: {
    burns: {
      title_ar: 'حروق وإصابات حرارية',
      title_en: 'Burns & Scalds',
      symptoms: [
        { id: 'b1', name: 'احمرار وألم خفيف بالجلد بدون فقاعات', name_en: 'Redness and mild pain, no blisters', critical: false },
        { id: 'b2', name: 'ظهور فقاقيع مائية منتفخة (أكياس سوائل)', name_en: 'Water blisters present', critical: false },
        { id: 'b3', name: 'تفحم أو تحول الجلد إلى اللون الأبيض/الرمادي', name_en: 'Charred skin, white or dark leathery', critical: true },
        { id: 'b4', name: 'الحرق في الوجه أو العينين أو مجرى التنفس', name_en: 'Burn located on face, eyes, or airway', critical: true },
        { id: 'b5', name: 'الحرق يغطي مساحة كبيرة (أكبر من مساحة كف اليد مرتين)', name_en: 'Burn covers large area (> 2 hand sizes)', critical: true }
      ]
    },
    bleeding: {
      title_ar: 'نزيف وجروح مفتوحة',
      title_en: 'Bleeding & Open Wounds',
      symptoms: [
        { id: 'bl1', name: 'خدش سطحي أو جرح بسيط توقف نزيفه بالضغط', name_en: 'Minor cut/scrape, bleeding stopped with pressure', critical: false },
        { id: 'bl2', name: 'نزيف متواصل لا يتوقف بعد 5 دقائق من الضغط', name_en: 'Continuous bleeding after 5 mins of pressure', critical: false },
        { id: 'bl3', name: 'الدم يندفع أو ينبض بغزارة من الجرح (نزيف شرياني)', name_en: 'Spurting or pulsating blood (arterial bleed)', critical: true },
        { id: 'bl4', name: 'وجود جسم غريب مغروس بعمق داخل الجرح (سكين/زجاج)', name_en: 'Embedded foreign object inside the wound', critical: true },
        { id: 'bl5', name: 'المصاب يشعر بشحوب شديد، تعرق بارد، أو دوار حاد (صدمة)', name_en: 'Signs of shock: pale skin, cold sweat, dizziness', critical: true }
      ]
    },
    choking: {
      title_ar: 'اختناق وانسداد مجرى التنفس',
      title_en: 'Choking & Airway Obstruction',
      symptoms: [
        { id: 'ch1', name: 'المصاب يسعل بصوت مسموع وقادر على التحدث جزئياً', name_en: 'Victim is coughing forcefully, can talk slightly', critical: false },
        { id: 'ch2', name: 'عاجز تماماً عن الكلام أو التنفس أو إصدار أي صوت', name_en: 'Unable to speak, breathe, or make any sound', critical: true },
        { id: 'ch3', name: 'المصاب يمسك برقبته بكلتا يديه (العلامة العالمية للاختناق)', name_en: 'Clutching throat with hands (universal choking sign)', critical: true },
        { id: 'ch4', name: 'ازرقاق في الشفتين أو الأظافر أو الوجه', name_en: 'Cyanosis (bluish lips, face, fingernails)', critical: true },
        { id: 'ch5', name: 'فقدان الوعي والسقوط على الأرض', name_en: 'Loss of consciousness and collapse', critical: true }
      ]
    },
    cpr: {
      title_ar: 'توقف قلب وتنفس (إنعاش)',
      title_en: 'Cardiac Arrest / CPR',
      symptoms: [
        { id: 'cp1', name: 'المصاب فاقد للوعي تماماً ولا يستجيب للصوت أو الهز', name_en: 'Unresponsive to voice and shaking', critical: true },
        { id: 'cp2', name: 'غياب التنفس أو تنفس غير طبيعي (حشرجة أو لهاث متقطع)', name_en: 'No breathing or agonal gasping', critical: true },
        { id: 'cp3', name: 'لا يمكن تحسس نبض في الشريان السباتي بالرقبة', name_en: 'No detectable pulse', critical: true },
        { id: 'cp4', name: 'ألم ضاغط كالصخرة في منتصف الصدر مع ثقل بالذراع', name_en: 'Crushing chest pain radiating to arm', critical: true }
      ]
    },
    fractures: {
      title_ar: 'كسور ورضوض والتواءات',
      title_en: 'Fractures & Sprains',
      symptoms: [
        { id: 'f1', name: 'ألم عند لمس المفصل مع تورم خفيف بعد التواء', name_en: 'Mild pain and swelling after twist', critical: false },
        { id: 'f2', name: 'عجز كامل عن تحميل الوزن أو تحريك العضو المصاب', name_en: 'Inability to bear weight or move the limb', critical: false },
        { id: 'f3', name: 'انحناء غير طبيعي أو تشوه واضح في شكل العظم', name_en: 'Visible deformity or unnatural limb angle', critical: true },
        { id: 'f4', name: 'العظم بارز خارج الجلد مخترقاً الأنسجة (كسر مضاعف)', name_en: 'Compound fracture (bone piercing through skin)', critical: true },
        { id: 'f5', name: 'تنميل كامل أو برودة وازرقاق في أصابع الطرف المصاب', name_en: 'Numbness, loss of pulse or coldness below injury', critical: true }
      ]
    },
    heatstroke: {
      title_ar: 'ضربة شمس وإجهاد حراري',
      title_en: 'Heatstroke & Hyperthermia',
      symptoms: [
        { id: 'h1', name: 'تعرق غزير مع دوخة وعطش وصداع خفيف', name_en: 'Heavy sweating, dizziness, thirst, mild headache', critical: false },
        { id: 'h2', name: 'تقلصات عضلية مؤلمة في الساقين أو البطن', name_en: 'Muscle cramps in legs or abdomen', critical: false },
        { id: 'h3', name: 'توقف العرق والجلد ساخن جداً وجاف وأحمر', name_en: 'Hot, dry, red skin with absence of sweating', critical: true },
        { id: 'h4', name: 'هذيان، تداخل في الكلام، أو ارتباك وفقدان توازن', name_en: 'Confusion, slurred speech, delirium', critical: true },
        { id: 'h5', name: 'تشنجات أو غياب تام عن الوعي', name_en: 'Seizures or unconsciousness', critical: true }
      ]
    },
    poisoning: {
      title_ar: 'تسمم وابتلاع مواد كيميائية',
      title_en: 'Poisoning & Ingestion',
      symptoms: [
        { id: 'p1', name: 'تناول طعام مريب مع غثيان ومغص خفيف', name_en: 'Suspicious food with mild nausea/cramps', critical: false },
        { id: 'p2', name: 'حروق أو احمرار حول الفم بعد ابتلاع مادة تنظيف كاوية', name_en: 'Burns or redness around mouth from chemicals', critical: true },
        { id: 'p3', name: 'تناول جرعة زائدة من أدوية أو مسكنات', name_en: 'Accidental overdose of medication/pills', critical: true },
        { id: 'p4', name: 'صعوبة بالغة في التنفس أو نعاس وتثبيط حاد', name_en: 'Severe respiratory distress or extreme lethargy', critical: true },
        { id: 'p5', name: 'تقيؤ متكرر مدمم أو تشنجات عضلية', name_en: 'Persistent bloody vomiting or tremors', critical: true }
      ]
    },
    allergy: {
      title_ar: 'حساسية مفرطة وصدمة تحسسية',
      title_en: 'Allergic Reaction & Anaphylaxis',
      symptoms: [
        { id: 'al1', name: 'طفح جلدي بسيط وحكة موضعية في مكان لدغة أو طعام', name_en: 'Local rash/itching at sting site', critical: false },
        { id: 'al2', name: 'تورم سريع في الشفتين أو اللسان أو العينين', name_en: 'Rapid swelling of lips, tongue, or eyes', critical: true },
        { id: 'al3', name: 'صوت صفير بالصدر وصعوبة متزايدة في البلع أو التنفس', name_en: 'Wheezing, stridor, severe breathing difficulty', critical: true },
        { id: 'al4', name: 'هبوط مفاجئ في الضغط ودوخة وشعور بالانهيار', name_en: 'Sudden drop in blood pressure, collapse', critical: true }
      ]
    }
  },

  init() {
    this.bindCategoryCards();
    this.bindNavigationButtons();
  },

  bindCategoryCards() {
    const cards = document.querySelectorAll('.category-choice-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedCategory = card.getAttribute('data-category');
        
        // Auto-advance to Step 2
        this.goToStep(2);
      });
    });
  },

  bindNavigationButtons() {
    const nextBtn = document.getElementById('triage-next-btn');
    const backBtn = document.getElementById('triage-back-btn');
    const restartBtn = document.getElementById('triage-restart-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep === 2) {
          this.evaluateAndShowResult();
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.goToStep(this.currentStep - 1);
        }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restart();
      });
    }
  },

  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    // Update Progress bar & steps UI
    const trackerNodes = document.querySelectorAll('.step-tracker-node');
    const progressFill = document.querySelector('.triage-progress-fill');

    trackerNodes.forEach((node, idx) => {
      const nodeStep = idx + 1;
      node.classList.remove('active', 'completed');
      if (nodeStep < stepNumber) {
        node.classList.add('completed');
      } else if (nodeStep === stepNumber) {
        node.classList.add('active');
      }
    });

    if (progressFill) {
      const percentage = stepNumber === 1 ? 0 : stepNumber === 2 ? 50 : 100;
      progressFill.style.width = percentage + '%';
    }

    // Toggle Panes
    document.querySelectorAll('.triage-step-pane').forEach((pane, idx) => {
      pane.classList.toggle('active', (idx + 1) === stepNumber);
    });

    // Populate Step 2 if moving to step 2
    if (stepNumber === 2) {
      this.populateSymptomsStep();
    }

    // Scroll top of card
    const card = document.querySelector('.triage-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  populateSymptomsStep() {
    const container = document.getElementById('symptoms-checklist-container');
    const catData = this.symptomsDatabase[this.selectedCategory] || this.symptomsDatabase.burns;

    if (!container) return;

    const isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';

    // Update Step 2 Subtitle
    const catSubtitle = document.getElementById('symptoms-category-name');
    if (catSubtitle) {
      catSubtitle.innerText = isArabic ? catData.title_ar : catData.title_en;
    }

    container.innerHTML = catData.symptoms.map(sym => `
      <div class="symptom-check-card" data-symptom-id="${sym.id}" onclick="TriageController.toggleSymptom('${sym.id}', this)">
        <div class="symptom-checkbox">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="symptom-info">
          <div class="symptom-name">${isArabic ? sym.name : sym.name_en}</div>
          ${sym.critical ? `<span class="symptom-critical-badge"><i class="fa-solid fa-triangle-exclamation"></i> ${isArabic ? 'علامة خطورة سريرية قصوى' : 'Red Flag Sign'}</span>` : ''}
        </div>
      </div>
    `).join('');

    this.selectedSymptoms = [];
  },

  toggleSymptom(symId, element) {
    element.classList.toggle('checked');
    const symCard = element.querySelector('.symptom-name').innerText;

    if (element.classList.contains('checked')) {
      if (!this.selectedSymptoms.includes(symCard)) {
        this.selectedSymptoms.push(symCard);
      }
    } else {
      this.selectedSymptoms = this.selectedSymptoms.filter(s => s !== symCard);
    }
  },

  async evaluateAndShowResult() {
    const resultContainer = document.getElementById('triage-result-container');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div class="typing-dot" style="margin: 0 auto 16px; width: 16px; height: 16px;"></div>
        <h3 style="color: var(--text-main); font-weight: 800;">جارٍ تقييم الحالة وفق بروتوكولات الفرز الطبي المعتمدة...</h3>
      </div>
    `;

    this.goToStep(3);

    const res = await ApiClient.evaluateTriage(this.selectedCategory, this.selectedSymptoms);
    this.renderResult(res);
  },

  renderResult(res) {
    const resultContainer = document.getElementById('triage-result-container');
    if (!resultContainer) return;

    const isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';
    const severity = (res.severity || 'green').toLowerCase();

    // Red severity alert sound
    if (severity === 'red' && typeof ChatController !== 'undefined') {
      ChatController.playEmergencyAlertBeep();
    }

    const stepsHtml = StepCardComponent.renderSteps(res.steps || []);
    const doDontHtml = StepCardComponent.renderDoDont(res.do_list || [], res.dont_list || []);

    const emergencyCallBox = severity === 'red' ? `
      <div style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); color: #fff; padding: 20px 26px; border-radius: var(--radius-lg); margin: 20px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);">
        <div>
          <h4 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>${isArabic ? 'اتصل بالإسعاف فوراً (123)' : 'Call 123 Ambulance Immediately'}</span>
          </h4>
          <p style="font-size: 0.925rem; opacity: 0.95;">${isArabic ? 'لا تنتظر وصول الدعم، ابدأ خطوات الإسعاف الأولية الموضحة بالأسفل.' : 'Do not delay, call now and follow instructions below.'}</p>
        </div>
        <a href="tel:123" class="emergency-call-btn" style="background: #fff; color: #dc2626; font-size: 1.05rem; padding: 10px 24px; font-weight: 800;">
          <i class="fa-solid fa-phone-volume"></i>
          <span>${isArabic ? 'اتصال مباشر بالإسعاف 123' : 'Dial 123 Now'}</span>
        </a>
      </div>
    ` : '';

    const severityIcon = severity === 'red' ? 'fa-solid fa-circle-exclamation' : severity === 'orange' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check';
    const severityText = severity === 'red' ? (isArabic ? 'حالة حرجة / طوارئ قصوى' : 'Critical / Emergency') : severity === 'orange' ? (isArabic ? 'حالة متوسطة / تتطلب فحصاً' : 'Moderate / Clinic Care') : (isArabic ? 'حالة بسيطة / رعاية منزلية' : 'Minor / Home Care');

    resultContainer.innerHTML = `
      <div class="result-header-card ${severity}">
        <span class="result-severity-pill">
          <i class="${severityIcon}"></i>
          <span>${severityText}</span>
        </span>
        <h2 class="result-diagnosis-title">${res.title}</h2>
        <p class="result-summary-text">${res.summary}</p>
      </div>

      ${emergencyCallBox}

      <div style="margin: 24px 0;">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; color: var(--text-main); display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-clipboard-list" style="color: var(--primary);"></i>
          <span>${isArabic ? 'خطة التدخل الإسعافي الفوري:' : 'Immediate Action Plan:'}</span>
        </h3>
        ${stepsHtml}
      </div>

      ${doDontHtml}

      <div style="background-color: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-top: 20px;">
        <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: var(--primary);"></i>
          <span>${isArabic ? 'مبرر التقييم السريري:' : 'Clinical Assessment Rational:'}</span>
        </h4>
        <p style="font-size: 0.925rem; color: var(--text-muted); line-height: 1.6;">${res.reason}</p>
        <div style="margin-top: 12px; font-size: 0.825rem; color: var(--text-subtle); display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-book-bookmark" style="color: var(--primary);"></i>
          <strong>${isArabic ? 'المرجع:' : 'Reference:'}</strong>
          <span>${res.source}</span>
        </div>
      </div>
    `;
  },

  restart() {
    this.selectedCategory = null;
    this.selectedSymptoms = [];
    document.querySelectorAll('.category-choice-card').forEach(c => c.classList.remove('selected'));
    this.goToStep(1);
  }
};

if (typeof window !== 'undefined') {
  window.TriageController = TriageController;
}
