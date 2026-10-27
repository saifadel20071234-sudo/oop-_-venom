/**
 * Team Modal Component - VENOM Medical Emergency System
 * Displays interactive Medical/Tech ID Badges for the team
 * Fully Bilingual (AR/EN) & Self-Healing Injection
 */

const TeamModal = {
  isOpen: false,

  teamMembers: [
    {
      id: 'VENOM-01',
      nameAr: 'زياد اسعد',
      nameEn: 'Zeyad Asaad',
      roleAr: 'Team Leader & Frontend / UI/UX Lead',
      roleEn: 'Team Leader & Frontend / UI/UX Lead',
      tagAr: 'Team Leader',
      tagEn: 'Team Leader',
      tagClass: 'tag-leader',
      descAr: 'قيادة الفريق، بنية واجهات PWA التفاعلية، وتجربة المستخدم والإخراج البصري',
      descEn: 'Project leadership, PWA frontend architecture, UI/UX design and visual identity',
      icon: 'fa-solid fa-user-doctor',
      image: 'assets/images/zeyad-asaad.jpg',
      color: '#E91443',
      linkedin: 'https://www.linkedin.com/in/zeyad-asaad-469b10387',
      portfolio: 'https://ziadasaad.vercel.app/'
    },
    {
      id: 'VENOM-02',
      nameAr: 'فرح الشربيني',
      nameEn: 'Farah Elshirbiny',
      image: 'assets/images/farah-elshirbiny.jpg',
      roleAr: 'Data & File Handling',
      roleEn: 'Data & File Handling',
      tagAr: 'Data & Files',
      tagEn: 'Data & Files',
      tagClass: 'tag-data',
      descAr: 'هندسة معمارية البيانات، معالجة وتدفق الملفات، وإدارة هياكل الحالات الإسعافية',
      descEn: 'Data architecture, emergency record schemas, file handling and case pipelines',
      icon: 'fa-solid fa-database',
      color: '#06B6D4',
      linkedin: 'https://www.linkedin.com/in/farah-elshirbiny-4b6a553b5'
    },
    {
      id: 'VENOM-03',
      nameAr: 'سيف الاسلام عادل',
      nameEn: 'Saif Adel',
      image: 'assets/images/saif-adel.jpg',
      roleAr: 'IR Engine (Information Retrieval)',
      roleEn: 'IR Engine (Information Retrieval)',
      tagAr: 'IR Engine',
      tagEn: 'IR Engine',
      tagClass: 'tag-ir',
      descAr: 'بناء وتطوير محرك استرجاع المعلومات السريرية والبروتوكولات الإسعافية الفورية',
      descEn: 'Information retrieval engine, clinical protocol matching algorithms and index ranking',
      icon: 'fa-solid fa-magnifying-glass-chart',
      color: '#F59E0B',
      linkedin: 'https://www.linkedin.com/in/saif-adel-0b82873b3'
    },
    {
      id: 'VENOM-04',
      nameAr: 'رضا القبلاوي',
      nameEn: 'Reda El-Qeblawy',
      image: 'assets/images/reda-elqeblawy.jpg?v=60',
      roleAr: 'ML / NLU & Conversational Chatbot',
      roleEn: 'ML / NLU & Conversational Chatbot',
      tagAr: 'ML / NLU',
      tagEn: 'ML / NLU',
      tagClass: 'tag-ai',
      descAr: 'نماذج تعلم الآلة، معالجة اللغة الطبيعية، وتدريب المساعد الإسعافي الذكي',
      descEn: 'Machine learning models, natural language understanding, and triage chatbot intelligence',
      icon: 'fa-solid fa-brain',
      color: '#8B5CF6',
      linkedin: 'https://www.linkedin.com/in/reda-m-3a09103b5'
    },
    {
      id: 'VENOM-05',
      nameAr: 'جميلة توفيق',
      nameEn: 'Jamila Tawfeek',
      image: 'assets/images/jamila-tawfeek.jpg?v=59',
      roleAr: 'Knowledge Base & Inference Engine',
      roleEn: 'Knowledge Base & Inference Engine',
      tagAr: 'Inference',
      tagEn: 'Inference',
      tagClass: 'tag-kb',
      descAr: 'بناء وتوثيق قاعدة المعرفة الطبية ومحرك الاستدلال والتشخيص السريري',
      descEn: 'Clinical knowledge base curation, symptom inference engine, and triage rule evaluation',
      icon: 'fa-solid fa-microscope',
      color: '#EC4899',
      linkedin: 'https://www.linkedin.com/in/jamila-tawfeek-ab4a43402'
    },
    {
      id: 'VENOM-06',
      nameAr: 'ميرنا هاني',
      nameEn: 'Merna Hany',
      image: 'assets/images/merna-hany.jpg',
      roleAr: 'Backend + Admin Panel + Analytics',
      roleEn: 'Backend + Admin Panel + Analytics',
      tagAr: 'Backend',
      tagEn: 'Backend',
      tagClass: 'tag-backend',
      descAr: 'البنية البرمجية الخلفية، لوحة تحكم المنظومة، وتحليلات ومؤشرات الأداء',
      descEn: 'Core backend services, administrative dashboard controls, and system analytics',
      icon: 'fa-solid fa-server',
      color: '#3B82F6',
      linkedin: 'https://www.linkedin.com/in/merna-elgamal-3968263b5'
    }
  ],

  init() {
    this.injectModal();
    this.bindEvents();
    this.checkUrlHash();
  },

  getAssetPrefix() {
    return window.location.pathname.includes('/pages/') ? '../' : '';
  },

  isEnglish() {
    return document.documentElement.lang === 'en' || 
           (window.App && window.App.currentLang === 'en') ||
           document.body.getAttribute('dir') === 'ltr';
  },

  injectModal() {
    const existing = document.getElementById('teamModalBackdrop');
    if (existing) {
      existing.remove();
    }

    const isEn = this.isEnglish();

    const cardsHtml = this.teamMembers.map(m => `
      <div class="team-member-card" data-member-id="${m.id}">
        <div class="member-card-inner">
          <div class="member-avatar-wrap">
            <div class="member-avatar-circle" style="--accent-color: ${m.color};">
              ${m.image ? `<img src="${this.getAssetPrefix()}${m.image}" alt="${isEn ? m.nameEn : m.nameAr}" class="member-avatar-img">` : `<i class="${m.icon}"></i>`}
            </div>
            <span class="member-active-beacon" title="Active"></span>
          </div>

          <div class="member-body">
            <div class="member-top-row">
              <h4 class="member-name">${isEn ? m.nameEn : m.nameAr}</h4>
              <span class="member-role-tag ${m.tagClass}">${isEn ? m.tagEn : m.tagAr}</span>
            </div>
            <p class="member-role-title">${isEn ? m.roleEn : m.roleAr}</p>
            <p class="member-role-desc">${isEn ? m.descEn : m.descAr}</p>
          </div>
        </div>

        <div class="member-card-footer">
          <div class="member-links-group">
            ${m.portfolio ? `
              <a href="${m.portfolio}" target="_blank" rel="noopener noreferrer" class="member-portfolio-link" title="Portfolio">
                <i class="fa-solid fa-globe"></i>
                <span>Portfolio</span>
                <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.65rem;"></i>
              </a>
            ` : ''}
            <a href="${m.linkedin}" target="_blank" rel="noopener noreferrer" class="member-linkedin-link" title="LinkedIn Profile">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align:-1px; margin-inline-end:5px; flex-shrink:0;"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.32a1.62 1.62 0 1 0 1.62 1.62 1.62 1.62 0 0 0-1.62-1.62Z"/></svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    const modalTitle = isEn ? 'VENOM Tech Team' : 'تيم VENOM التقني';
    const modalPill = isEn ? 'Medical & AI Core' : 'نواة التطوير والذكاء';
    const supervisorPrefix = isEn ? 'Supervised by:' : 'تحت إشراف:';
    const supervisorName = isEn ? 'Dr. Fatma Mohamed Talaat' : 'د/ فاطمة محمد طلعت';
    const motto = isEn ? 'VENOM Smart System — Built with unified team passion' : 'منظومة VENOM الذكية — تم بناء المشروع بروح الفريق الواحد';
    const shareText = isEn ? 'Share Team Link' : 'مشاركة رابط الفريق';
    const closeText = isEn ? 'Close' : 'إغلاق';

    const modalHtml = `
      <div class="team-modal-backdrop" id="teamModalBackdrop" aria-hidden="true" dir="${isEn ? 'ltr' : 'rtl'}">
        <div class="team-modal-container" id="teamModalContainer" role="dialog" aria-modal="true" aria-labelledby="teamModalTitle">
          
          <!-- Background Ambient Glow -->
          <div class="team-modal-glow"></div>

          <!-- Header -->
          <div class="team-modal-header">
            <div class="team-header-info">
              <div class="team-cadre-badge">
                <i class="fa-solid fa-laptop-code"></i>
              </div>
              <div class="team-header-titles">
                <div class="team-title-row">
                  <h3 id="teamModalTitle" class="team-modal-heading">${modalTitle}</h3>
                  <span class="team-cadre-pill">${modalPill}</span>
                </div>
                <p class="team-supervisor-line">
                  <i class="fa-solid fa-graduation-cap"></i>
                  <span>${supervisorPrefix} <strong>${supervisorName}</strong></span>
                </p>
              </div>
            </div>

            <button type="button" class="team-modal-close-btn" id="teamModalCloseBtn" aria-label="${closeText}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- ECG Heartbeat Animated Divider -->
          <div class="team-ecg-divider" aria-hidden="true">
            <svg viewBox="0 0 300 24" class="team-ecg-svg">
              <path d="M 0 12 L 100 12 L 115 12 L 122 4 L 130 20 L 138 2 L 148 22 L 155 8 L 162 16 L 170 12 L 300 12" class="team-ecg-path"></path>
            </svg>
          </div>

          <!-- Members Grid -->
          <div class="team-cards-grid">
            ${cardsHtml}
          </div>

          <!-- Modal Footer -->
          <div class="team-modal-footer">
            <div class="team-footer-motto">
              <i class="fa-solid fa-shield-heart" style="color: var(--primary);"></i>
              <span>${motto}</span>
            </div>
            <div class="team-footer-actions">
              <button type="button" class="team-copy-btn" id="teamCopyLinkBtn">
                <i class="fa-solid fa-link"></i>
                <span id="teamCopyBtnText">${shareText}</span>
              </button>
              <button type="button" class="team-dismiss-btn" id="teamDismissBtn">
                <span>${closeText}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  bindEvents() {
    // Open triggers - robust global event listener
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('#openTeamModalBtn, #teamCreditTrigger, .team-modal-trigger, .team-launch-badge, [data-open-team]');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        this.open();
      }
    });

    // Close triggers
    document.addEventListener('click', (e) => {
      if (e.target.closest('#teamModalCloseBtn, #teamDismissBtn')) {
        e.preventDefault();
        this.close();
      } else if (e.target.id === 'teamModalBackdrop') {
        this.close();
      }
    });

    // Keyboard Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Share/Copy Link Button
    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('#teamCopyLinkBtn');
      if (copyBtn) {
        e.preventDefault();
        const url = window.location.origin + window.location.pathname + '#team';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            const btnText = document.getElementById('teamCopyBtnText');
            if (btnText) {
              const orig = btnText.textContent;
              btnText.textContent = this.isEnglish() ? 'Link Copied! ✓' : 'تم نسخ الرابط! ✓';
              setTimeout(() => { btnText.textContent = orig; }, 2200);
            }
          });
        }
      }
    });
  },

  checkUrlHash() {
    if (window.location.hash === '#team') {
      setTimeout(() => { this.open(); }, 400);
    }
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#team') {
        this.open();
      }
    });
  },

  open() {
    // Re-inject on open to match current language dynamically
    this.injectModal();

    const backdrop = document.getElementById('teamModalBackdrop');
    if (!backdrop) return;
    this.isOpen = true;
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const backdrop = document.getElementById('teamModalBackdrop');
    if (!backdrop) return;
    this.isOpen = false;
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.location.hash === '#team') {
      history.replaceState(null, null, ' ');
    }
  }
};

// Expose globally on window
window.TeamModal = TeamModal;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TeamModal.init());
} else {
  TeamModal.init();
}
