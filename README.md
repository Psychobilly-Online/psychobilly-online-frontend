# Psychobilly Online - Frontend

Modern Next.js 16 frontend for the Psychobilly Online community platform.

**Live Site:** [app.psychobilly-online.de](https://app.psychobilly-online.de)

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
# Edit .env.local with your local API endpoints

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
- **Deployment:** Vercel

## 🌐 Architecture

This frontend connects to:

- **REST API:** `https://psychobilly-online.de/api/v1/` (PHP backend)
- **Image Service:** `https://psychobilly-online.de/images/`
- **Forum:** `https://www.psychobilly-online.de/community` (phpBB)

**Key Patterns:**

- BFF (Backend for Frontend) API routes in `/app/api`
- CSS Modules for component styling
- Design system with CSS custom properties
- Infinite scroll for event listings
- Context API for search state management

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

The project uses a comprehensive CSS variable system for consistent theming:

- **Spacing Scale:** 3px base unit (`--spacing-1` to `--spacing-15`)
- **Color Palette:** Semantic color variables for backgrounds, borders, text, and accents
- **Typography:** Standardized font sizes and weights
- **Shadows:** Three levels (sm, md, lg)
- **Breakpoints:** Mobile (<768px), Tablet (768-991px), Desktop (≥992px)

**Location:** `src/app/globals.css`

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature`
3. **Make your changes** (follow existing code style)
4. **Write/update tests** for your changes
5. **Run tests:** `npm run test:run`
6. **Build:** `npm run build` (ensure no errors)
7. **Commit:** Use clear, descriptive commit messages
8. **Push and open a Pull Request**

**Code Style:**

- Use TypeScript for type safety
- CSS Modules for component styling
- Design system variables instead of hardcoded values
- Test new components and hooks
- Keep components focused and reusable

## 📄 License

Proprietary - © 2026 Psychobilly Online

---

**Questions?** Open an issue or contact: info@psychobilly-online.dene.de](https://app.psychobilly-online.de) (Vercel)

Auto-deploys from `main` branch. Preview deployments for all pull requests.

## 📝 Environment Variables

Create `.env.local` with these variables (see `.env.example`):

```env
NEXT_PUBLIC_LEGACY_URL=https://www.psychobilly-online.de
NEXT_PUBLIC_API_URL=https://psychobilly-online.de/api/v1
NEXT_PUBLIC_IMAGE_URL=https://psychobilly-online.de/images
NEXT_PUBLIC_SITE_NAME=Psychobilly Online
NEXT_PUBLIC_SITE_URL=https://app.psychobilly-online.de
```

## 🎯 Current Features

**✅ Implemented:**

- Homepage with project information
- Events listing with infinite scroll
- Advanced filtering (country, city, date, category, genre, status, search)
- Field-specific search (headline, bands, venue, city, description)
- Top navigation bar
- Responsive design (mobile-first)
- CSS design system with scoped modules

**🔨 In Progress:**

- Event details page
- User authentication

**📋 Planned:**

- User dashboards and profiles
- Event creation/editing
- Band and venue pages
- Photo galleries
- Reviews and comments
