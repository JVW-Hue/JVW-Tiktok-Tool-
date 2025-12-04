# Security Features

## 🔒 Implemented Security Measures

### 1. **Rate Limiting**
- **Login attempts**: 10 per minute per IP
- **Signup attempts**: 5 per hour per IP
- **API calls**: 30 per minute per IP
- **General requests**: 200 per day, 50 per hour per IP

### 2. **Password Security**
- Passwords hashed using Werkzeug's `pbkdf2:sha256` algorithm
- Minimum 6 characters required
- Automatic migration from plain text to hashed passwords
- Secure password storage in backend

### 3. **Input Validation**
- Email format validation using regex
- Password strength requirements
- Plan type validation (free/pro/enterprise only)
- SQL injection prevention through JSON handling

### 4. **Authentication**
- Email/password authentication required
- Admin endpoints protected with API key
- Session management via localStorage (client-side)

### 5. **CORS Protection**
- Restricted to specific API endpoints
- Limited HTTP methods (GET, POST only)
- Controlled headers

### 6. **Error Handling**
- Generic error messages to prevent information leakage
- 429 rate limit errors
- 500 internal server errors
- Proper HTTP status codes

### 7. **Admin Protection**
- Admin dashboard requires secret key
- Environment variable for admin key
- Separate authentication layer

## 🛡️ Setup Instructions

### For Local Development:
1. Copy `.env.example` to `.env`
2. Generate secure keys:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
3. Update `.env` with your keys:
   ```
   SECRET_KEY=your-generated-secret-key
   ADMIN_KEY=your-generated-admin-key
   FLASK_ENV=development
   ```

### For Production (Render/GitHub):
1. Set environment variables in Render dashboard:
   - `SECRET_KEY`: Your secret key
   - `ADMIN_KEY`: Your admin key
   - `FLASK_ENV`: production
   - `PORT`: 3000

## 🚨 Security Best Practices

### DO:
✅ Use strong, unique passwords
✅ Keep environment variables secret
✅ Regularly update dependencies
✅ Monitor rate limit logs
✅ Use HTTPS in production
✅ Backup `users_data.json` regularly

### DON'T:
❌ Commit `.env` file to Git
❌ Share admin keys publicly
❌ Use default keys in production
❌ Disable rate limiting
❌ Store sensitive data in localStorage

## 🔐 Password Policy
- Minimum length: 6 characters
- Hashed using PBKDF2-SHA256
- Salted automatically
- No password reuse checking (can be added)

## 📊 Rate Limit Details

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| `/api/login` | 10/min | Prevent brute force |
| `/api/signup` | 5/hour | Prevent spam accounts |
| `/api/upgrade` | 5/min | Prevent abuse |
| `/api/user-count` | 30/min | Prevent scraping |
| `/api/admin/users` | 10/min | Admin protection |

## 🛠️ Additional Security Recommendations

1. **Add HTTPS**: Use SSL certificate in production
2. **Add CAPTCHA**: Prevent bot signups
3. **Add 2FA**: Two-factor authentication
4. **Add Email Verification**: Verify user emails
5. **Add Session Tokens**: JWT tokens instead of localStorage
6. **Add IP Blocking**: Block malicious IPs
7. **Add Logging**: Track suspicious activities
8. **Add Backup**: Automated database backups

## 📝 Reporting Security Issues
If you discover a security vulnerability, please email: security@yourdomain.com

## 🔄 Updates
- v1.0 - Initial security implementation
- Password hashing, rate limiting, input validation
