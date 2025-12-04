# GitHub Pages Setup

## Important: GitHub Pages Limitation

GitHub Pages only hosts **static files** (HTML, CSS, JS). It **cannot run Python/Flask backend**.

## Two Options:

### Option 1: Use GitHub Pages (Static Only - No Backend)
- Users stored in browser localStorage only
- No server-side authentication
- Works immediately on GitHub Pages
- Limited features

### Option 2: Deploy Backend to Render/Heroku (Recommended)
- Full authentication with database
- Secure password hashing
- User data persists across devices
- All features work

## Recommended: Deploy to Render

1. Go to https://render.com
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python run_app.py`
   - **Environment Variables**:
     - `SECRET_KEY`: (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
     - `ADMIN_KEY`: your-admin-password
     - `FLASK_ENV`: production
     - `PORT`: 3000
6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Your app will be live at: `https://your-app-name.onrender.com`

## Current Status
Your code is ready for Render deployment. GitHub Pages cannot run the login system.
