# TikTok Script AI

AI-powered TikTok script generator for viral content creation.

## Features
- Generate viral-ready scripts in seconds
- Multiple tone options (Funny, Educational, Serious, Casual, Inspirational)
- Free, Pro, and Enterprise plans
- PayPal payment integration
- PDF export functionality
- Trending hashtags and music suggestions
- 🔒 Secure authentication with password hashing
- 🛡️ Rate limiting to prevent abuse
- 🔐 Admin dashboard with key protection

## Security Features
- Password hashing (PBKDF2-SHA256)
- Rate limiting (10 login attempts/min)
- Input validation
- CORS protection
- Admin key authentication
- See [SECURITY.md](SECURITY.md) for details

## Deploy to Render

1. Push to GitHub
2. Connect your GitHub repo to Render
3. Deploy as a Web Service
4. **Set Environment Variables:**
   - `SECRET_KEY`: Generate with `python -c "import secrets; print(secrets.token_hex(32))"`
   - `ADMIN_KEY`: Your secret admin key
   - `FLASK_ENV`: production
   - `PORT`: 3000
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `python run_app.py`

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your keys
# Generate keys: python -c "import secrets; print(secrets.token_hex(32))"

# Run the app
python run_app.py
```

Visit http://localhost:3000

## Admin Dashboard
Access: http://localhost:3000/admin.html
Requires: Admin key (set in environment variables)

## License
© 2024 TikTok Script AI
