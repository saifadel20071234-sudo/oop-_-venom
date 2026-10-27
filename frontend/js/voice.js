/**
 * Voice Input Module (Web Speech API)
 * Allows speech-to-text input in Arabic and English
 * Author: Ziad Asaad - Frontend / UX Lead & Author
 */

const VoiceAssistant = {
  recognition: null,
  isListening: false,
  targetInput: null,
  triggerBtn: null,

  init(inputElementId = 'chat-input', triggerBtnId = 'voice-btn') {
    this.targetInput = document.getElementById(inputElementId);
    this.triggerBtn = document.getElementById(triggerBtnId);

    if (!this.triggerBtn || !this.targetInput) return;

    // Check browser support for SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[VoiceAssistant] Speech Recognition API is not supported in this browser.');
      this.triggerBtn.title = 'التعرف الصوتي غير مدعوم في متصفحك';
      this.triggerBtn.style.opacity = '0.5';
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.updateLanguage();

      this.recognition.onstart = () => {
        this.isListening = true;
        this.triggerBtn.classList.add('recording');
        this.targetInput.placeholder = 'جارٍ الاستماع إليك... تحدث الآن عن الأعراض';
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.targetInput) {
          this.targetInput.value = transcript;
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceAssistant] Speech error:', event.error);
        this.stop();
      };

      this.recognition.onend = () => {
        this.stop();
      };

      this.triggerBtn.addEventListener('click', () => {
        this.toggle();
      });

    } catch (e) {
      console.error('[VoiceAssistant] Initialization error:', e);
    }
  },

  updateLanguage() {
    if (!this.recognition) return;
    const isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';
    this.recognition.lang = isArabic ? 'ar-EG' : 'en-US';
  },

  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  },

  start() {
    if (!this.recognition) {
      alert('التعرف الصوتي غير مدعوم في هذا المتصفح. يرجى استخدام متصفح Chrome أو Edge.');
      return;
    }
    this.updateLanguage();
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already started or error:', e);
    }
  },

  stop() {
    this.isListening = false;
    if (this.triggerBtn) {
      this.triggerBtn.classList.remove('recording');
    }
    if (this.targetInput) {
      this.targetInput.placeholder = document.documentElement.lang === 'en' 
        ? 'Describe the emergency or symptoms (e.g., burn, choking)...' 
        : 'صف الحالة الطارئة أو الأعراض هنا (مثال: حرق في اليد، اختناق، نزيف)...';
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
};

if (typeof window !== 'undefined') {
  window.VoiceAssistant = VoiceAssistant;
}
