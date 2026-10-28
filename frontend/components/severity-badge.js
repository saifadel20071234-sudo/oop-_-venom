/**
 * Severity Badge Component
 * Generates triage-compliant visual severity badges with vector icons
 * ZIAD ASAAD - Frontend/UX System
 */

const SeverityBadge = {
  /**
   * Render an HTML string for a severity badge
   * @param {'red'|'orange'|'green'|string} severity 
   * @param {string} [customLabel]
   * @returns {string} HTML string
   */
  render(severity, customLabel = null, isArabic = null) {
    const sev = (severity || 'green').toLowerCase();

    if (isArabic === null) {
      isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';
    }

    const defaultLabels = {
      red: isArabic ? 'حالة حرجة / طارئة' : 'Critical / Emergency',
      orange: isArabic ? 'حالة متوسطة / تحتاج رعاية' : 'Moderate / Medical Care',
      green: isArabic ? 'حالة بسيطة / رعاية منزلية' : 'Minor / Home Care'
    };

    const icons = {
      red: 'fa-solid fa-circle-exclamation',
      orange: 'fa-solid fa-triangle-exclamation',
      green: 'fa-solid fa-circle-check'
    };

    const label = customLabel || defaultLabels[sev] || defaultLabels.green;
    const iconClass = icons[sev] || icons.green;

    return `
      <span class="badge-severity ${sev}" data-severity="${sev}">
        <i class="${iconClass}" style="margin-inline-end: 2px;"></i>
        <span class="badge-dot"></span>
        <span class="badge-label">${label}</span>
      </span>
    `;
  }
};

if (typeof window !== 'undefined') {
  window.SeverityBadge = SeverityBadge;
}
