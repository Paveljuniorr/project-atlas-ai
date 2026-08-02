# Project Atlas AI — SaaS Landing Page

Production-ready marketing site for **Project Atlas AI** (frontend-only, no backend required).

## Tech
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- SEO metadata
- Responsive UI with reusable components

## Install
```bash
npm install
```

## Run locally
```bash
npm run dev
```
Then open: http://localhost:3000

## Build
```bash
npm run build
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. Create a Vercel project.
3. Set Framework = Next.js.
4. Build Command: `npm run build`
5. Output Directory: left as default (Next.js).

## Notes for future integrations
The contact form currently uses frontend-only handling and opens the user’s mail client.
To connect later:
- **Formspree**: replace the submit handler with a POST to Formspree endpoint.
- **Resend / Email API**: add a serverless route (or external service) and call it from the submit handler.

