# Frontend (Vite + React)

Minimal frontend for the SE project.

Setup

```bash
npm install
# create a .env file (optional) or rely on relative API paths
# copy from .env.example
cp .env.example .env
npm run dev
```

Notes

- Configure `VITE_API_BASE_URL` in `.env` if your backend runs on a different origin.
- The app prefixes non-absolute requests with `/api/v1` by default.
- JWT is stored in `localStorage` currently; consider httpOnly cookies for production.
