# Phase 26 — Vercel deployment investigation

## Verified external evidence

- The reported production address, `https://dero-mebel-market.vercel.app`, responds with raw bundled application source code rather than the DERO MEBEL MARKET interface.
- The connected Vercel project is `dero-mebel-market` (`prj_ZfVpHVs2ZTpMzyVemiSWBBUdBc4c`) in team `gauharbaltabaeva40-3792's projects` (`team_dhHPNlo0qBs5LD52wRqpkxfX`). Vercel labels it as a Vite project using Node.js `24.x`.
- The current production deployment is `dpl_8umB1xa7nvt11gsJKVg3jh3eajcV`, marked `READY` and associated with GitHub repository `gauharbaltabaeva40-netizen/dero-mebel-market` on `main`.
- Its build log shows a Vite output path of `../dist/public/assets`, but the serving behavior does not deliver the expected client application. The project requires a configuration review because it includes an Express/tRPC backend and database-dependent catalog, not just a standalone static Vite frontend.

## Working live site

The managed production storefront remains available at `https://deromebel-mvjbwqqp.manus.space`; the Vercel investigation must not alter that service.
