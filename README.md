# ProofWall

Collect written and video testimonials from customers, approve them in a dashboard, and show them on your own website with a one-line embed.

Live: https://proofwall.click

## How it works
1. Owner creates a wall in the dashboard and shares the collection link (`/w/<slug>`).
2. Customers submit a star rating, text and an optional video (up to 50 MB / 60 s). No account needed.
3. Owner approves, hides or deletes each review. Only approved reviews are public.
4. Owner pastes the embed line into their site:

```html
<script src="https://proofwall.click/widget.js" data-wall="<slug>" async></script>
```

## Stack
Next.js 15 (App Router) + React 19 + TypeScript, Supabase (Postgres, Auth, Storage, row-level security), hosted on Vercel. The widget (`public/widget.js`) renders in a Shadow DOM so it never clashes with the host site's styles.

## Run locally
```bash
npm install
npm run dev
```
Optional environment variables (public defaults are built in):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Security notes
- Row-level security on every table; owners only see their own data.
- Public access goes through SECURITY DEFINER functions (`get_public_wall`, `get_wall_testimonials`, `submit_testimonial`).
- Videos are stored in a private bucket and are only playable once the review is approved.
- Only the publishable (public) Supabase key is used in this code. No secret keys are stored here.
