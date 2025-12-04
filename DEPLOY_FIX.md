# Deploy Login Fix to GitHub/Render

## Files Already Fixed ✅
- `main.py` - Increased rate limits (20/hour signup, 30/min login)
- `script.js` - API calls use `window.location.origin` (works on any domain)

## Deploy Steps

### 1. Commit Changes to GitHub
```bash
git add .
git commit -m "Fix login network errors - increase rate limits and improve API calls"
git push origin main
```

### 2. Render Will Auto-Deploy
- Render detects the push and rebuilds automatically
- Wait 2-3 minutes for deployment

### 3. Verify It Works
- Visit your Render URL (e.g., https://your-app.onrender.com)
- Try to sign up with a test email
- Try to login
- Should work without "network error"

## If Still Having Issues

### Check Render Logs
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors

### Common Issues:
- **"Too many requests"** → Rate limits hit (wait 1 hour)
- **"Server error"** → Check Render logs for Python errors
- **"Connection error"** → Render service might be sleeping (free tier)

### Environment Variables (Must Be Set in Render)
- `SECRET_KEY` - Random string (generate: `python -c "import secrets; print(secrets.token_hex(32))"`)
- `ADMIN_KEY` - Your admin password
- `FLASK_ENV` - Set to `production`
- `PORT` - Set to `3000`

## Test Commands (Local)
```bash
# Test locally first
python run_app.py

# Open browser to http://localhost:3000
# Try signup/login
```

## Support
If users still can't login after deployment:
1. Check Render logs for errors
2. Verify environment variables are set
3. Make sure Render service is running (not paused)
4. Test with different email addresses
