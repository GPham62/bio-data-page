# Running Locally — DEV

Quick reference for developing this portfolio (React 18 + Vite) on this machine.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload (development). |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to verify the production build. |

## Start the dev server

```powershell
npm install      # first time, or after a pull that changed package-lock.json
npm run dev
```

- Serves at **http://localhost:5173/**
- Hot-reloads on save — edits to `.jsx` / `.module.css` appear instantly.
- Stop with `Ctrl+C`.
- Expose on your LAN (other devices): `npm run dev -- --host`

> Tip: after a `git pull` that touches `package-lock.json`, run `npm install`
> so dependencies match. Vite will also "re-optimize dependencies" on the next
> `dev` start — that's expected.

## Running it as a background task (via Claude)

Claude can launch `npm run dev` detached so it keeps serving across turns and
logs output to a temp file. Just ask: *"run the dev server in the background."*

- It survives across the session and notifies on exit.
- It stops when the session or machine stops (it is **not** a system service).
- Ask Claude to stop it, or `Ctrl+C` if you started it yourself.

## Verify a production build before pushing

```powershell
npm run build
npm run preview   # check http://localhost:4173/
```

## Deploy

Pushing to `main` on GitHub auto-deploys to Vercel:
<https://bio-ta.vercel.app/>. No manual deploy step needed.

## Reminders

- **i18n:** any user-visible string must be added to **both** `src/locales/en.json`
  and `src/locales/vi.json` in the same change (see `CLAUDE.md`).
- Routing is state-based (`useState` in `App.jsx`) — there is no React Router.
- Pull / SourceTree setup: see [`SOURCETREE_SETUP.md`](SOURCETREE_SETUP.md).
