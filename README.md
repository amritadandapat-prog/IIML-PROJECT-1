# Taskflow — Task Manager

A clean, responsive task manager built with **Next.js, React, TypeScript, and CSS**. It is ready to push to GitHub and deploy on Vercel.

## Features

- Create, edit, and delete tasks
- Set start dates, due dates, project/category, and priority
- Track progress from 0–100% with a slider
- Mark tasks as complete or reopen them
- Dashboard metrics: total, in progress, completed, overdue
- Overall progress and upcoming/overdue attention list
- Search tasks and filter by status or upcoming deadline
- Responsive layout for desktop and mobile
- Saves tasks in browser `localStorage` (no database setup required)

## Run locally

Requires Node.js 18.17 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy with GitHub + Vercel

1. Create a new repository on GitHub.
2. Unzip this project and put the contents in the repository root.
3. Commit and push the files:

```bash
git init
git add .
git commit -m "Build Taskflow task manager"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

4. Sign in to [Vercel](https://vercel.com), choose **Add New → Project**, and import the GitHub repository.
5. Keep the detected framework as **Next.js** and click **Deploy**. No environment variables are required.

Vercel will automatically redeploy when you push future changes to the connected GitHub branch.

## Important notes

- This starter stores tasks in the current browser on the current device. It does **not** sync tasks across devices or users.
- The dashboard calculates overdue and upcoming tasks whenever you open the app.
- The bell indicator flags overdue work in the dashboard; this version does not send email, SMS, or push notifications.
- To add cross-device sync, authentication, team collaboration, or scheduled email/push reminders, connect a database and notification service (for example Supabase plus an email/push provider).
- Sample tasks are included on first launch. Use **Reset sample data** in the task section to restore them.

## Project structure

```text
taskflow-manager/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── .gitignore
├── next.config.js
├── next-env.d.ts
├── package.json
└── tsconfig.json
```
