"""
Special Cases Module (الحالات الخاصة)
Member 2 - Knowledge Base & Inference Engine
System: First Aid Knowledge Base System

Handles high-risk patient groups and physiological conditions:
1. Infant (< 1 year): Any burn or breathing issue = Immediate RED
2. Child (1-12 years): Lower threshold for burns and trauma
3. Elderly (> 65 years): Osteoporosis, high-risk fractures and falls
4. Pregnant: Position adjustments (left lateral recumbent), chest thrusts for choking, eclampsia risk
5. Diabetic: Hypoglycemia vs syncope, diabetic foot cuts
"""

from typing import Dict, Any, List, Optional


class SpecialCasesHandler:
    """
    Manages and enforces clinical special-case rules that override
    or modify standard first aid triage decisions.
    """

    def __init__(self):
        pass

    def evaluate(self, facts: Dict[str, Any], current_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Evaluates facts for special patient demographics or co-morbidities
        and updates or augments the triage result accordingly.

        Args:
            facts: Extracted medical facts (condition, symptoms, age, age_group, pregnancy, diabetes, etc.)
            current_result: Optional current triage result from InferenceEngine

        Returns:
            Dictionary containing:
                - severity: updated or original severity ('red', 'orange', 'green')
                - special_case_applied: bool
                - special_cases_detected: list of detected categories
                - action_modifications: list of specific clinical actions/warnings
                - special_notes: clinical explanation for the user and medical staff
        """
        if current_result is None:
            current_result = {
                "severity": "green",
                "actions": [],
                "rules_fired": [],
                "explanation": ""
            }

        severity = current_result.get("severity", "green")
        actions = list(current_result.get("actions", []))
        rules_fired = list(current_result.get("rules_fired", []))
        explanations = []

        detected_cases = []
        action_modifications = []

        # Extract normalized demographic facts
        age = facts.get("age")
        age_group = str(facts.get("age_group", "")).lower()
        is_infant = age_group == "infant" or (isinstance(age, (int, float)) and age < 1)
        is_child = age_group == "child" or (isinstance(age, (int, float)) and 1 <= age <= 12)
        is_elderly = age_group == "elderly" or (isinstance(age, (int, float)) and age >= 65)
        is_pregnant = bool(facts.get("pregnant") or facts.get("is_pregnant"))
        is_diabetic = bool(facts.get("diabetic") or facts.get("has_diabetes"))

        condition = str(facts.get("condition", "")).lower()

        # ==========================================
        # 1. الرضيع (Infant < 1 year)
        # ==========================================
        if is_infant:
            detected_cases.append("infant")
            # Any burn in infant is an automatic critical emergency (RED)
            if condition == "burn":
                severity = "red"
                rules_fired.append("SPECIAL_INFANT_BURN_RED")
                action_modifications.append("رضيع مصاب بحرق: نقل فوري لطوارئ الحروق؛ رقة جلد الرضيع تجعل الحرق السطحي نافذاً للأنسجة بسرعة.")
                explanations.append("تم تصعيد الحالة لأحمر (حرج): أي حرق للأطفال الرضع أقل من عام يمثل خطورة مهددة للحياة ويستوجب طوارئ مستشفى.")

            # Choking modifications for infant
            if condition == "choking":
                severity = "red"
                rules_fired.append("SPECIAL_INFANT_CHOKING_RED")
                action_modifications.append("حظر مناورة هيمليك وضغطات البطن للرضيع تماماً منعاً لتمزق الكبد؛ البدء بـ 5 ضربات على الظهر بكعب اليد متبوعة بـ 5 ضغطات على الصدر بإصبعين فقط.")
                explanations.append("تطبيق بروتوكول اختناق الرضع الخاص (ضربات ظهرية وضغطات صدرية بإصبعين).")

            # Respiratory distress in infant
            if facts.get("difficulty_breathing") or facts.get("dyspnea") or condition == "asthma":
                severity = "red"
                rules_fired.append("SPECIAL_INFANT_RESPIRATORY_RED")
                action_modifications.append("صعوبة التنفس لدى الرضع تتطلب أكسجيناً فورياً في المستشفى.")
                explanations.append("صعوبة تنفس لدى رضيع: تصعيد فوري لأحمر.")

        # ==========================================
        # 2. الطفل (Child 1 - 12 years)
        # ==========================================
        elif is_child:
            detected_cases.append("child")
            if condition == "burn" and severity == "green":
                # Lower threshold: Burns covering > 5% of child body need clinical evaluation
                severity = "orange"
                rules_fired.append("SPECIAL_CHILD_BURN_THRESHOLD")
                action_modifications.append("عتبة الحروق لدى الأطفال أقل من البالغين: يجب تقييم الحرق طبياً لاستبعاد الجفاف.")
                explanations.append("تصعيد لبرتقالي: عتبة الخطورة للأطفال أقل نظراً لسرعة فقدان السوائل.")

            if condition == "choking":
                action_modifications.append("مناورة هيمليك للأطفال فوق عام: النزول على الركبتين خلف الطفل واستخدام قوة ضغط متناسبة مع حجم جسمه.")

        # ==========================================
        # 3. كبير السن (Elderly > 65 years)
        # ==========================================
        if is_elderly:
            detected_cases.append("elderly")
            # Fractures and falls carry extreme risks in elderly due to osteoporosis
            if condition in ["fracture", "fall", "trauma"]:
                if severity == "green":
                    severity = "orange"
                rules_fired.append("SPECIAL_ELDERLY_FRACTURE_RISK")
                action_modifications.append("كبير سن مع اشتباه كسر: حظر تحريك المصاب تماماً لاحتمالية كسر عنق الفخذ أو الفقرات الناتجة عن هشاشة العظام.")
                explanations.append("تصعيد الخطورة لكبير السن لاحتمال الكسور المضاعفة والنزيف الباطني بسبب الهشاشة.")

            # Fainting in elderly could be cardiac event or stroke
            if condition == "fainting":
                if severity != "red":
                    severity = "orange"
                rules_fired.append("SPECIAL_ELDERLY_SYNCOPE")
                action_modifications.append("الإغماء لدى كبار السن يتطلب تخطيط قلب وفحص ضغط فوري لاستبعاد الجلطات واضطراب نبض القلب.")
                explanations.append("إغماء كبير السن يستوجب فحصاً طارئاً لاستبعاد الأسباب القلبية والدماغية.")

        # ==========================================
        # 4. الحامل (Pregnant)
        # ==========================================
        if is_pregnant:
            detected_cases.append("pregnant")
            # Choking modification: NO abdominal thrusts
            if condition == "choking":
                action_modifications.append("حامل تعاني من الاختناق: ممنوع الضغطات البطنية مطلقاً لحماية الجنين والرحم؛ يتم تطبيق ضغطات صدرية (Chest Thrusts) في منتصف عظمة القص.")
                rules_fired.append("SPECIAL_PREGNANT_CHOKING")
                explanations.append("تعديل مناورة الاختناق للحامل: ضغطات صدرية بدلاً من ضغطات البطن.")

            # Positioning modification: Left lateral recumbent to avoid supine hypotension
            if condition in ["fainting", "heatstroke", "trauma", "low_blood_sugar"]:
                action_modifications.append("وضع الحامل: الاستلقاء على الجانب الأيسر (Left Lateral Tilt) لمنع ضغط الرحم على الوريد الأجوف السفلي وهبوط الضغط الحاد.")
                rules_fired.append("SPECIAL_PREGNANT_POSITIONING")
                explanations.append("إلزام الاستلقاء على الجانب الأيسر للحامل لتأمين تدفق الدم للجنين والقلب.")

            # Seizures or bleeding during pregnancy = Critical Emergency
            if condition in ["seizures", "cut", "bleeding"]:
                severity = "red"
                rules_fired.append("SPECIAL_PREGNANT_CRITICAL_RED")
                action_modifications.append("تشنجات أو نزيف للحامل يمثل طوارئ ولادة حرجة (اشتباه تسمم حمل / انفصال مشيمة)؛ نقل فوري للإسعاف 123.")
                explanations.append("تصعيد فوري لأحمر: طوارئ ولادة حرجة تهدد حياة الأم والجنين.")

        # ==========================================
        # 5. مريض السكري (Diabetic)
        # ==========================================
        if is_diabetic:
            detected_cases.append("diabetic")
            # Fainting in diabetic is suspected hypoglycemia until proven otherwise
            if condition in ["fainting", "unconscious"]:
                rules_fired.append("SPECIAL_DIABETIC_HYPO_OVERRIDE")
                action_modifications.append("مريض سكري فاقد للوعي: اشتباه غيبوبة هبوط سكر حادة؛ حظر السوائل بالفم، إعطاء حقنة جلوكاجون إن توفرت، وطلب 123 فوراً.")
                if severity != "red":
                    severity = "red"
                explanations.append("تصعيد لأحمر: مريض سكر فاقد للوعي يعامل كغيبوبة هبوط سكر حرجة تتطلب تدخلاً طبياً عاجلاً.")

            # Cuts on feet or extremities in diabetic
            location = str(facts.get("location", "")).lower()
            if condition in ["cut", "bleeding"] and location in ["foot", "leg", "feet", "toe"]:
                if severity == "green":
                    severity = "orange"
                rules_fired.append("SPECIAL_DIABETIC_FOOT_WOUND")
                action_modifications.append("جروح القدم لمريض السكري: غسيل وتطهير عاجل وتغطية معقمة ومراجعة عيادة القدم السكري لتجنب تقرحات ومضاعفات البتر.")
                explanations.append("تصعيد لبرتقالي: جروح قدم مريض السكري تتطلب رعاية تخصصية.")

        # Merge actions (avoiding duplicates)
        final_actions = list(actions)
        for act in action_modifications:
            if act not in final_actions:
                final_actions.insert(0, act)  # Insert special actions at the top

        # Build combined explanation
        if explanations:
            combined_exp = " | ".join(explanations)
            if current_result.get("explanation"):
                combined_exp = f"{current_result.get('explanation')} [{combined_exp}]"
        else:
            combined_exp = current_result.get("explanation", "")

        return {
            "severity": severity,
            "rules_fired": rules_fired,
            "actions": final_actions,
            "questions": current_result.get("questions", []),
            "explanation": combined_exp,
            "special_case_applied": len(detected_cases) > 0,
            "special_cases_detected": detected_cases,
            "action_modifications": action_modifications
        }


# Global singleton instance for easy import
special_cases_handler = SpecialCasesHandler()
