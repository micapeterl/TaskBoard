# TaskBoard

A polished Kanban-style task management app built with Next.js 15, TypeScript, and Supabase.

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **Drag & Drop:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Backend / DB:** Supabase (direct from frontend)
- **Auth:** Supabase Anonymous Sign-In (guest sessions, no email required)
- **Deploy:** Vercel

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd taskboard
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**, paste the contents of `supabase/schema.sql`, and run it
3. Go to **Authentication → Settings** → enable **"Allow anonymous sign-ins"**
4. Copy your **Project URL** and **anon public key** from **Settings → API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Features

| Feature | Status |
|---|---|
| Kanban board (To Do / In Progress / In Review / Done) | ✅ |
| Drag & drop between columns | ✅ |
| Anonymous guest sessions (Supabase Auth) | ✅ |
| Row Level Security — users only see their own tasks | ✅ |
| Create task (title, description, priority, due date, status, labels) | ✅ |
| Inline quick-add per column | ✅ |
| Task detail modal with inline editing | ✅ |
| Comments on tasks | ✅ |
| Activity log (status changes, priority changes, comments) | ✅ |
| Custom labels with color picker | ✅ |
| Due date urgency indicators (overdue / soon) | ✅ |
| Priority indicators on cards (strip + badge) | ✅ |
| Search tasks by title | ✅ |
| Filter by priority and label | ✅ |
| Board stats (total / done / overdue) | ✅ |
| Loading skeletons | ✅ |
| Empty states | ✅ |
| Responsive layout | ✅ |

## Database Schema

See `supabase/schema.sql` for the full schema. Tables:

- `tasks` — core task data with RLS
- `labels` — user-defined labels
- `task_labels` — many-to-many junction
- `comments` — per-task comments
- `activity_log` — change history

## Design

Dark-mode first with a warm amber accent palette. Typography: **Syne** (display) + **DM Sans** (body). Inspired by Linear and Notion.
