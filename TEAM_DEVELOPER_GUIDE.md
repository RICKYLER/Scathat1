# Scathat - Team Developer Guide

## Welcome to the Scathat Project

This guide is designed for your development team. It explains how to understand, modify, and extend the Scathat codebase.

---

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Project Structure Overview](#project-structure-overview)
3. [Key Components Explained](#key-components-explained)
4. [Making Changes](#making-changes)
5. [Common Tasks](#common-tasks)
6. [Code Style Guide](#code-style-guide)
7. [File Organization](#file-organization)
8. [Troubleshooting](#troubleshooting)

---

## Quick Setup

### Prerequisites
- Node.js 18 or higher
- Git
- A code editor (VS Code recommended)
- Chrome browser (for extension testing)

### Get Started in 5 Minutes

\`\`\`bash
# 1. Clone or download the project
cd scathat

# 2. Install all dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
\`\`\`

That's it! The app is now running locally.

---

## Project Structure Overview

### Main Directories

\`\`\`
scathat/
├── web/                      # Main Next.js website and dashboard
│   ├── app/                 # Page routes and layouts
│   ├── components/          # React components organized by feature
│   ├── styles/              # Global CSS and theme configuration
│   ├── lib/                 # Utilities and helper functions
│   ├── hooks/               # Custom React hooks
│   └── public/              # Static files (images, icons, etc)
│
├── extension/               # Chrome browser extension
│   ├── src/                # Source code
│   ├── public/             # Manifest and extension assets
│   └── dist/               # Compiled output
│
├── docs/                   # Documentation files
├── scripts/                # Database and automation scripts
└── README.md               # Project overview
\`\`\`

### What's Each Folder For?

| Folder | Purpose | What You Edit |
|--------|---------|---------------|
| `web/app/page.tsx` | Landing page | Main page structure |
| `web/app/dashboard/` | User dashboard | Scanner, results display |
| `web/components/marketing/` | Marketing sections | Hero, features, testimonials, etc |
| `web/components/dashboard/` | Dashboard UI | Scanner panels, charts, stats |
| `web/styles/globals.css` | Theme & colors | Colors, fonts, design tokens |
| `extension/src/popup/` | Extension popup | What users see in the extension |

---

## Key Components Explained

### Marketing Page Components

These components make up the landing page. Edit them in `web/components/marketing/`:

#### Header (`header.tsx`)
**What it does:** Navigation bar at the top
**Edit to:** Change menu links, add new nav items, update branding

#### Hero (`hero.tsx`)
**What it does:** Main headline and first impression
**Edit to:** Change headline, adjust animations, modify CTAs

#### Problem (`problem.tsx`)
**What it does:** Lists user pain points
**Edit to:** Change problem statements, adjust styling

#### Solution (`solution.tsx`)
**What it does:** Explains how Scathat solves problems
**Edit to:** Update benefits, add features

#### How It Works (`how-it-works.tsx`)
**What it does:** 6-step walkthrough
**Edit to:** Change steps, add/remove steps, modify descriptions

#### Download (`download.tsx`)
**What it does:** Call-to-action for downloading extension
**Edit to:** Change download links, update messaging

#### Testimonials (`testimonials.tsx`)
**What it does:** User reviews and social proof
**Edit to:** Add/remove testimonials, change quotes

#### CTA (`cta.tsx`)
**What it does:** Final call-to-action before footer
**Edit to:** Change messaging, adjust buttons

#### Footer (`footer.tsx`)
**What it does:** Footer with links and information
**Edit to:** Update links, add social media, change text

---

## Making Changes

### Common Workflow

1. **Find the file** you want to edit (refer to structure above)
2. **Open it** in your code editor
3. **Make changes**
4. **Save the file** (Ctrl+S or Cmd+S)
5. **Refresh browser** to see changes immediately

### Example: Change the Hero Headline

\`\`\`tsx
// File: web/components/marketing/hero.tsx
// Around line 50, change this:

<h1 className="...">
  <span className="...">Scan Smart Contracts</span> Like Never Before
</h1>

// To this:
<h1 className="...">
  <span className="...">Secure Your Crypto</span> With One Click
</h1>
\`\`\`

Changes appear instantly on http://localhost:3000!

---

## Common Tasks

### Task 1: Update a Button Text

**Find:** The button you want to change
**Edit:** Change the text between `<Button>` tags

\`\`\`tsx
// Before:
<Button>Download Extension</Button>

// After:
<Button>Get Chrome Extension</Button>
\`\`\`

### Task 2: Change a Color

All colors are defined in one place: `web/styles/globals.css`

\`\`\`css
/* Find this section and update values */
:root {
  --background: oklch(0.145 0 0);      /* Dark background */
  --foreground: oklch(0.985 0 0);      /* Light text */
  --cyan-400: #00bcd4;                 /* Primary cyan */
  --cyan-600: #0097a7;                 /* Darker cyan */
}
\`\`\`

### Task 3: Add a New Section to Landing Page

1. Create new file: `web/components/marketing/new-section.tsx`
2. Write component (copy structure from existing section)
3. Import in `web/app/page.tsx`
4. Add to JSX:

\`\`\`tsx
// In web/app/page.tsx
import { NewSection } from "@/components/marketing/new-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      {/* Add here: */}
      <NewSection />
      {/* Rest of sections... */}
    </main>
  )
}
\`\`\`

### Task 4: Change a Link

\`\`\`tsx
// Before:
<Link href="/auth">Sign In</Link>

// After:
<Link href="/dashboard">Dashboard</Link>
\`\`\`

### Task 5: Add a Responsive Feature

Use Tailwind's responsive prefixes:

\`\`\`tsx
// Desktop: 2 columns, Mobile: 1 column
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>

// Breakpoints:
// sm: 640px
// md: 768px  ← Most common for mobile/desktop split
// lg: 1024px
// xl: 1280px
\`\`\`

---

## Code Style Guide

### Naming Conventions

**Files:** Use kebab-case (lowercase with hyphens)
\`\`\`
✅ hero.tsx
✅ how-it-works.tsx
❌ HeroSection.tsx
❌ HowItWorksSection.tsx
\`\`\`

**React Components:** Use PascalCase (capitalize first letter)
\`\`\`tsx
export function Hero() { }      // ✅
export function hero() { }      // ❌
\`\`\`

**Functions/Variables:** Use camelCase (lowercase first letter)
\`\`\`tsx
const handleClick = () => {}     // ✅
const HandleClick = () => {}     // ❌
\`\`\`

**Constants:** Use UPPER_SNAKE_CASE
\`\`\`tsx
const MAX_RETRIES = 3            // ✅
const maxRetries = 3             // ❌
\`\`\`

### Comments

Add comments to explain WHY, not WHAT:

\`\`\`tsx
// ❌ Bad - Obvious what the code does
const name = "John"  // set name to John

// ✅ Good - Explains the reason
// User's name is stored as first name only (not including last name)
const name = "John"
\`\`\`

### Component Structure

\`\`\`tsx
/**
 * Component Name
 * 
 * Brief description of what this component does.
 * Key features:
 * - Feature 1
 * - Feature 2
 */

import { dependencies } from "@/lib/..."
import { useState } from "react"

export function ComponentName() {
  // State and hooks at top
  const [isOpen, setIsOpen] = useState(false)

  // Helper functions in middle
  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  // JSX at bottom
  return (
    <div>
      {/* JSX content */}
    </div>
  )
}
\`\`\`

---

## File Organization

### When Adding a New Feature

Follow this structure:

\`\`\`
web/components/
└── feature-name/
    ├── index.tsx           # Main component
    ├── component.tsx       # Sub-components (if needed)
    └── types.ts            # TypeScript interfaces
\`\`\`

### Example: Add a "Pricing" Section

1. Create: `web/components/marketing/pricing.tsx`
2. Write component
3. Import and add to `web/app/page.tsx`

---

## Troubleshooting

### Problem: Changes aren't showing up

**Solution:** 
1. Save the file (Ctrl+S)
2. Refresh browser (F5 or Cmd+R)
3. Check browser console for errors (F12)

### Problem: Styling looks broken

**Solution:**
1. Check `web/styles/globals.css` is imported
2. Verify class names are spelled correctly
3. Check if color tokens exist in globals.css

### Problem: Extension not updating

**Solution:**
\`\`\`bash
npm run build:extension
# Then in Chrome:
# 1. Open chrome://extensions/
# 2. Click "Reload" button on extension
\`\`\`

### Problem: Can't find a file

**Solution:**
- Use Ctrl+P (Cmd+P on Mac) in VS Code to search for files
- Type filename to find it instantly

---

## Working with Your Team

### Before Starting Work

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test on mobile and desktop
4. Create a pull request for review

### Code Review Tips

- Keep comments explaining your changes
- Use clear variable names
- Test responsiveness on mobile
- Don't remove or rename existing functions without updating imports

### Communication

- Document complex logic with comments
- Use descriptive commit messages: "Add pricing section" (good) vs "Fix stuff" (bad)
- Ask for help if you're stuck

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Styling guide
- [Next.js Docs](https://nextjs.org/docs) - React framework
- [React Docs](https://react.dev) - Component library
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/) - Extension development

---

## Need Help?

1. Check this guide first
2. Look at similar existing components for examples
3. Search project files for similar patterns
4. Ask a team member

Good luck! 🚀
