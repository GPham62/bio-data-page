# Claude Instructions

## i18n — always update both locales

Any time a string visible to the user is added or changed, update **both** locale files together:

- `src/locales/en.json` — English
- `src/locales/vi.json` — Vietnamese

Never leave one locale ahead of the other. If a new key is added in English, the Vietnamese translation must be written in the same response, not deferred.

## Power BI MCP — auto-connect

Whenever the user mentions Power BI, p1.pbix, DAX, or measures, immediately call `mcp__powerbi__connect_powerbi` without being asked. The MCP server is already registered globally (`python -m powerbi_mcp.server`). Power BI Desktop must be open with a `.pbix` file for the connection to succeed.

Data model for Project 1 (`powerbi/p1/p1.pbix`):
- Source tables: `job_postings_fact`, `company_dim`, `skills_job_dim`, `skills_dim`
- Files live in: `powerbi/p1/project1_data/`
- Relationships are auto-detected (job→company, skills_job→job, skills_job→skills)
- Measures in `job_postings_fact`: Total Postings, Countries Covered, Salary Records, Median Salary, Remote %, Top Role
- Measures in `skills_dim`: Top Skill
- Measures in `skills_job_dim`: Skill Count
- ML metrics (accuracy, ROC-AUC, F1, etc.) come from Colab notebook — not yet in the model

## Project context

- React 18 + Vite SPA, state-based routing (`useState` in App.jsx — no React Router)
- CSS Modules per page/component + global vars in `src/index.css`
- Recharts for all data charts
- Deployed at https://bio-ta.vercel.app/ (Vercel, auto-deploys from GitHub main)
- GitHub: https://github.com/GPham62/bio-data-page.git
