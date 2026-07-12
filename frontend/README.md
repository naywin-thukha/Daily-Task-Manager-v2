# Daily Ledger — Frontend

A plain HTML/CSS/JS frontend for your Daily Task Manager API. No build step, no framework — just static files.

## Pages

- `login.html` — log in
- `signup.html` — create an account
- `index.html` — the task ledger (redirects to `login.html` if you're not signed in)

## 1. Add your Firebase config

Open `firebase-config.js` and replace the placeholder values with your real Firebase project config
(Firebase Console → Project settings → General → Your apps → SDK setup and configuration).

Also confirm `API_BASE_URL` points at your running backend (defaults to `http://127.0.0.1:8000`).

## 2. Enable Email/Password sign-in in Firebase

In the Firebase Console: Authentication → Sign-in method → enable **Email/Password**. Without this, sign-up and login will fail.

## 3. Serve the files

Because this uses ES module imports (`type="module"`), you can't just double-click the HTML files — open them through a local server:

```bash
cd frontend
python -m http.server 5173
```

Then visit `http://localhost:5173/login.html`.

## 4. Check your backend's CORS setting

Your `main.py` currently only allows `http://localhost:5173`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    ...
)
```

That matches the port suggested above. If you serve the frontend from a different port or tool (e.g. VS Code Live Server on `5500`), add that origin to `allow_origins` too, e.g.:

```python
allow_origins=["http://localhost:5173", "http://127.0.0.1:5500"],
```

## What's included

- `login.html` / `login.js` — log-in page, redirects to `index.html` on success
- `signup.html` / `signup.js` — sign-up page, redirects to `index.html` on success
- `index.html` / `app.js` — the task ledger; checks auth on load and bounces to `login.html` if you're signed out
- `firebase-init.js` — shared Firebase app/auth setup used by all three pages
- `firebase-config.js` — your Firebase keys + API base URL (edit this one file to configure everything)
- `style.css` — shared styling (ledger/notebook visual theme)

## Features

- Email/password sign up & log in via Firebase, on separate pages, session persists across reloads
- Add, edit, complete, and delete tasks
- Filter by All / Open / Done
- Search by title (uses your backend's `search` query param)
- Every request is scoped to the signed-in user automatically via the Firebase ID token
