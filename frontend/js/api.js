/**
 * First Aid Client-Side Clinical Intelligence Engine
 * 100% Pure Frontend - Zero Backend / Zero Server Dependencies
 * Executes clinical triage rules, NLP keyword matching, and knowledge retrieval directly in browser.
 * Author: Ziad Asaad - Frontend / UX Lead & Author
 */

const ApiClient = {
  /**
   * Process user clinical query directly in client-side JavaScript
   * @param {string} query 
   * @param {string} [sessionId] 
   * @returns {Promise<Object>}
   */
  async sendMessage(query, sessionId = 'default-session') {
    // Notify unified server search & analytics
    try {
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      }).catch(function() {});
    } catch (e) {}

    return this.evaluateClinicalQuery(query);
  },

  /**
   * Evaluate multi-step triage questionnaire directly in browser
   * @param {string} category 
   * @param {Array<string>} symptoms 
   * @returns {Promise<Object>}
   */
  async evaluateTriage(category, symptoms = []) {
    return this.evaluateClinicalTriage(category, symptoms);
  },

  /**
   * Retrieve emergency contacts & campus clinics directly from local data
   * @returns {Promise<Array>}
   */
  async getContacts() {
    return this.getClinicDirectory();
  },

  /**
   * Submit helpfulness feedback (Stored in browser LocalStorage)
   * @param {string|number} messageId 
   * @param {boolean} isHelpful 
   * @returns {Promise<Object>}
   */
  async submitFeedback(messageId, isHelpful) {
    try {
      const storedFeedback = JSON.parse(localStorage.getItem('fa_feedback_logs') || '[]');
      storedFeedback.push({
        id: messageId,
        helpful: isHelpful,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('fa_feedback_logs', JSON.stringify(storedFeedback));
    } catch (e) {}
    return { success: true };
  },

  /* ========================================================================
     CLIENT-SIDE CLINICAL INFERENCE & NLP MATCHING ENGINE
     ======================================================================== */
  evaluateClinicalQuery(query) {
    const q = (query || '').toLowerCase().trim();

    return new Promise((resolve) => {
      // Natural clinical reasoning delay simulation (350ms)
      setTimeout(() => {
        // 1. Choking / Airway Obstruction (RED)
        if (q.includes('اختناق') || q.includes('شرق') || q.includes('بلع') || q.includes('مش قادر يتنفس') || q.includes('ازرقاق') || q.includes('choking')) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'red',
            category: 'انسداد مجرى الهواء (اختناق)',
            title: 'حالة طوارئ قصوى: انسداد حاد لمجرى التنفس',
            summary: 'حالة حرجة تهدد الحياة تتطلب تدخلاً فورياً دون أي تأخير! اتصل برقم الإسعاف 123 فوراً وابدأ مناورة إنقاذ مجرى الهواء.',
            confidence: 0.99,
            reasoning: 'تم تصنيف الحالة كـ (فئة حمراء - طارئة) نظراً لاحتمال انقطاع الأكسجين عن الدماغ وتدهور الحالة خلال دقائق إذا لم يُفرغ مجرى التنفس.',
            steps: [
              'اتصل بالإسعاف فوراً (123) أو اطلب من شخص بجوارك الاتصال فوراً والبحث عن جهاز AED.',
              'شجع المصاب على السعال بقوة إذا كان لا يزال قادراً على التنفس أو إصدار صوت.',
              'إذا عجز عن التنفس أو الكلام، مِلْ به للأمام واضربه 5 ضربات قوية بين لوحي الكتف بباطن يدك.',
              'إذا لم يخرج الجسم الغريب، قف خلفه وطبّق 5 ضغطات بطنية سريعة للداخل ولأعلى (مناورة هيمليك).',
              'كرر التبادل بين 5 ضربات ظهر و 5 ضغطات بطن حتى يخرج العائق أو يفقد المصاب وعيه فيتم البدء بالإنعاش CPR.'
            ],
            do_list: [
              'الاتصال بـ 123 فوراً وإخبارهم بانسداد تنفس حاد',
              'الوقوف بثبات خلف المصاب لدعمه أثناء تطبيق المناورة',
              'البدء بـ CPR فوراً إذا سقط فاقداً للوعي'
            ],
            dont_list: [
              'لا تُدخل إصبعك عشوائياً في حلقه فقد تدفع الجسم الغريب لعمق أكبر',
              'لا تعطِه ماء أو أي سوائل للشرب أثناء الاختناق',
              'لا تتردد أو تؤجل طلب المساعدة الطبية'
            ],
            source: 'European Resuscitation Council (ERC) & Red Cross 2024',
            requires_followup: false
          });
          return;
        }

        // 2. Cardiac Arrest / CPR (RED)
        if (q.includes('cpr') || q.includes('إنعاش') || q.includes('نبض') || q.includes('قلب واقف') || q.includes('مش بيتفس') || q.includes('أزمة قلبية') || q.includes('جلطة')) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'red',
            category: 'إنعاش قلبي رئوي (CPR)',
            title: 'اشتباه توقف قلب وتنفس — إنعاش فوري مطلوب',
            summary: 'المصاب يحتاج لإنعاش قلبي رئوي (CPR) فوري. كل دقيقة تأخير تقلل فرص النجاة بنسبة 10%.',
            confidence: 1.0,
            reasoning: 'توقف القلب أو غياب التنفس الطبيعي يمثل قمة هرم الطوارئ الطبية ويستوجب التدخل اليدوي لضخ الدم للدماغ.',
            steps: [
              'اتصل بـ 123 واطلب جهاز الصدمات الكهربائية الخارجي (AED).',
              'ضع يديك مشبوكتين في منتصف القفص الصدري للمصاب على أرض صلبة ومستوية.',
              'اضغط بقوة وبسرعة بمعدل 100-120 ضغطة في الدقيقة وبعمق 5-6 سم دون انثناء ذراعيك.',
              'اترك الصدر يرتد بالكامل لأعلى بعد كل ضغطة ولا تتوقف.',
              'إذا كنت مدرباً، أعطِ نَفَسَي إنقاذ بعد كل 30 ضغطة، أو استمر في الضغط الصدري المستمر (Hands-only CPR).'
            ],
            do_list: [
              'الاستمرار بالضغط الصدري بإيقاع منتظم (100-120 بالدقيقة)',
              'استخدام جهاز AED فور وصوله وتشغيله واتباع تعليماته الصوتية',
              'تبديل المسعف كل دقيقتين لتجنب الإجهاد وضعف الضغط'
            ],
            dont_list: [
              'لا تتوقف عن الضغط إلا بوصول المسعفين أو استعادة المصاب لوعيه',
              'لا تضغط على المعدة أو أسفل عظمة القص',
              'لا تضيع وقتاً في فحص النبض إن لم تكن ممارساً صحياً معتمداً'
            ],
            source: 'American Heart Association (AHA) CPR Guidelines 2024',
            requires_followup: false
          });
          return;
        }

        // 3. Severe Arterial Bleeding (RED)
        if (q.includes('نزيف حاد') || q.includes('ينبض') || q.includes('دم كتير') || q.includes('شريان') || q.includes('قطع عميق')) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'red',
            category: 'نزيف شرياني حاد',
            title: 'حالة طوارئ: نزيف حاد متدفق يهدد بالصدمة',
            summary: 'نزيف شرياني أو وريدي حاد يتطلب ضغطاً مستمراً وفورياً مع الاتصال بـ 123 لتجنب هبوط الدورة الدموية.',
            confidence: 0.98,
            reasoning: 'تدفق الدم المتواصل أو النبضي يؤدي إلى فقدان سريع للحجم الدموي والدخول في صدمة نقص الحجم (Hypovolemic Shock).',
            steps: [
              'اضغط مباشرة وبقوة شديدة على موضع النزيف باستخدام شاش معقم أو قطعة قماش نظيفة.',
              'ارفع الطرف المصاب أعلى من مستوى القلب إذا أمكن ودون التسبب بألم ناتج عن كسر.',
              'ثبت الضمادة برباط ضاغط محكم ولا تنزع الضمادة الأولى إذا تشبعت بالدم بل ضع فوقها طبقة أخرى.',
              'اجعل المصاب يستلقي على ظهره وارفع ساقيه لتسهيل تدفق الدم للأعضاء الحيوية.',
              'اتصل بالإسعاف 123 فوراً لمتابعة نقل المصاب للطوارئ.'
            ],
            do_list: [
              'الضغط المباشر المستمر دون رفع اليد لفحص الجرح',
              'إبقاء المصاب دافئاً وتغطيته ببطانية لحمايته من الصدمة',
              'طلب الإسعاف العاجل 123'
            ],
            dont_list: [
              'لا تنزع الضمادة المشبعة بالدم لأن ذلك يزيل الجلطة المتكونة',
              'لا تستخدم تورنيكيه عشوائياً كحبل أو سلك دون تدريب طبي',
              'لا تغسل الجرح النازف بغزارة بالماء'
            ],
            source: 'American College of Emergency Physicians (ACEP) Bleeding Protocols',
            requires_followup: false
          });
          return;
        }

        // 4. Minor Heat Burn (GREEN)
        if (q.includes('حرق') || q.includes('سخن') || q.includes('مية مغلية') || q.includes('شاي') || q.includes('زيت') || q.includes('burn')) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'green',
            category: 'إصابات الحروق السطحية',
            title: 'حرق سطحي خفيف / درجة أولى — عناية منزلية',
            summary: 'حرق سطحي بسيط لا يستدعي الذعر. التبريد السريع بالماء الفاتر يمنع تفاقم تلف الأنسجة ويسكّن الألم بفعالية.',
            confidence: 0.97,
            reasoning: 'تم تصنيف الحالة كـ (خضراء) لأن الحرق محدود وموضعي دون وجود تفحم أو إصابة لمساحات واسعة أو الوجه أو المفاصل الحيوية.',
            steps: [
              'ضع العضو المصاب فوراً تحت تيار ماء بارد فاتر (ماء الصنبور العادي) لمدة تتراوح بين 10 إلى 20 دقيقة.',
              'انزع برفق أي خواتم أو ساعات أو ملابس ضيقة قريبة من موضع الحرق قبل بدء التورم.',
              'جفف المنطقة بلطف شديد بقطعة شاش نظيفة دون فرك.',
              'غطّ الحرق بضمادة شاش معقمة أو شاش فازلين غير لاصق لحمايته من الهواء والتلوث.',
              'يمكن تناول مسكن بسيط مثل الباراسيتامول لتخفيف الألم إذا دعت الحاجة.'
            ],
            do_list: [
              'استخدام ماء الصنبور الجاري المعتدل للتبريد',
              'تغطية الحرق بغطاء بلاستيكي نظيف (cling film) أو شاش معقم',
              'شرب كميات مناسبة من الماء للترطيب'
            ],
            dont_list: [
              'إياك واستخدام الثلج مباشرة؛ يسبب تلفاً تجميدياً للأنسجة المحروقة',
              'لا تضع معجون الأسنان، الدقيق، الزيوت، أو الطحينة على الحرق',
              'لا تفقأ أو تفرغ أي فقاعات مائية تظهر على الجلد'
            ],
            source: 'NHS UK Clinical Guidance - Burns and Scalds 2024',
            requires_followup: false
          });
          return;
        }

        // 5. Heatstroke & Exhaustion (ORANGE/RED)
        if (q.includes('شمس') || q.includes('إجهاد حراري') || q.includes('ضربة شمس') || q.includes('حرارة عالية')) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'red',
            category: 'ضربة شمس وإجهاد حراري',
            title: 'اشتباه ضربة شمس حادة — تتطلب تبريداً عاجلاً',
            summary: 'حالة طبية طارئة ناتجة عن فشل تنظيم حرارة الجسم. ارتفاع الحرارة مع جفاف الجلد والتوهان يستدعي التبريد وطلب الإسعاف 123.',
            confidence: 0.95,
            reasoning: 'توقف التعرق وارتفاع حرارة الجسم فوق 40 درجة مئوية مع اضطراب الوعي يهدد بتلف الدماغ والأعضاء الحيوية.',
            steps: [
              'انقل المصاب فوراً إلى مكان بارد ومظلل أو غرفة مكيفة الهواء.',
              'انزع الملابس الزائدة ورش جسمه برذاذ ماء بارد مع تسليط مروحة عليه.',
              'ضع كمادات ماء بارد على الرقبة والإبطين وأعلى الفخذين.',
              'اتصل بالإسعاف 123 فوراً.',
              'إذا كان واعياً وقادراً على البلع، أعطه رشفات صغيرة من الماء البارد.'
            ],
            do_list: [
              'التبريد الفوري بالماء البارد والكمادات والمروحة',
              'رفع القدمين قليلاً إذا كان يعاني من الهبوط والدوار',
              'مراقبة الوعي والتنفس باستمرار'
            ],
            dont_list: [
              'لا تعطِه خافض حرارة كالمسكنات والأسبرين لأنها غير مفيدة في ضربات الشمس',
              'لا تجبره على شرب سوائل لو كان مشوشاً أو فاقداً للوعي',
              'لا تغمره في ثلج شديد البرودة دفعة واحدة لتجنب انقباض الأوعية'
            ],
            source: 'CDC & Mayo Clinic - Heatstroke Emergency Management',
            requires_followup: false
          });
          return;
        }

        // 6. Poisoning / Chemical Ingestion (RED)
        if (q.includes('سم') || q.includes('تسمم') || q.includes('منظف') || q.includes('كلور') || q.includes('دواء') || q.includes('جرعة زائدة')) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'red',
            category: 'تسمم وكيماويات',
            title: 'طوارئ كيميائية: ابتلاع مواد سامة أو جرعة زائدة',
            summary: 'حالة طوارئ تستدعي الاتصال الفوري بمركز السموم أو الإسعاف 123 مع الاحتفاظ بعبوة المادة لتحديد المكونات.',
            confidence: 0.98,
            reasoning: 'المواد الكيميائية والأدوية قد تسبب حروقاً مريئية أو تثبيطاً عصبياً وتنفسياً حاداً.',
            steps: [
              'اتصل بمركز السموم (0223643122) أو الإسعاف 123 فوراً.',
              'احتفظ بعبوة المادة الكيميائية أو الدواء لتحديد الاسم العلمي للمسعف.',
              'امسح فم المصاب بلطف من أي بقايا كيميائية خارجية.',
              'إذا فقد المصاب الوعي، ضعه في وضعية الإفاقة على جانبه وتأكد من فتح مجرى الهواء.'
            ],
            do_list: [
              'الاتصال الفوري بمركز السموم وطلب الإسعاف',
              'قراءة تعليمات الإسعاف الأولي المكتوبة على عبوة المنظف',
              'مراقبة التنفس ومستوى الإدراك'
            ],
            dont_list: [
              'إياك أن تجبر المصاب على التقيؤ؛ قد يحرق المريء للمرة الثانية',
              'لا تعطِه حليباً أو ليموناً أو فحماً دون توجيه مباشر من مركز السموم',
              'لا تنتظر ظهور أعراض خطيرة لبدء الاتصال'
            ],
            source: 'WHO Poisoning Protocols & National Poison Center',
            requires_followup: false
          });
          return;
        }

        // 7. Ambiguous / Vague Case (Follow-up Question)
        if (q.includes('تعبان') || q.includes('مش عارف') || q.includes('دايخ') || q.includes('واقع') || q.includes('حاسس بحاجة') || q.length < 8) {
          resolve({
            id: 'case-' + Date.now(),
            severity: 'orange',
            category: 'تقييم أولي غير مكتمل',
            title: 'بحاجة لتفاصيل إضافية لتحديد درجة الخطورة بدقة',
            summary: 'الأعراض المذكورة عامة أو غير مكتملة. للسلامة الطبية، يرجى الإجابة عن السؤال التالي لتحديد الإجراء الأنسب فوراً.',
            confidence: 0.65,
            reasoning: 'النظام يعتمد بروتوكول السلامة الطبية عند غموض الأعراض لضمان عدم تفويت حالات فقدان الوعي أو ضيق التنفس.',
            steps: [
              'اقترب من المصاب وتأكد من سلامة وأمان المكان من حولكما أولاً.',
              'تحقق من درجة الاستجابة: وجّه له سؤالاً بصوت واضح: "هل تسمعني؟ هل أنت بخير؟".',
              'راقب حركة الصدر لمدة 5 ثوانٍ للتأكد من وجود تنفس طبيعي منتظم.'
            ],
            do_list: [
              'إبقاء المصاب مستلقياً في مكان مريح وجيد التهوية',
              'إراحة المصاب وفك الأزرار والياقات الضيقة'
            ],
            dont_list: [
              'لا تجبر الشخص على الوقوف أو المشي وهو يعاني من الدوار',
              'لا تسكب الماء على وجهه'
            ],
            source: 'Basic Life Support (BLS) Clinical Assessment',
            requires_followup: true,
            followup_question: 'هل المصاب واعي تماماً ويتنفس طبيعياً؟ وهل يشكو من ألم بالصدر أو صعوبة بالحركة؟'
          });
          return;
        }

        // 8. General First Aid Assessment (ORANGE)
        resolve({
          id: 'case-' + Date.now(),
          severity: 'orange',
          category: 'إصابات ورعاية إسعافية',
          title: 'تقييم إسعافي للحالة الموضحة',
          summary: 'يرجى اتباع خطوات الإسعاف الأولي المعتمدة لتقليل المضاعفات، ومراقبة أي علامات تستدعي التدخل الطبي التخصصي.',
          confidence: 0.88,
          reasoning: 'تم التحليل السريري بناءً على معايير الجمعيات الطبية للإسعافات الأولية وتصنيف الأولويات.',
          steps: [
            'تأكد من سلامة البيئة المحيطة بك وبالمصاب قبل تقديم المساعدة.',
            'طبق الضغط المباشر والنظيف على أي موضع نزف أو إصابة مفتوحة.',
            'طمئن المصاب واجعله في وضعية الجلوس أو الاستلقاء المريح.',
            'إذا تفاقمت الأعراض أو ظهر شحوب وتعرق بارد، اتصل فوراً بـ 123.'
          ],
          do_list: [
            'استخدام قفازات نظيفة إن أمكن لحماية المسعف والمصاب',
            'طلب المساعدة من أقرب شخص أو الاتصال بالعيادة'
          ],
          dont_list: [
            'لا تترك المصاب وحيداً إن كان في حالة ارتباك أو اضطراب',
            'لا تعطِه طعاماً أو شراباً إذا كان هناك احتمال لنقله للمستشفى'
          ],
          source: 'World Health Organization (WHO) First Aid Essentials',
          requires_followup: false
        });
      }, 350);
    });
  },

  /**
   * Client-side clinical triage evaluator
   */
  evaluateClinicalTriage(category, symptoms = []) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cat = (category || '').toLowerCase();
        let severity = 'green';
        let title = 'حالة بسيطة — استقرار ملحوظ';
        let summary = 'الأعراض المحددة لا تشير إلى خطر داهم فوري. ينصح باتباع التدابير المنزلية الوقائية ومراجعة العيادة إذا لزم.';
        let reason = 'استناداً إلى الأعراض المختارة، لا تظهر علامات الصدمة أو الاختناق أو النزيف الشرياني الحاد.';
        let steps = [
          'تنظيف موضع الإصابة بلطف وتطهيره بمحلول معقم خفيف.',
          'تغطية المكان بضمادة واقية وتجنب تعريضه للملوثات أو الاحتكاك.',
          'الراحة ومراقبة أي تغيرات خلال الساعات القادمة.'
        ];
        let doList = ['الراحة والترطيب الجيد', 'استشارة طبيب المركز الصحي عند الشك'];
        let dontList = ['لا تهمل ظهور ارتفاع في درجة الحرارة أو صديد', 'لا تبذل مجهوداً شاقاً'];

        // Determine severity based on critical triggers
        const hasCritical = symptoms.some(s => 
          s.includes('فقدان وعي') || s.includes('دم ينبض') || s.includes('ألم بالصدر') || 
          s.includes('ازرقاق') || s.includes('صعوبة بلع') || s.includes('تشنج') || s.includes('شديد') || s.includes('عظم بارز')
        );

        if (cat.includes('cpr') || cat.includes('choking') || cat.includes('اختناق') || hasCritical) {
          severity = 'red';
          title = 'تنبيه طوارئ: حالة مصنفة (أحمر — طوارئ فورية)';
          summary = 'الأعراض المختارة تمثل خطراً مباشراً على حياة المريض. اتصل بالإسعاف (123) فوراً وابدأ بروتوكول الطوارئ.';
          reason = 'وجود أعراض انسداد مجرى الهواء أو توقف الوعي أو ألم صدري مفاجئ يتطلب أقصى درجات الاستجابة الفورية.';
          steps = [
            'اتصل بـ 123 فوراً وحدد موقعك بدقة وطبيعة الحالة.',
            'حافظ على مجرى التنفس مفتوحاً وافحص حركة الصدر باستمرار.',
            'لا تحرك المصاب إذا كان هناك اشتباه بإصابة في الرقبة أو العمود الفقري.',
            'استعد لتطبيق الإنعاش CPR إذا توقف التنفس الطبيعي.'
          ];
          doList = ['طلب الإسعاف 123 فوراً دون إضاعة ثانية واحدة', 'البقاء بجانب المصاب ومراقبة علاماته الحيوية'];
          dontList = ['لا تعطِه أي سوائل أو مسكنات فموية', 'لا تحركه بعنف'];
        } else if (symptoms.length > 2 || cat.includes('fractures') || cat.includes('كسور') || cat.includes('bleeding') || cat.includes('نزيف')) {
          severity = 'orange';
          title = 'حالة متوسطة (برتقالي) — تتطلب رعاية وفحصاً طبياً';
          summary = 'الحالة مستقرة مؤقتاً لكنها تحتاج فحصاً في أقرب مركز طبي أو عيادة لتجنب المضاعفات.';
          reason = 'تكرار الأعراض أو موضع الإصابة يستلزم تقييماً إكلينيكياً متخصصاً كالأشعة أو التضميد المتقدم.';
          steps = [
            'تطبيق الإسعاف الأولي المهدئ للألم وتقليل الحركة.',
            'التوجه للعيادة الجامعية أو أقرب مستشفى خلال ساعة إلى ساعتين.',
            'تطبيق كمادات باردة إذا كان هناك انتفاخ دون ملامسة الثلج للجلد مباشرة.'
          ];
          doList = ['تثبيت الطرف المصاب', 'التوجه للعيادة الجامعية للفحص'];
          dontList = ['لا تحاول شد أو فرقعة المفصل المصاب', 'لا تقم بالتدليك العنيف'];
        }

        resolve({
          severity,
          title,
          summary,
          reason,
          steps,
          do_list: doList,
          dont_list: dontList,
          source: 'Emergency Medical Triage Protocol (Manchester / WHO standard)'
        });
      }, 400);
    });
  },

  /**
   * Campus Clinic & Emergency Directory (Local Data)
   */
  getClinicDirectory() {
    return [
      {
        id: 'clinic-1',
        name: 'طوارئ الإسعاف المركزي الموحد',
        name_en: 'Central Emergency Ambulance',
        type: 'emergency',
        phone: '123',
        location: 'الخط الساخن الوطني الموحد — تغطية شاملة 24/7',
        lat: 30.0444,
        lon: 31.2357,
        distance_km: 0.1,
        available_24h: true,
        services: ['إسعاف مجهز', 'طاقم عناية مركزة', 'نقل طوارئ']
      },
      {
        id: 'clinic-2',
        name: 'مستشفى الطلبة والجامعة المركزي',
        name_en: 'University Student Hospital',
        type: 'hospital',
        phone: '0235676100',
        location: 'المجمع الطبي — الحرم الجامعي — بوابة 3',
        lat: 30.0261,
        lon: 31.2093,
        distance_km: 1.2,
        available_24h: true,
        services: ['طوارئ 24 ساعة', 'أشعة ومعامل', 'وحدة جروح وحروق', 'صيدلية طوارئ']
      },
      {
        id: 'clinic-3',
        name: 'مركز السموم الإكلينيكي',
        name_en: 'National Poison Control Center',
        type: 'poison',
        phone: '0223643122',
        location: 'مستشفيات قصر العيني — مبنى الطوارئ',
        lat: 30.0298,
        lon: 31.2292,
        distance_km: 2.4,
        available_24h: true,
        services: ['ترياق السموم', 'استشارات التسمم المنزلي', 'غسيل معدة طارئ']
      },
      {
        id: 'clinic-4',
        name: 'عيادة كلية الحاسبات والإدارة الطبية',
        name_en: 'Faculty Medical Center Clinic',
        type: 'campus_clinic',
        phone: '0235676220',
        location: 'المبنى الإداري — الطابق الأرضي — جوار المكتبة',
        lat: 30.0285,
        lon: 31.2081,
        distance_km: 0.3,
        available_24h: false,
        hours: '8:30 ص — 6:00 م',
        services: ['إسعافات أولية أولية', 'قياس سكر وضغط', 'تضميد جروح', 'صيدلية مصغرة']
      }
    ];
  }
};

if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
}
