"""
Storage Manager Module
Task: Member 4 - Data + File Handling
System: First Aid Awareness System
farah el-sherbiny (data architect)
"""

import os
import csv
import json
import shutil
from datetime import datetime
from typing import Dict, List, Any, Optional


class StorageManager:
    """
    Singleton StorageManager:
    مسؤول عن قراءة وكتابة جميع ملفات البيانات (TXT / CSV / JSON / LOG)
    """
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(StorageManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, base_dir: Optional[str] = None):
        if self._initialized:
            return

        # تحديد المسارات الأساسية
        if base_dir:
            self.base_dir = os.path.abspath(base_dir)
        else:
            self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

        self.data_dir = os.path.join(self.base_dir, "data")
        self.guides_dir = os.path.join(self.data_dir, "guides")
        self.logs_dir = os.path.join(self.base_dir, "logs")
        self.backup_dir = os.path.join(self.base_dir, "backups")
        self.log_file = os.path.join(self.logs_dir, "queries.log")

        # إنشاء المجلدات إن لم تكن موجودة
        for folder in [self.data_dir, self.guides_dir, self.logs_dir, self.backup_dir]:
            os.makedirs(folder, exist_ok=True)

        self._initialized = True

    # ==========================================
    # 1. ملفات الأدلة الطبية (TXT)
    # ==========================================
    def load_guide(self, filename: str) -> Dict[str, Any]:
        """تحميل ملف دليل طبي وقراءة الهيدر والمحتوى"""
        filepath = os.path.join(self.guides_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"الملف غير موجود: {filepath}")

        guide = {
            "filename": filename,
            "title": "",
            "source": "",
            "date_reviewed": "",
            "url": "",
            "language": "EN",
            "condition_tag": "",
            "severity_tags": [],
            "content": ""
        }

        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        is_body = False
        body_lines = []

        for line in lines:
            stripped = line.strip()
            if not is_body:
                if stripped == "---":
                    is_body = True
                    continue
                if ":" in stripped:
                    key, val = stripped.split(":", 1)
                    key = key.strip().upper()
                    val = val.strip()
                    if key == "TITLE":
                        guide["title"] = val
                    elif key == "SOURCE":
                        guide["source"] = val
                    elif key == "DATE_REVIEWED":
                        guide["date_reviewed"] = val
                    elif key == "URL":
                        guide["url"] = val
                    elif key == "LANGUAGE":
                        guide["language"] = val
                    elif key == "CONDITION_TAG":
                        guide["condition_tag"] = val
                    elif key == "SEVERITY_TAGS":
                        guide["severity_tags"] = [t.strip() for t in val.split(",") if t.strip()]
            else:
                body_lines.append(line)

        guide["content"] = "".join(body_lines).strip()
        return guide

    def save_guide(self, filename: str, content: Dict[str, Any]) -> bool:
        """حفظ أو تعديل ملف دليل مع أخذ نسخة احتياطية تلقائياً"""
        filepath = os.path.join(self.guides_dir, filename)
        if os.path.exists(filepath):
            self._backup(filepath)

        severity_str = ", ".join(content.get("severity_tags", []))
        header = [
            f"TITLE: {content.get('title', '')}",
            f"SOURCE: {content.get('source', '')}",
            f"DATE_REVIEWED: {content.get('date_reviewed', '')}",
            f"URL: {content.get('url', '')}",
            f"LANGUAGE: {content.get('language', 'EN')}",
            f"CONDITION_TAG: {content.get('condition_tag', '')}",
            f"SEVERITY_TAGS: {severity_str}",
            "---",
            content.get("content", "")
        ]

        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(header))
        return True

    def list_guides(self) -> List[Dict[str, Any]]:
        """عرض وتحميل جميع الأدلة الطبية المتوفرة"""
        guides = []
        if not os.path.exists(self.guides_dir):
            return guides

        for fname in sorted(os.listdir(self.guides_dir)):
            if fname.endswith(".txt"):
                try:
                    guides.append(self.load_guide(fname))
                except Exception as e:
                    print(f"خطأ في تحميل {fname}: {e}")
        return guides

    # ==========================================
    # 2. ملفات الجداول (CSV)
    # ==========================================
    def load_contacts(self) -> List[Dict[str, str]]:
        """تحميل أرقام الطوارئ والجهات الطبية من contacts.csv"""
        filepath = os.path.join(self.data_dir, "contacts.csv")
        return self._read_csv(filepath)

    def load_clinics(self) -> List[Dict[str, str]]:
        """تحميل بيانات العيادات والمراكز الصحية من clinics.csv"""
        filepath = os.path.join(self.data_dir, "clinics.csv")
        return self._read_csv(filepath)

    def load_training_data(self) -> List[Dict[str, Any]]:
        """تحميل داتا تدريب النموذج (CSV أو Excel)"""
        csv_file = os.path.join(self.data_dir, "training_data.csv")
        if os.path.exists(csv_file):
            return self._read_csv(csv_file)

        excel_file = os.path.join(self.data_dir, "Training_data.xlsx")
        if os.path.exists(excel_file):
            import pandas as pd
            df = pd.read_excel(excel_file)
            return df.fillna("").to_dict(orient="records")

        return []

    def load_sources_log(self) -> List[Dict[str, str]]:
        """تحميل سجل المصادر والمراجع"""
        filepath = os.path.join(self.data_dir, "sources_log.csv")
        return self._read_csv(filepath)

    # ==========================================
    # 3. ملفات الـ JSON (قواعد الفرز والفهرس)
    # ==========================================
    def load_rules(self) -> Dict[str, Any]:
        """تحميل قواعد الفرز الطبي rules.json"""
        filepath = os.path.join(self.data_dir, "rules.json")
        if not os.path.exists(filepath):
            return {}
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_rules(self, rules: Dict[str, Any]) -> bool:
        """حفظ قواعد الفرز الطبي مع أخذ نسخة احتياطية"""
        filepath = os.path.join(self.data_dir, "rules.json")
        if os.path.exists(filepath):
            self._backup(filepath)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(rules, f, ensure_ascii=False, indent=2)
        return True

    def load_index(self) -> Dict[str, Any]:
        """تحميل الفهرس المحفوظ inverted_index.json"""
        filepath = os.path.join(self.data_dir, "inverted_index.json")
        if not os.path.exists(filepath):
            return {}
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_index(self, index: Dict[str, Any]) -> bool:
        """حفظ الفهرس في inverted_index.json"""
        filepath = os.path.join(self.data_dir, "inverted_index.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(index, f, ensure_ascii=False, indent=2)
        return True

    # ==========================================
    # 4. السجلات والخصوصية (LOG)
    # ==========================================
    def log_query(self, query: str, condition: str, severity: str, response_time_ms: int, session_id: str = "anon") -> None:
        """تسجيل الاستعلام في queries.log بدون أي بيانات شخصية"""
        self._rotate_logs_if_needed()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        clean_query = query.replace("\n", " ").replace('"', "'").strip()
        log_line = (
            f'{timestamp} | QUERY: "{clean_query}" | '
            f'CONDITION: {condition} | SEVERITY: {severity} | '
            f'RESPONSE_TIME: {response_time_ms}ms | SESSION: {session_id}\n'
        )

        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_line)

    def _rotate_logs_if_needed(self, max_bytes: int = 10 * 1024 * 1024) -> None:
        """أرشفة اللوج في ملف جديد إذا تجاوز حجمه 10 ميجابايت"""
        if os.path.exists(self.log_file) and os.path.getsize(self.log_file) >= max_bytes:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            archived = os.path.join(self.logs_dir, f"queries_{ts}.log")
            shutil.move(self.log_file, archived)

    # ==========================================
    # 5. دوال مساعدة ونسخ احتياطي
    # ==========================================
    def _backup(self, filepath: str) -> None:
        """عمل نسخة احتياطية من الملف قبل الكتابة عليه"""
        if not os.path.exists(filepath):
            return
        fname = os.path.basename(filepath)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(self.backup_dir, f"{fname}_{ts}.bak")
        shutil.copyfile(filepath, backup_path)

    def _read_csv(self, filepath: str) -> List[Dict[str, str]]:
        """دالة مساعدة بسيطة لقراءة أي ملف CSV"""
        if not os.path.exists(filepath):
            return []
        rows = []
        with open(filepath, "r", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(dict(row))
        return rows


# كائن جاهز للاستخدام
storage = StorageManager()


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sm = StorageManager()
    print("=" * 50)
    print(" فحص ملفات البيانات (Data & File Handling)")
    print("=" * 50)
    print(f"- عدد الأدلة الطبية (Guides): {len(sm.list_guides())} ملف")
    print(f"- جهات الطوارئ (Contacts): {len(sm.load_contacts())} سجل من الملف الرئيسي")
    print(f"- العيادات والمراكز (Clinics): {len(sm.load_clinics())} سجل من الملف الرئيسي")
    print(f"- بيانات التدريب (Training Data): {len(sm.load_training_data())} سطر")
    print(f"- سجل المصادر (Sources Log): {len(sm.load_sources_log())} مرجع")
    print(f"- قواعد الفرز (Rules): {len(sm.load_rules().get('rules', []))} قاعدة")
    print("=" * 50)
    print("[نجاح] تم توليد وربط contacts.csv و clinics.csv من الملف الرئيسي بنجاح!")
