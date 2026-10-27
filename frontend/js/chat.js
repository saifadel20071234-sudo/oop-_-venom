/**
 * Chat Controller Module - First Aid System
 * Interactive Chatbot Interface & Emergency Response
 * Author: Ziad Asaad - Frontend / UX Lead & Author
 */

const ChatController = {
  sessionId: null,
  chatContainer: null,
  inputField: null,
  sendBtn: null,
  typingIndicator: null,
  audioContext: null,

  init() {
    this.chatContainer = document.getElementById('chat-messages');
    this.inputField = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    this.typingIndicator = document.getElementById('typing-indicator');

    if (!this.chatContainer || !this.inputField) return;

    // Load or generate session_id
    this.sessionId = localStorage.getItem('fa_session_id');
    if (!this.sessionId) {
      this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('fa_session_id', this.sessionId);
    }

    // Bind event listeners
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });

    // Auto-detect text direction (RTL / LTR)
    this.inputField.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length > 0) {
        const isArabicChar = /[\u0600-\u06FF]/.test(val[0]);
        this.inputField.dir = isArabicChar ? 'rtl' : 'ltr';
      }
    });

    // Bind Quick Chips
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query') || btn.innerText.trim();
        this.inputField.value = query;
        this.handleSendMessage();
      });
    });

    // Handle Print Card
    const printBtn = document.getElementById('print-advice-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Modal Close
    const modalClose = document.getElementById('close-reason-modal');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        document.getElementById('reason-modal').classList.remove('active');
      });
    }
  },

  /**
   * Synthesize audio beep for RED emergency using Web Audio API
   */
  playEmergencyAlertBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Double urgent beep
      playTone(880, 0, 0.2);
      playTone(880, 0.25, 0.25);
    } catch (e) {
      console.warn('Web Audio beep error:', e);
    }
  },

  async handleSendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    // Render User Message
    this.renderUserMessage(text);
    this.inputField.value = '';

    // Show Typing Indicator
    this.showTyping(true);

    try {
      const response = await ApiClient.sendMessage(text, this.sessionId);
      this.showTyping(false);
      this.renderSystemResponse(response);
    } catch (err) {
      this.showTyping(false);
      this.renderErrorMessage('عذراً، حدث خطأ أثناء معالجة الرسالة. يرجى إعادة المحاولة.');
    }
  },

  showTyping(show) {
    if (!this.typingIndicator) return;
    this.typingIndicator.style.display = show ? 'flex' : 'none';
    this.scrollToBottom();
  },

  scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
  },

  scrollToMessageTop(element) {
    if (!element) return;
    setTimeout(() => {
      if (this.chatContainer) {
        const containerRect = this.chatContainer.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();
        const scrollDelta = elemRect.top - containerRect.top;
        this.chatContainer.scrollBy({
          top: scrollDelta - 12,
          behavior: 'smooth'
        });
      } else {
        try {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {}
      }
    }, 60);
  },

  renderUserMessage(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isArabic = /[\u0600-\u06FF]/.test(text);

    const msgHtml = `
      <div class="message-row user" dir="${isArabic ? 'rtl' : 'ltr'}">
        <div class="msg-avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="msg-bubble">
          <div>${this.escapeHtml(text)}</div>
          <div class="msg-top-meta" style="margin-top: 6px; margin-bottom: 0;">
            <span class="msg-time" style="color: rgba(255,255,255,0.75);">${time}</span>
          </div>
        </div>
      </div>
    `;

    this.chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    this.scrollToBottom();
  },

  renderSystemResponse(res) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const severity = (res.severity || 'green').toLowerCase();

    // Trigger RED Emergency Effects if critical
    if (severity === 'red') {
      this.playEmergencyAlertBeep();
      const card = document.querySelector('.chat-card');
      if (card) {
        card.classList.add('critical-alert-active');
        setTimeout(() => card.classList.remove('critical-alert-active'), 2500);
      }
    }

    const badgeHtml = SeverityBadge.render(severity);
    const stepsHtml = StepCardComponent.renderSteps(res.steps || []);
    const doDontHtml = StepCardComponent.renderDoDont(res.do_list || [], res.dont_list || []);

    const isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';

    // Why this diagnosis button
    const reasonEscaped = encodeURIComponent(res.reasoning || 'تم التقييم وفق بروتوكول فرز الإصابات الطبي.');

    const followupHtml = res.requires_followup && res.followup_question ? `
      <div style="margin-top: 14px; padding: 14px 18px; background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); color: #92400e; display: flex; align-items: flex-start; gap: 10px;">
        <i class="fa-solid fa-circle-question" style="font-size: 1.2rem; color: #d97706; margin-top: 2px;"></i>
        <div>
          <strong>${isArabic ? 'سؤال توضيحي للمتابعة:' : 'Clarifying Follow-up Question:'}</strong>
          <p style="margin-top: 4px; font-weight: 700; color: #78350f;">${res.followup_question}</p>
        </div>
      </div>
    ` : '';

    const msgHtml = `
      <div class="message-row system" id="msg-${res.id}">
        <div class="msg-avatar">
          <i class="fa-solid fa-user-doctor"></i>
        </div>
        <div class="msg-bubble print-card" style="width: 100%;">
          <div class="msg-top-meta">
            ${badgeHtml}
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="why-diagnosis-btn" onclick="ChatController.showReasonModal('${reasonEscaped}')">
                <i class="fa-solid fa-circle-info" style="color: var(--primary);"></i>
                <span>${isArabic ? 'ليه الحكم ده؟' : 'Why this decision?'}</span>
              </button>
              <span class="msg-time">${time}</span>
            </div>
          </div>

          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
            ${res.title || res.category}
          </h3>

          <p style="font-size: 0.95rem; margin-bottom: 12px; line-height: 1.6;">
            ${res.summary}
          </p>

          ${followupHtml}
          ${stepsHtml}
          ${doDontHtml}

          <div class="msg-citation">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-book-bookmark" style="color: var(--primary);"></i>
              <strong>${isArabic ? 'المرجع الطبي المعتمد:' : 'Medical Citation:'}</strong>
            </span>
            <span>${res.source || 'Standard First Aid Guidelines (AHA / ERC / Red Cross)'}</span>
          </div>

          <div class="msg-feedback-bar">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${isArabic ? 'هل كان هذا الرد مفيداً؟' : 'Was this helpful?'}</span>
            <button class="feedback-btn" onclick="ChatController.voteFeedback('${res.id}', true, this)">
              <i class="fa-solid fa-thumbs-up" style="color: var(--severity-green);"></i>
              <span>${isArabic ? 'مفيد' : 'Helpful'}</span>
            </button>
            <button class="feedback-btn" onclick="ChatController.voteFeedback('${res.id}', false, this)">
              <i class="fa-solid fa-thumbs-down" style="color: var(--severity-red);"></i>
              <span>${isArabic ? 'غير مفيد' : 'Unhelpful'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    const newMsg = this.chatContainer.lastElementChild;
    this.scrollToMessageTop(newMsg);
  },

  renderErrorMessage(errText) {
    const msgHtml = `
      <div class="message-row system">
        <div class="msg-avatar" style="background: #dc2626; color: #fff;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="msg-bubble" style="border-color: #fecaca; background-color: #fef2f2; color: #dc2626; font-weight: 600;">
          ${errText}
        </div>
      </div>
    `;
    this.chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    const newMsg = this.chatContainer.lastElementChild;
    this.scrollToMessageTop(newMsg);
  },

  showReasonModal(encodedReason) {
    const modal = document.getElementById('reason-modal');
    const modalBody = document.getElementById('reason-modal-body');
    if (modal && modalBody) {
      modalBody.innerText = decodeURIComponent(encodedReason);
      modal.classList.add('active');
    }
  },

  async voteFeedback(msgId, isHelpful, btnElement) {
    const parent = btnElement.parentElement;
    parent.querySelectorAll('.feedback-btn').forEach(b => {
      b.classList.remove('active-helpful', 'active-unhelpful');
    });

    if (isHelpful) {
      btnElement.classList.add('active-helpful');
    } else {
      btnElement.classList.add('active-unhelpful');
    }

    await ApiClient.submitFeedback(msgId, isHelpful);
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }
};

if (typeof window !== 'undefined') {
  window.ChatController = ChatController;
}
