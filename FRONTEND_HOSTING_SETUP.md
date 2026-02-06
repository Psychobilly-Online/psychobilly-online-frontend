# Frontend Hosting Setup - Vercel

## ✅ Why Vercel

- **Free SSL for subdomain** - Solves the 36€/year HostEurope SSL cost
- **Native Next.js support** - Zero configuration needed
- **GitHub integration** - Auto-deploy on push
- **Free tier** - 100GB bandwidth, unlimited requests
- **Scalable** - Start free, upgrade if needed

## 🚀 Setup Instructions

### Step 1: Prepare Your Repository (5 min)

```bash
cd d:\webdev\psychobilly-online-v2
git init
git add .
git commit -m "Initial commit: Next.js frontend with API integration"

# Create GitHub repo and push
git remote add origin https://github.com/christianmautz/psychobilly-online-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel (10 min)

1. **Sign up at [vercel.com](https://vercel.com)** with GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select `psychobilly-online-frontend` repository
   - Framework: Next.js (auto-detected)
   - Root Directory: `frontend`
   - Click "Deploy"

3. **Wait for deployment** (~2 minutes)
   - Vercel will build and deploy automatically
   - You'll get a URL like: `psychobilly-online-frontend.vercel.app`

### Step 3: Configure Custom Domain (5 min)

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Add domain: `app.psychobilly-online.de`
   - Vercel will provide DNS records

2. **In HostEurope DNS Settings:**
   - Add CNAME record:
     ```
     app.psychobilly-online.de → cname.vercel-dns.com
     ```
   - Wait 5-10 minutes for DNS propagation

3. **SSL Certificate:**
   - Vercel automatically provisions SSL (Let's Encrypt)
   - No action needed!

### Step 4: Configure Environment Variables (2 min)

In Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://psychobilly-online.de/api/v1
NEXT_PUBLIC_IMAGE_URL=https://psychobilly-online.de/images
```

### Step 5: Update API CORS (3 min)

On HostEurope, update API CORS to allow Vercel:

```php
// psychobilly-online-api/public/index.php
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'https://app.psychobilly-online.de')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});
```

## 🎯 Architecture Overview

```
USER BROWSER
    │
    ├── https://app.psychobilly-online.de (Frontend - Vercel)
    │   ├── SSR/SSG Pages
    │   ├── Admin Dashboard
    │   └── Makes API calls to backend →
    │
    └── https://psychobilly-online.de
        ├── /api/v1/* (REST API - HostEurope)
        ├── /images/* (Image Service - HostEurope)
        └── /community/* (phpBB Forum - HostEurope)
```

## 📦 Deployment Workflow

### Automatic Deployment (Recommended)

```bash
# Make changes locally
git add .
git commit -m "feat: Add events page"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds Next.js app
# 3. Deploys to production
# 4. Updates https://app.psychobilly-online.de
```

### Preview Deployments

Every branch and PR gets a unique preview URL:
```bash
git checkout -b feature/new-dashboard
git push origin feature/new-dashboard

# Vercel creates: psychobilly-online-frontend-git-feature-new-dashboard.vercel.app
```

## 💰 Cost Breakdown

### Free Tier Limits (Hobby Plan)
- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ Unlimited deployments
- ✅ 1 concurrent build
- ✅ Custom domains with SSL
- ✅ Automatic HTTPS
- ✅ Edge Network (CDN)

**Expected Usage:**
- Small community site: ~5-10GB/month
- **Cost: $0/month** ✅

### When to Upgrade (Pro Plan - $20/month)
- Need >100GB bandwidth
- Need team collaboration
- Need password protection for previews
- Need advanced analytics

**Recommendation:** Start with free tier, upgrade only if needed.

## 🔧 Development Workflow

### Local Development
```bash
cd d:\webdev\psychobilly-online-v2\frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens http://localhost:3000

# Make changes, test locally
# API calls go to: https://psychobilly-online.de/api/v1/
```

### Environment Variables (Local)
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://psychobilly-online.de/api/v1
NEXT_PUBLIC_IMAGE_URL=https://psychobilly-online.de/images
```

### Build & Test
```bash
# Build production bundle
npm run build

# Test production build locally
npm start
```

### Deploy
```bash
git add .
git commit -m "Your changes"
git push origin main

# Vercel deploys automatically
# Check build status at vercel.com/dashboard
```

## 🎨 Frontend Structure (MVP)

```
src/
├── app/
│   ├── (public)/              # Public pages
│   │   ├── page.tsx           # Homepage
│   │   ├── events/
│   │   │   ├── page.tsx       # Events list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Event detail
│   │   └── venues/
│   │       ├── page.tsx       # Venues list
│   │       └── [id]/
│   │           └── page.tsx   # Venue detail
│   ├── (admin)/               # Admin pages (auth required)
│   │   └── admin/
│   │       ├── layout.tsx     # Admin layout with sidebar
│   │       ├── page.tsx       # Dashboard
│   │       ├── events/
│   │       │   ├── page.tsx   # Manage events
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx
│   │       └── venues/
│   │           └── ... (similar structure)
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts   # NextAuth.js
│   ├── layout.tsx             # Root layout
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── EventForm.tsx
│   │   └── VenueForm.tsx
│   └── public/
│       ├── EventCard.tsx
│       └── VenueCard.tsx
├── lib/
│   ├── api.ts                 # API client
│   ├── auth.ts                # Auth utilities
│   └── utils.ts
└── types/
    └── index.ts               # TypeScript types
```

## 🔐 Authentication Flow

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  return data; // { token, user }
}

export async function apiRequest(endpoint: string, options = {}) {
  const token = localStorage.getItem('token'); // or from session
  
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
}
```

## 📸 Image Upload Integration

```typescript
// components/admin/EventForm.tsx
async function handleImageUpload(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('source', 'events');
  
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await res.json();
  return data.id; // Store this ID with event
}

// Display image
<img 
  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageId}-medium.jpg`}
  alt="Event"
/>
```

## 🎯 MVP Features Checklist

### Phase 1: Core Structure (Week 1)
- [ ] Homepage with hero section
- [ ] Navigation (public + admin)
- [ ] Basic layout components
- [ ] Environment configuration
- [ ] API client setup

### Phase 2: Events (Week 2)
- [ ] Events list page (public)
- [ ] Event detail page
- [ ] Admin: Add event form
- [ ] Admin: Edit event form
- [ ] Image upload integration

### Phase 3: Venues (Week 3)
- [ ] Venues list page
- [ ] Venue detail page
- [ ] Admin: Add/edit venue
- [ ] Link venues to events

### Phase 4: Admin Dashboard (Week 4)
- [ ] Dashboard overview
- [ ] Statistics (event count, etc.)
- [ ] Recent events list
- [ ] Quick actions

### Phase 5: Authentication (Week 5)
- [ ] Login page
- [ ] JWT token management
- [ ] Protected routes
- [ ] User profile page

## 🚀 Next Steps

1. **Push frontend to GitHub**
2. **Deploy to Vercel**
3. **Configure custom domain**
4. **Update API CORS**
5. **Start building MVP features**

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Timeline:** Ready to deploy in 30 minutes  
**Cost:** $0/month (free tier sufficient for MVP)  
**Scalability:** Easy upgrade when needed
