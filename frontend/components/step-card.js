/**
 * Step Card & Do/Don't Component
 * Generates structured first-aid procedural step cards and comparative lists
 * Ziad Asaad - Frontend/UX System
 */

const StepCardComponent = {
  /**
   * Render numbered sequential action cards
   * @param {Array<string|{text: string, subtext?: string}>} steps 
   * @returns {string} HTML string
   */
  renderSteps(steps = []) {
    if (!steps || steps.length === 0) return '';

    return `
      <div class="step-cards-container">
        ${steps.map((step, idx) => {
      const text = typeof step === 'string' ? step : step.text;
      const subtext = typeof step === 'object' && step.subtext ? `<div class="step-subtext">${step.subtext}</div>` : '';
      return `
            <div class="step-card-item">
              <div class="step-number-badge">${idx + 1}</div>
              <div class="step-content">
                <div class="step-text">${text}</div>
                ${subtext}
              </div>
              <input type="checkbox" class="step-check" title="تحديد كمنجز" aria-label="Mark step as done">
            </div>
          `;
    }).join('')}
      </div>
    `;
  },

  /**
   * Render Do / Don't comparative grid
   * @param {Array<string>} doList 
   * @param {Array<string>} dontList 
   * @returns {string} HTML string
   */
  renderDoDont(doList = [], dontList = []) {
    const isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';
    const doTitle = isArabic ? 'ما يجب فعله (إجراءات صحيحة)' : 'What to DO';
    const dontTitle = isArabic ? 'ما يُحظر فعله (أخطاء شائعة)' : 'What NOT to do';

    const hasDo = doList && doList.length > 0;
    const hasDont = dontList && dontList.length > 0;

    if (!hasDo && !hasDont) return '';

    return `
      <div class="dodont-grid">
        ${hasDo ? `
          <div class="dodont-card do">
            <div class="dodont-header">
              <i class="fa-solid fa-circle-check"></i>
              <span>${doTitle}</span>
            </div>
            <ul class="dodont-list">
              ${doList.map(item => `<li><i class="fa-solid fa-check" style="margin-inline-end: 6px; color: var(--severity-green);"></i>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${hasDont ? `
          <div class="dodont-card dont">
            <div class="dodont-header">
              <i class="fa-solid fa-circle-xmark"></i>
              <span>${dontTitle}</span>
            </div>
            <ul class="dodont-list">
              ${dontList.map(item => `<li><i class="fa-solid fa-xmark" style="margin-inline-end: 6px; color: var(--severity-red);"></i>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }
};

if (typeof window !== 'undefined') {
  window.StepCardComponent = StepCardComponent;
}
