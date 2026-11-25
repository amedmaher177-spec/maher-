# UniLost – AI-Powered University Lost & Found

Full project: Next.js 14 (App Router) + Tailwind CSS + API routes + PostgreSQL (Supabase).
Own login: bcrypt password hashes + signed JWT in an httpOnly cookie (no Supabase Auth).

## Run locally
1. `npm install`
2. Run your `schema.sql`, then `db/update.sql`, in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` (Supabase pooler, port 6543) and `JWT_SECRET`
   (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
4. `npm run dev` then open http://localhost:3000
5. Register on /login, then make yourself admin in the SQL Editor:
   `update users set role = 'admin' where lower(email) = 'you@university.edu';`

## Pages
/ home · /feed · /report · /my-reports · /my-claims · /admin (admin only) · /login (login + register)

## API
/api/auth/{register,login,logout,me} · /api/items · /api/items/[id] · /api/my/{reports,claims}
/api/claims · /api/claims/[id] (admin) · /api/admin/overview (admin) · /api/profile · /api/stats

## Deploy (Vercel)
Push to GitHub, import the repo in Vercel, and add `DATABASE_URL` and `JWT_SECRET` under
Settings > Environment Variables. Never commit `.env.local`.
