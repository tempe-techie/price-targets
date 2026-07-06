# Crypto Price Targets

Track crypto token buy and sell price targets across curated lists. Built with Nuxt for use as a Farcaster miniapp.

## Features

- **Buy targets** – Curated lists of tokens with buy price targets
- **Sell targets** – Curated lists of tokens with sell price targets
- Dark/light color mode (Tailwind)
- Farcaster miniapp integration
- Wallet integration (wagmi/viem)

## Tech stack

- [Nuxt 4](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/) via `@nuxtjs/tailwindcss`
- [@nuxtjs/color-mode](https://github.com/nuxt-modules/color-mode)
- [@farcaster/miniapp-sdk](https://github.com/farcasterxyz/miniapp-sdk)
- [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/)

## Setup

```bash
# Install dependencies
npm install

# Development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run generate` | Static site generation |
| `npm run preview`  | Preview production build |

## Configuration

Buy and sell list slugs are configured in `nuxt.config.ts` under `runtimeConfig.public.lists`:

- **buy** – array of list slugs for buy targets
- **sell** – array of list slugs for sell targets

Each list is loaded by slug; ensure the corresponding list data exists for the routes you enable.

## Environment

Optional: add a `.env` file for any environment variables. See Nuxt [runtime config](https://nuxt.com/docs/guide/going-further/runtime-config) for overriding `runtimeConfig` via `NUXT_*` env vars.

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_SITE_URL` | Public site URL for Open Graph/Twitter meta tags (defaults to `https://price-targets-22.vercel.app`) |

## Deploy to Vercel

This app uses the [Nitro Vercel preset](https://nitro.build/deploy/providers/vercel) so Nuxt pages and the `/api/stock-price` server route deploy as Vercel serverless functions.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. Vercel detects Nuxt automatically. The build command is `npm run build`.
4. Set `NUXT_PUBLIC_SITE_URL` to your production URL (for example `https://your-app.vercel.app`).
5. Deploy.

Netlify deployments continue to work via `netlify.toml`, which sets `NITRO_PRESET=netlify`.
