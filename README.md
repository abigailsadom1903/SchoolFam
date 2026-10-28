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
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Security Notes](#security-notes)
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

5. **Open the app** at the local address printed in the terminal (Vite usually uses `http://localhost:5173`).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## Security Notes

- Never commit `.env.local` or any API key to the repository.
- A key placed in a client-side Vite app can be exposed to browser users. For a public deployment, route Gemini calls through a backend and keep the key on the server.

## Author

**Abigail Alau R. Sadom**
Bachelor of Computer Science (Software Engineering), Universiti Malaysia Sabah
GitHub: [@abigailsadom1903](https://github.com/abigailsadom1903)
