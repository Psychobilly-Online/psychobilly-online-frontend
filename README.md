# Psychobilly Online - Frontend

Modern Next.js 16 frontend for Psychobilly Online community.

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

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19
- **Component Library:** MUI (@mui/material, @mui/x-date-pickers)
- **Styling:** CSS Modules + Design System (CSS variables)
- **Language:** TypeScript
- **Testing:** Vitest + React Testing Library
- **API:** REST (connects to psychobilly-online-api)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (Next.js backend)
│   │   ├── categories/         # Event categories endpoint
│   │   ├── cities/             # Cities endpoint
│   │   ├── countries/          # Countries endpoints
│   │   └── events/             # Events endpoints
│   ├── events/                 # Events listing page
│   │   ├── page.tsx            # Events list with infinite scroll
│   │   └── page.module.css     # Page-specific styles
│   ├── layout.tsx              # Root layout with TopBar
│   ├── page.tsx                # Homepage (Startpage)
│   └── globals.css             # Design system variables
├── components/
│   ├── common/                 # Reusable UI components
│   │   ├── IconButton.tsx      # Custom icon button (3 sizes, 3 variants)
│   │   ├── SearchChips.tsx     # Search term chips
│   │   └── __tests__/          # Component tests
│   ├── events/                 # Event-related components
│   │   ├── EventCard.tsx       # Event display card
│   │   ├── EventFilters.tsx    # Advanced filter form
│   │   ├── EventFilters*.tsx   # Filter sub-components
│   │   └── __tests__/          # Component tests
│   ├── layout/                 # Layout components
│   │   ├── TopBar.tsx          # Top navigation bar
│   │   ├── ClientLayout.tsx    # Client-side layout wrapper
│   │   └── __tests__/          # Component tests
│   └── pages/                  # Page components
│       └── Startpage.tsx       # Homepage content
├── contexts/
│   └── SearchContext.tsx       # Global search state management
├── hooks/
│   ├── useEvents.ts            # Events data fetching hook
│   └── useInfiniteScroll.ts    # Infinite scroll logic
├── lib/
│   ├── api-client.ts           # API client with error handling
│   └── date-utils.ts           # Date formatting utilities
├── constants/
│   └── layout.ts               # Layout constants (TOP_BAR_HEIGHT)
├── types/
│   └── index.ts                # TypeScript interfaces
└── test/
    └── setup.ts                # Vitest test configuration
```

## 🌐 API Integration

The frontend communicates with:

- **API:** `https://psychobilly-online.de/api/v1/`
- **Images:** `https://psychobilly-online.de/images/`

## 🔐 Authentication

JWT-based authentication with the main API. Tokens are stored and sent with protected requests.

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Open Vitest UI
npm run format       # Format with Prettier
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
- [x] Event filtering (country, city, date range, category, search)
- [x] Advanced filter UI with chips and popovers
- [x] Top navigation bar with context-aware search
- [x] Responsive design (mobile, tablet, desktop)
- [x] CSS design system with scoped modules
- [ ] Event details page
- [ ] Admin dashboard
- [ ] Add/edit events
- [ ] Add/edit venues
- [ ] Image upload integration
- [ ] User authentication

## 🎨 Design System

### CSS Variables (globals.css)

- **Spacing Scale:** 3px base (`--spacing-1` through `--spacing-15`)
- **Color Palette:** 20+ semantic variables
  - Backgrounds: `--color-bg-*`
  - Borders: `--color-border-*`
  - Text: `--color-text-*`
  - Accents: `--color-accent-*`
- **Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 991px (48em)
- Desktop: ≥ 992px (64em, max 1200px)
