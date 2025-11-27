# FoodSense PWA

FoodSense is a mobile-first Progressive Web App that pairs a smart food scale (ESP32 + HX711) with AI-powered nutrition analysis. Users can log meals in guest mode or via email/password accounts, capture a plate photo, connect to the scale via Web Bluetooth or Wi-Fi polling, and store the AI macro/micro breakdown for later review.

## Tech stack

- **Next.js 16 App Router (TypeScript)** – UI + API routes in a single project
- **Tailwind CSS (v4)** for responsive styling
- **Custom hooks** (`useGuestSession`, `useAuth`, `useLiveWeight`) for session + hardware state
- **In-memory data store** mocking a database layer
- **Mock Gemini integration** (swappable) inside `/api/analyze-meal`
- **PWA support** with manifest + offline-first service worker

## Core features

- Landing experience with Sign up / Log in / Continue as guest CTA
- Guest sessions stored in `localStorage` + cookies, migratable to real accounts later
- Email/password auth issuing JWT cookies (`/api/auth/*`, `/api/me`)
- Dual scale transport:
  - Web Bluetooth notifications from ESP32 (service `0xFFF0`, characteristic `0xFFF1`)
  - Wi-Fi / backend fallback via `/api/scale/live-weight`
- Camera/photo capture flow and AI analysis trigger via `/api/analyze-meal`
- Meal history dashboard (`/app`, `/app/log`) with macro totals + per-meal breakdowns
- Installable PWA (`manifest.webmanifest`, `public/sw.js`) with update prompts

## Project structure

```
src/
  app/
    page.tsx                # Landing page (guest CTA)
    login/, signup/         # Auth flows
    app/                    # Authenticated/guest shell + routes (Today, History, New)
    api/                    # REST-style endpoints for auth, meals, scale, AI
  components/
    common/Button.tsx
    layout/AppShell.tsx
    meal/MealForm.tsx, NutritionResultCard.tsx, MealHistoryList.tsx
    providers/AppProviders.tsx, ServiceWorkerRegister.tsx
    scale/BluetoothConnectButton.tsx, WeightDisplay.tsx
  hooks/
    useGuestSession.tsx, useAuth.tsx, useLiveWeight.tsx
  lib/
    store.ts, types.ts, auth.ts, api-utils.ts
public/
  manifest.webmanifest, sw.js, icons/
```

## Running locally

```bash
npm install
npm run dev
```

- Open `http://localhost:3000` for the landing page
- Try guest mode (creates a local UUID) or create an account via `/signup`
- Navigate to `/app/new` to connect to the mock scale, capture a food photo, and run the AI analysis flow
- Meal data lives in-memory; restart the dev server to reset fixtures

## PWA notes

- `public/manifest.webmanifest` describes install metadata (name, icons, theme colors)
- `public/sw.js` precaches the shell + icons and applies cache/network strategies
- `ServiceWorkerRegister` client component manages registration + "new version" notices

## Replacing the mock AI

`src/lib/store.ts → mockAnalyzeMeal` returns deterministic nutrition data for now. Replace this implementation with a Gemini/GPT call and keep the existing response shape to make the frontend compatible.
