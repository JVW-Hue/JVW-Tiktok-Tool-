# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - Name: TikTok Script AI
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait 2 minutes for setup

## Step 2: Get API Credentials

1. Go to Project Settings (gear icon)
2. Click "API" in sidebar
3. Copy these values:
   - Project URL
   - anon public key

## Step 3: Update supabase-config.js

Replace in supabase-config.js:
```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

## Step 4: Create Database Table

1. Go to Table Editor
2. Click "Create a new table"
3. Table name: profiles
4. Columns:
   - id (uuid, primary key, default: uuid_generate_v4())
   - email (text)
   - plan (text, default: 'free')
   - user_number (int8)
   - created_at (timestamptz, default: now())
5. Click "Save"

## Step 5: Enable Row Level Security

1. Click on profiles table
2. Click "RLS" tab
3. Enable RLS
4. Add policy:
   - Name: "Users can read own profile"
   - Policy: SELECT
   - Target roles: authenticated
   - USING expression: auth.uid() = id

## Step 6: Enable Email Auth

1. Go to Authentication
2. Click "Providers"
3. Enable "Email"
4. Save

## Step 7: Update index.html

Add before closing body tag:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="auth-supabase.js"></script>
```

## Step 8: Test

1. Push to GitHub
2. Open GitHub Pages URL
3. Try signup - should work instantly
4. Check Supabase dashboard - user should appear

## Done!

No more connection errors. No Flask. No Render. Just works.
