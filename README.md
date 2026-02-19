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
