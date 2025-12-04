#!/usr/bin/env python3
"""
Security Setup Script for TikTok Script AI
Generates secure keys for production deployment
"""

import secrets
import os

def generate_keys():
    print("=" * 60)
    print("🔐 TikTok Script AI - Security Setup")
    print("=" * 60)
    print()
    
    # Generate keys
    secret_key = secrets.token_hex(32)
    admin_key = secrets.token_hex(32)
    
    print("✅ Generated secure keys!")
    print()
    print("📋 Copy these to your .env file or Render environment variables:")
    print("-" * 60)
    print(f"SECRET_KEY={secret_key}")
    print(f"ADMIN_KEY={admin_key}")
    print(f"FLASK_ENV=production")
    print(f"PORT=3000")
    print("-" * 60)
    print()
    
    # Create .env file
    create_env = input("Create .env file automatically? (y/n): ").lower()
    if create_env == 'y':
        with open('.env', 'w') as f:
            f.write(f"# Security Configuration\n")
            f.write(f"SECRET_KEY={secret_key}\n")
            f.write(f"ADMIN_KEY={admin_key}\n")
            f.write(f"FLASK_ENV=development\n")
            f.write(f"PORT=3000\n")
        print("✅ .env file created successfully!")
        print("⚠️  IMPORTANT: Never commit .env to Git!")
    else:
        print("📝 Please manually create .env file with the keys above")
    
    print()
    print("🔒 Security Features Enabled:")
    print("  ✓ Password hashing (PBKDF2-SHA256)")
    print("  ✓ Rate limiting (10 login attempts/min)")
    print("  ✓ Input validation")
    print("  ✓ Admin key protection")
    print("  ✓ CORS security")
    print()
    print("🚀 Ready to deploy!")
    print()

if __name__ == "__main__":
    generate_keys()
