# Claude Instructions

## i18n — always update both locales

Any time a string visible to the user is added or changed, update **both** locale files together:

- `src/locales/en.json` — English
- `src/locales/vi.json` — Vietnamese

Never leave one locale ahead of the other. If a new key is added in English, the Vietnamese translation must be written in the same response, not deferred.

## Project context

- React 18 + Vite SPA, state-based routing (`useState` in App.jsx — no React Router)
- CSS Modules per page/component + global vars in `src/index.css`
- Recharts for all data charts
- Deployed at https://bio-ta.vercel.app/ (Vercel, auto-deploys from GitHub main)
- GitHub: https://github.com/GPham62/bio-data-page.git
