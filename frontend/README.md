# 🌌 TechVerse — VCET Educational Technology & E-Resources Portal

**Velalar College of Engineering and Technology (Autonomous), Erode, Tamil Nadu**  
*Explore • Learn • Build*

TechVerse is a modern, high-performance academic resource, e-learning discovery, and campus placement training portal designed for the engineering scholars and faculty members of VCET.

---

## 🏗️ Frontend Architecture & Project Structure

The frontend is built with **React 19 + Vite + Tailwind CSS + Framer Motion**, following a clean, modular component architecture.

```
main/
│
├── 📁 public/                     → Static assets (favicons, video banners)
│   ├── favicon.png
│   └── home-banner-video.mp4
│
├── 📁 src/
│   │
│   ├── 📁 assets/                 → Optimized college imagery & logos
│   │   ├── 📁 college/            → 18 real campus background photographs (campus-01 to campus-18)
│   │   ├── 📁 domains/            → Cinematic covers for the 4 primary domains
│   │   ├── 📁 logos/              → Resource logos (OpenAI, AWS, LeetCode, GitHub, etc.)
│   │   ├── vcet-wide-logo.png     → Official wide college emblem
│   │   ├── vcet-logo.png          → VCET shield crest
│   │   └── 25-years-white.png     → Silver Jubilee celebration mark
│   │
│   ├── 📁 components/             → Reusable UI Components
│   │   ├── Navbar.jsx             → Single-row sticky header with animated underline indicator & mobile sheet
│   │   ├── Footer.jsx             → 4-column dark institutional footer with gradient border & link hovers
│   │   ├── CollegeBackground.jsx  → Continuous viewport parallax & slow-zoom campus slideshow
│   │   ├── VisitorCounter.jsx     → Floating corner live visitor telemetry badge
│   │   ├── ScrollToTop.jsx        → Automatic scroll-reset upon page route navigation
│   │   ├── LoginForm.jsx          → Multi-role tabbed login form (Student, Faculty, Admin)
│   │   ├── LoginHeroPanel.jsx     → Split-screen brand showcase for authentication
│   │   ├── ResourceCard.jsx       → Interactive cards with hover lifts & hashtag filters
│   │   └── CategoryFilter.jsx     → Category pill filter buttons
│   │
│   ├── 📁 pages/                  → Top-Level Application Pages & Views
│   │   ├── HomePage.jsx           → Cinematic landing page with campus hero, 4 domains, and quick discovery
│   │   ├── DepartmentResourcesPage.jsx → Academic notes, 5-unit syllabus, question banks & free software across 7 branches
│   │   ├── TrainingPage.jsx       → Placement training tracks, company crackers (Zoho, TCS, Infosys), bootcamps & PDFs
│   │   ├── TechnologyPage.jsx     → Tech Explorer: Curated websites for AI, Web, DevOps & Cybersecurity
│   │   ├── UpdatesPage.jsx        → Tech Pulse: Live developer news feeds (TLDR, Hacker News, Daily.dev)
│   │   ├── YouTubePage.jsx        → Tech Vision: Curated engineering YouTube video channels
│   │   ├── AptitudePage.jsx       → Skill Forge: Placement aptitude preparation & formulas
│   │   ├── AnnouncementsPage.jsx  → Official circulars, exam schedules, hackathons (SIH), and placement alerts
│   │   ├── LoginPage.jsx          → Multi-role institutional login portal
│   │   └── DashboardPage.jsx      → Protected dashboard customized for Students, Faculty, and Admins
│   │
│   ├── 📁 data/                   → Static & Mock Datasets (Ready for MongoDB backend)
│   │   ├── departments.js         → 7 departments with full course syllabi, unit topics, notes, and software
│   │   ├── training.js            → Training modules, company mock tests, bootcamp schedules, and toolkits
│   │   ├── announcements.js       → Institutional circulars with priority tags and categories
│   │   ├── domains.js             → 4 core learning domain definitions
│   │   └── resources.js           → Master curated catalog of tech websites and tools
│   │
│   ├── 📁 services/               → Application Business Logic & Session Handlers
│   │   ├── authService.js         → Multi-role client authentication, session storage, and route protection
│   │   └── visitorService.js      → Campus visitor counting and telemetry recording
│   │
│   ├── 📁 config/                 → Global Configurations
│   │   ├── site.js                → College brand names, addresses, contacts, and navigation links
│   │   └── firebase.js            → Cloud database configuration
│   │
│   ├── App.jsx                    → Root application routing and page layout shell
│   ├── main.jsx                   → React DOM mounting entry point
│   └── index.css                  → Tailwind CSS directives, typography, and custom utilities
│
├── index.html                     → HTML5 template with Google Fonts (Inter)
├── vite.config.ts                 → Vite build configuration & alias mappings
└── package.json                   → Project dependencies and scripts
```

---

## 🗺️ Application Page Routing Table

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Campus slideshow, hero search, and the 4 core learning pillars. |
| `/departments` | `DepartmentResourcesPage` | Subject notes, 5-unit syllabus outlines, question banks, and free software for 7 engineering branches. |
| `/training` | `TrainingPage` | Placement bootcamps, company test series (Zoho, TCS, Infosys, Cognizant), and PDF toolkits. |
| `/technology` | `TechnologyPage` | Tech Explorer: Curated websites for web, AI, cloud, and security. |
| `/updates` | `UpdatesPage` | Tech Pulse: Curated daily developer news feeds. |
| `/youtube` | `YouTubePage` | Tech Vision: Educational engineering YouTube channels. |
| `/aptitude` | `AptitudePage` | Skill Forge: Quantitative aptitude and reasoning repositories. |
| `/announcements`| `AnnouncementsPage` | College circulars, SIH hackathons, and examination notices. |
| `/login` | `LoginPage` | Student (Reg No + DOB), Teacher (Staff ID), and Admin login. |
| `/dashboard` | `DashboardPage` | *(Protected Route)* Student/Faculty personalized portal. |

---

## 🎨 UI & Design Tokens

- **Primary Brand Blue:** `#0B4A8F` / `#0062A8`
- **Secondary Accent:** `#444445` (Slate Dark Gray) / `#F0F6FC` (Soft Blue Tint)
- **Status Green:** `#10B981` (Verified / Free License / Active)
- **Alert Red:** `#EF4444` (Urgent / Hackathon Deadline)
- **Typography:** `Inter`, `system-ui`, `-apple-system`, `sans-serif`
- **Animation Principles:**
  - Micro-interactions: `150ms - 200ms easeInOut`
  - Active Tab Sliding: Framer Motion shared `layoutId="navbarUnderline"`
  - Staggered Entrances: `whileInView` with `viewport={{ once: true }}`

---

## 🗄️ Database Architecture

For the complete 15-collection MongoDB database schema, Mongoose models, and RBAC matrix:
👉 **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

---

## 💻 Local Development Setup

```bash
# 1. Navigate to the frontend directory
cd main

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
# Server will start on http://localhost:5173

# 4. Create production build
npm run build
```

---

### 📄 Institutional Accreditation
© 2026 **Velalar College of Engineering and Technology (Autonomous)**  
*Affiliated to Anna University, Chennai • Accredited by NAAC with 'A+' Grade*
