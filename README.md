# Psychobilly Online - Frontend

Modern Next.js 15 frontend for Psychobilly Online community.

> **📚 See [Root README](../README.md)** for complete project overview and architecture  
> **🗺️ See [ROADMAP](../ROADMAP.md)** for project timeline and phases  
> **📋 See [TODO.md](./TODO.md)** for current tasks and priorities

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/Psychobilly-Online/psychobilly-online-frontend.git
cd psychobilly-online-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19
- **Styling:** Tailwind CSS + MUI (@mui/material, @mui/x-date-pickers)
- **Language:** TypeScript
- **API:** REST (connects to psychobilly-online-api)

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/        # Public pages
│   │   ├── page.tsx     # Homepage
│   │   ├── events/      # Events pages
│   │   └── venues/      # Venues pages
│   ├── (admin)/         # Admin pages (auth required)
│   │   └── admin/
│   │       ├── page.tsx # Dashboard
│   │       ├── events/  # Manage events
│   │       └── venues/  # Manage venues
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── globals.css
├── components/
│   ├── ui/              # Reusable UI components
│   ├── admin/           # Admin-specific components
│   └── public/          # Public-facing components
├── lib/
│   ├── api.ts           # API client
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
└── types/
    └── index.ts         # TypeScript types
```

## 🌐 API Integration

The frontend communicates with:

- **API:** `https://psychobilly-online.de/api/v1/`
- **Images:** `https://psychobilly-online.de/images/`

## 🔐 Authentication

JWT-based authentication with the main API. Tokens are stored and sent with protected requests.

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🚢 Deployment

Deployed on Vercel at `https://app.psychobilly-online.de`

## 📝 Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_LEGACY_URL` - URL of the old website
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_IMAGE_URL` - Image service URL
- `NEXT_PUBLIC_SITE_NAME` - Site name
- `NEXT_PUBLIC_SITE_URL` - Site URL

## 🎯 MVP Features

- [x] Homepage
- [x] Events listing with infinite scroll
- [x] Event filtering (country, city, date, search)
- [ ] Event details
- [ ] Admin dashboard
- [ ] Add/edit events
- [ ] Add/edit venues
- [ ] Image upload integration
- [ ] User authentication
