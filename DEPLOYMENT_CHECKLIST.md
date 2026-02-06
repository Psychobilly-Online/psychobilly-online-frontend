# Frontend Deployment Checklist

## ✅ Completed Steps

- [x] Convert frontend from submodule to regular directory
- [x] Add environment configuration files (.env.example, .env.local)
- [x] Update README with deployment info
- [x] Create FRONTEND_HOSTING_SETUP.md documentation
- [x] Commit all changes to local git repository
- [x] Remove old remote (legacy application)

## 📋 Next Steps

### 1. Create GitHub Repository (5 minutes)

**Go to:** https://github.com/new

**Settings:**
- Repository name: `psychobilly-online-frontend`
- Description: `Next.js 15 frontend for Psychobilly Online community`
- Visibility: **Private** (or Public if you prefer)
- ❌ Do NOT initialize with README (we already have one)
- ❌ Do NOT add .gitignore (we already have one)
- ❌ Do NOT add license yet

**Click "Create repository"**

### 2. Push Code to GitHub (2 minutes)

After creating the repository, run these commands:

```bash
cd d:\webdev\psychobilly-online-v2

# Add the new remote
git remote add origin https://github.com/christianmautz/psychobilly-online-frontend.git

# Push the code
git push -u origin main
```

### 3. Deploy to Vercel (10 minutes)

**Go to:** https://vercel.com

**Step 1: Sign Up/Login**
- Click "Sign Up" or "Login"
- Choose "Continue with GitHub"
- Authorize Vercel to access your GitHub account

**Step 2: Import Project**
- Click "Add New..." → "Project"
- Find and select `psychobilly-online-frontend` repository
- Click "Import"

**Step 3: Configure Project**
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: **./ (default)** - Keep as is
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Step 4: Add Environment Variables**

Click "Environment Variables" and add:

```
NEXT_PUBLIC_API_URL = https://psychobilly-online.de/api/v1
NEXT_PUBLIC_IMAGE_URL = https://psychobilly-online.de/images
NEXT_PUBLIC_SITE_NAME = Psychobilly Online
NEXT_PUBLIC_SITE_URL = https://app.psychobilly-online.de
```

**Step 5: Deploy**
- Click "Deploy"
- Wait ~2 minutes for build to complete
- You'll get a URL like: `psychobilly-online-frontend.vercel.app`

**Test the deployment:** Click the URL to verify it works!

### 4. Configure Custom Domain (10 minutes)

**In Vercel Dashboard:**

1. Go to your project → Settings → Domains
2. Click "Add Domain"
3. Enter: `app.psychobilly-online.de`
4. Vercel will show DNS configuration instructions

**DNS Configuration at HostEurope:**

Login to your HostEurope account and add a DNS record:

- Type: **CNAME**
- Name: **app**
- Value: **cname.vercel-dns.com**
- TTL: **3600** (or default)

**Wait 5-10 minutes** for DNS propagation.

**Verify:**
- Visit: https://app.psychobilly-online.de
- Vercel automatically provisions SSL certificate (Let's Encrypt)
- Should see your Next.js homepage!

### 5. Update API CORS (5 minutes)

On your HostEurope server, update the API to allow requests from Vercel:

**File:** `~/psychobilly-online-api/public/index.php`

Add/update CORS middleware:

```php
// CORS middleware
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'https://app.psychobilly-online.de')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

// Handle preflight requests
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});
```

**Same for Image Service:** `~/psychobilly-online-images/public/index.php`

### 6. Test Everything (5 minutes)

- [ ] Visit https://app.psychobilly-online.de
- [ ] Page loads correctly with SSL
- [ ] Try making an API call (once you build the API integration)
- [ ] Check browser console for CORS errors
- [ ] Test on mobile device
- [ ] Verify images load (once implemented)

### 7. Setup Automatic Deployments (Already done! ✅)

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "feat: Add new feature"
git push

# Vercel automatically builds and deploys!
# Preview: https://psychobilly-online-frontend-git-branch-name.vercel.app
# Production: https://app.psychobilly-online.de
```

## 🎯 Architecture Summary

```
┌──────────────────────────────────────────────────┐
│ USER                                              │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│ FRONTEND (Vercel)                                 │
│ https://app.psychobilly-online.de                │
│ - Next.js 15 SSR/SSG                             │
│ - React 19 UI                                    │
│ - Admin Dashboard                                │
│ - Public Pages (events, venues)                  │
└──────────────────────────────────────────────────┘
                      ↓ API Calls
┌──────────────────────────────────────────────────┐
│ BACKEND (HostEurope)                              │
│ https://psychobilly-online.de                    │
│ ├─ /api/v1/*      → REST API (PHP 8.2)          │
│ ├─ /images/*      → Image Service (PHP 8.2)     │
│ └─ /community/*   → phpBB Forum                  │
│                                                   │
│ MySQL 8.0.36-28 Database                         │
└──────────────────────────────────────────────────┘
```

## 💰 Cost Breakdown

- **Vercel:** $0/month (Hobby plan - sufficient for MVP)
- **HostEurope:** Already paid (existing server)
- **Domain:** Already owned
- **SSL:** $0 (Vercel provides free, HostEurope has main domain)
- **Total Additional Cost:** **$0/month** ✅

## 🚀 What's Next After Deployment?

1. **Build API Client** - Create `lib/api.ts` with fetch wrappers
2. **Add Authentication** - Implement JWT login with your API
3. **Events Pages** - List and detail pages for events
4. **Admin Dashboard** - Event/venue management forms
5. **Image Upload** - Integrate with your image service

## 📚 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/christianmautz/psychobilly-online-frontend)
- [Frontend README](README.md)
- [Hosting Setup Guide](FRONTEND_HOSTING_SETUP.md)

---

**Ready to proceed?** Start with Step 1: Create GitHub Repository!
