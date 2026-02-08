# Update Backend CORS for Vercel Frontend

The CORS configuration is already properly set up to use environment variables! 🎉

## ✅ What's Already Done

Both backend services use `.env` files for CORS configuration:

- **API:** Uses `CORS_ALLOWED_ORIGINS` from `.env`
- **Image Service:** Uses `CORS_ALLOWED_ORIGINS` from `.env`
- Both `.env.example` files have been updated with the Vercel domain

## 📋 Deploy Updated Configuration

### Step 1: SSH into HostEurope Server

```bash
ssh your-username@your-server.hosteurope.de
```

### Step 2: Update API Configuration

```bash
# Navigate to API directory
cd ~/psychobilly-online-api

# Pull latest changes
git pull origin main

# Update .env file
nano .env
```

**Update this line:**

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.psychobilly-online.de
```

Save and exit (Ctrl+X, Y, Enter)

### Step 3: Update Image Service Configuration

```bash
# Navigate to image service directory
cd ~/psychobilly-online-images

# Pull latest changes
git pull origin main

# Update .env file
nano .env
```

**Update this line:**

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.psychobilly-online.de
```

Save and exit (Ctrl+X, Y, Enter)

### Step 4: Verify (No restart needed - PHP reads .env on each request)

Test from your browser console at https://app.psychobilly-online.de:

```javascript
// Test API
fetch('https://psychobilly-online.de/api/v1/health')
  .then((r) => r.json())
  .then((data) => console.log('✅ API works!', data))
  .catch((err) => console.error('❌ CORS error:', err));

// Test Image Service
fetch('https://psychobilly-online.de/images/')
  .then((r) => r.json())
  .then((data) => console.log('✅ Image service works!', data))
  .catch((err) => console.error('❌ CORS error:', err));
```

## 🎯 Summary

**Changes made locally and pushed:**

- ✅ API `.env.example` updated with Vercel domain
- ✅ Image service `.env.example` updated with Vercel domain
- ✅ Both pushed to GitHub

**What you need to do on the server:**

1. Pull latest code (`git pull`)
2. Update `.env` files with the new domain
3. Test in browser - should work immediately!

**Why this approach is better:**

- ✅ Changes tracked in Git
- ✅ Configuration via environment variables
- ✅ Easy to add more origins in the future
- ✅ No hardcoded URLs in code
- ✅ Development and production use same codebase
