import os
import secrets
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for, send_from_directory
from flask_cors import CORS

from auth import admin_required
from routes.search_routes import search_bp
from routes.contacts_routes import contacts_bp
from routes.rules_routes import rules_bp
from routes.analytics_routes import analytics_bp
from routes.clinics_routes import clinics_bp
from routes.dashboard_routes import dashboard_bp
from routes.triage_routes import triage_bp
from routes.chatbot_routes import chatbot_bp

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
IS_PRODUCTION = APP_ENV == "production" or bool(os.getenv("RENDER")) or bool(os.getenv("VERCEL"))
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY")

if not ADMIN_PASSWORD:
    ADMIN_PASSWORD = "VENOM"
if not FLASK_SECRET_KEY:
    FLASK_SECRET_KEY = secrets.token_hex(32)

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for Frontend
app.secret_key = FLASK_SECRET_KEY
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=IS_PRODUCTION,
)


@app.after_request
def add_cache_control_headers(response):
    # Admin dashboard, login, and all APIs must NEVER be cached by browser
    if (
        request.path.startswith("/api/")
        or request.path.startswith("/admin")
        or request.path == "/login"
        or request.path == "/sw.js"
    ):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    else:
        response.headers["Cache-Control"] = "no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
    return response


@app.get("/admin")
@admin_required
def admin_panel():
    session.setdefault("csrf_token", secrets.token_urlsafe(32))
    return render_template("admin.html", csrf_token=session["csrf_token"])


@app.route("/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        password = request.form.get("password", "")
        if secrets.compare_digest(password, ADMIN_PASSWORD):
            session.clear()
            session["logged_in"] = True
            return redirect(url_for("admin_panel"))
        return '''
            <!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>تسجيل الدخول</title>
            <body style="text-align:center;padding-top:100px;font-family:Segoe UI,Tahoma,Arial,sans-serif;background:#101522;color:white;min-height:100vh">
            <h3 style="color:#e74c3c">كلمة المرور غير صحيحة!</h3>
            <p><a href="/login" style="color:#8dc8ff;text-decoration:none;font-weight:bold">← حاول مرة أخرى</a> | <a href="/" style="color:#38bdf8;text-decoration:none;font-weight:bold">العودة للموقع الرئيسي 🏠</a></p>
            </body></html>
        ''', 401

    return '''
        <!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>تسجيل دخول لوحة التحكم</title>
        <body style="text-align:center;padding:80px 20px 20px;font-family:Segoe UI,Tahoma,Arial,sans-serif;background:#101522;color:white;min-height:100vh;box-sizing:border-box">
        <div style="max-width:400px;margin:0 auto;background:#182032;padding:32px 24px;border-radius:12px;border:1px solid #2d3748;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
            <div style="font-size:2.5rem;margin-bottom:10px">🛡️</div>
            <h2 style="margin:0 0 6px 0;font-size:1.4rem">لوحة تحكم النظام (Admin)</h2>
            <p style="color:#94a3b8;font-size:0.85rem;margin:0 0 24px 0">First Aid Awareness Assistant · VENOM Team</p>
            <form method="POST">
                <label for="password" style="display:block;text-align:right;margin-bottom:8px;font-size:0.9rem;color:#cbd5e1">كلمة المرور</label>
                <input id="password" type="password" name="password" autocomplete="current-password" placeholder="أدخل كلمة المرور" style="padding:12px;width:100%;border-radius:8px;border:1px solid #334155;background:#0f172a;color:white;box-sizing:border-box;margin-bottom:16px;outline:none" required>
                <button type="submit" style="width:100%;padding:12px;background:#e74c3c;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:1rem;transition:background 0.2s">تسجيل الدخول</button>
            </form>
            <p style="color:#64748b;font-size:0.8rem;margin:20px 0 0 0">كلمة المرور الافتراضية: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;color:#f87171">VENOM</code></p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #334155">
                <a href="/" style="color:#38bdf8;text-decoration:none;font-size:0.9rem;font-weight:bold;display:inline-flex;align-items:center;gap:6px">
                    <span>🏠</span> <span>العودة للموقع الرئيسي</span>
                </a>
            </div>
        </div>
        </body></html>
    '''


@app.get("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"}), 200


app.register_blueprint(search_bp)
app.register_blueprint(contacts_bp)
app.register_blueprint(rules_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(clinics_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(triage_bp)
app.register_blueprint(chatbot_bp)


@app.get("/")
def home():
    """Serves the main frontend index.html."""
    frontend_index = BASE_DIR / "frontend" / "index.html"
    if frontend_index.is_file():
        return send_from_directory(BASE_DIR / "frontend", "index.html")
    return redirect(url_for("admin_panel"))


@app.get("/<path:filename>")
def serve_frontend_assets(filename):
    """
    Unified static & page server for frontend assets and routes.
    Supports:
      - Direct asset files (/css/main.css, /js/app.js, /manifest.json)
      - Subdirectory pages (/pages/chat.html, /pages/triage.html)
      - Extensionless page aliases (/chat, /triage, /contacts, /learn)
    """
    frontend_dir = BASE_DIR / "frontend"
    target_file = frontend_dir / filename

    if target_file.is_file():
        return send_from_directory(frontend_dir, filename)

    if target_file.is_dir() and (target_file / "index.html").is_file():
        return send_from_directory(target_file, "index.html")

    html_file = frontend_dir / f"{filename}.html"
    if html_file.is_file():
        return send_from_directory(frontend_dir, f"{filename}.html")

    page_file = frontend_dir / "pages" / f"{filename}.html"
    if page_file.is_file():
        return send_from_directory(frontend_dir / "pages", f"{filename}.html")

    return jsonify({"error": "Not found", "path": filename}), 404


if __name__ == "__main__":
    app.run(debug=(APP_ENV != "production"), use_reloader=(APP_ENV != "production"))
