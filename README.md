<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SchoolFam

**Where Education Communication Meets Convenience.**

A React and TypeScript web app that connects parents, teachers and school administrators on one platform for daily school life: attendance, pickups, activity updates, messaging, fees, documents and more. It also integrates the Google Gemini API for AI assistance.

Built with Google AI Studio: [open the app in AI Studio](https://ai.studio/apps/drive/1OG7_VDMtyYDJLXSWGWIjmN5KWLKdtjvF)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Key Implementation Decisions](#key-implementation-decisions)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Security Notes](#security-notes)
- [Known Limitations](#known-limitations)
- [Author](#author)

---

## Project Overview

SchoolFam is a school communication and management platform. Parents follow their child's day and handle paperwork and payments from one place; teachers record attendance, share activities and message families; administrators manage classes, announcements, documents and accounts.

## Problem Statement

Schools and families often communicate through a patchwork of messaging groups, paper notes, emails and separate payment channels. Important notices get lost, pickups and absences are tracked on paper, and parents have no single view of their child's attendance, health, homework and fees.

SchoolFam consolidates these into one convenient platform so that information is timely, traceable and easy to act on.

## Features

The application's data model covers the following areas.

- **Attendance:** daily records (present, absent, late, excused) and parent-submitted absence requests with approval.
- **Safe pickup:** pickup status per student, guardian records with ID photos, and verification with a signature and photo.
- **Activity feed:** learning, play, meal, nap and health updates with photos and likes.
- **Health and safety:** growth records (height and weight), medical notes and allergies, and incident reports that parents can acknowledge.
- **Messaging:** direct and group chat channels with attachments.
- **Announcements and notifications:** school-wide, class and emergency notices.
- **Homework:** assignments with due dates and attachments.
- **Calendar:** academic, school and class events with RSVP, capacity and recurrence.
- **Fees and payments:** invoices, card or bank-transfer payment, and proof-of-payment upload for verification.
- **Documents:** reports, forms and policies, including documents that require a signature.
- **School shop:** uniforms, books, merchandise and club equipment, with a cart and pickup or delivery orders.
- **Feedback tickets:** categorised parent feedback with priority, status, comments and resolution rating.
- **Class management:** classes, levels, capacity and teacher assignment.
- **Referral codes** for onboarding users by role.
- **Dashboards and charts** (Recharts) for administrators.
- **Gemini-powered AI features** through the Google GenAI SDK.

## User Roles

| Role | Purpose |
| --- | --- |
| Parent | View child updates, request absences, pay fees, message teachers |
| Teacher | Record attendance, post activities, verify pickups, assign homework |
| Admin | Manage classes, announcements, documents, orders and feedback |
| Super Admin | Oversee the whole system and issue referral codes |

## Technology Stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Language | TypeScript 5.8 |
| Build tool | Vite 6 |
| AI | Google Gemini API (`@google/genai`) |
| Charts | Recharts |
| Icons | Lucide React |
| Markdown rendering | react-markdown |

## Architecture

SchoolFam is a **client-side single-page application**. This repository contains no backend or database.

```
index.html / index.tsx     app entry
App.tsx                    app shell and view selection
components/                one component per feature (Auth, DailyFeed, AttendanceManager,
                           PickupManager, ChatSystem, Billing, CalendarView, ShopManager,
                           FeedbackSystem, HealthTracker, SmartSummary, ...)
services/geminiService.ts  the only external call (Gemini API)
types.ts                   shared TypeScript domain model
constants.ts               app constants
vite.config.ts             dev server (port 3000) and environment injection
```

```
UserRole (PARENT | TEACHER | ADMIN | SUPER_ADMIN)
        │
        ▼
   App.tsx ──▶ feature components ──▶ shared types
                       │
                       └─(Smart Summary)──▶ geminiService ──▶ Gemini API
```

Each feature is a self-contained component that reads and writes the shared domain types, which keeps features independent and easy to extend.

## Data Model

The domain model is defined as TypeScript interfaces in `types.ts`. The main entities and how they relate:

| Entity | Purpose | Key relationships |
|---|---|---|
| `User` | Account with a `UserRole` | Teachers have a class and subjects |
| `Child` / `SimpleStudent` | Student profile, medical details, emergency contact | `parentId`, `accessCode` for parent linkage |
| `SchoolClass` | Class with level, capacity and status | Assigned `teacherId` |
| `Activity` | Daily feed entry (learning, play, food, nap, health) | Tagged to one or more `studentIds` |
| `AttendanceRecord`, `AbsenceRequest` | Attendance and absence approvals | By `studentId` |
| `PickupSession`, `Guardian` | Pickup status, verification, signature and photo | By `studentId`, `guardianId` |
| `HealthRecord`, `Incident` | Growth records; incident reports acknowledged by parents | By `studentId` |
| `ChatChannel`, `Message` | Direct and group messaging | `participants`, `channelId` |
| `Invoice` | Fees with `paid`, `pending`, `overdue` or `verifying` status | By `studentId` |
| `ShopItem`, `CartItem`, `ShopOrder` | Shop catalogue and orders | `parentId` |
| `FeedbackTicket`, `FeedbackComment` | Support tickets with internal notes | `parentId`, `childId`, `assignedTo` |
| `Homework`, `SchoolEvent`, `Announcement`, `SchoolDocument`, `Notification`, `ReferralCode` | Supporting content | Various |

## Key Implementation Decisions

- **Role-based experience.** A single `UserRole` enum (parent, teacher, admin, super admin) drives what each user sees.
- **One component per feature** with a shared type layer, so features can be developed and tested independently.
- **Typed status enums** (for example `PickupStatus` and the invoice and feedback statuses) make workflow states explicit and prevent invalid values at compile time.
- **Pickup safety workflow.** A pickup records the guardian, the verifying teacher, a signature and a captured photo.
- **Parent-controlled linking.** Children carry an `accessCode`, and sign-up uses referral codes tied to a role.
- **Gemini integration isolated in one service.** `geminiService.ts` builds a prompt from the child's name, class and the day's activities and asks for a Markdown summary: a warm opening, skills practised, a mood observation and a conversation starter. It returns friendly fallback messages when the key is missing or the request fails.
- **Markdown rendering** of the AI output with `react-markdown`.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (current LTS recommended)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/abigailsadom1903/SchoolFam.git
   cd SchoolFam
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add your API key.** Create a file named `.env.local` in the project root:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the app** at the local address printed in the terminal (the dev server is configured for `http://localhost:3000`).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## Security Notes

- Never commit `.env.local` or any API key to the repository.
- A key placed in a client-side Vite app can be exposed to browser users. For a public deployment, route Gemini calls through a backend and keep the key on the server.

## Known Limitations

- **The Gemini API key is built into the browser bundle.** `vite.config.ts` injects `GEMINI_API_KEY` at build time, so anyone who can load the app can read it. This is acceptable for local development only (see Security Notes above).
- **No backend or persistence in this repository.** The data model is defined in types, but there is no database, authentication server or real-time messaging service. Features such as payments, chat and notifications are interface-level.
- **Roles are a front-end concept.** Without a server enforcing permissions, role-based access is not a security boundary.
- **Sensitive data needs real safeguards** (children's medical details, photos, guardian IDs) before any real deployment: encrypted storage, access control and consent handling.
- **AI summaries can be inaccurate.** They infer mood and milestones from short activity notes and should be reviewed by a teacher before being shared as fact.

## Author

**Abigail Alau R. Sadom**
Bachelor of Computer Science (Software Engineering), Universiti Malaysia Sabah
GitHub: [@abigailsadom1903](https://github.com/abigailsadom1903)
