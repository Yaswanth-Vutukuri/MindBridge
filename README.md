# MindBridge

A local full-stack MVP for the MindBridge design brief. The React interface is served by Vite in development, with an Express API and a small JSON data store.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:4000. Create a pseudonymous profile or continue as a guest. To run the built app, use `npm run build` followed by `npm start`; the server serves `dist` when it exists.

## Included flows

- Pseudonymous registration and login with bcrypt password hashes and HTTP-only session cookies.
- Guest sessions, mood check-ins, guided breathing and grounding activities, and data deletion.
- A scripted support conversation with immediate-risk guidance. It does not connect to an AI model and does not provide diagnosis or treatment.
- Sample psychologist profiles and appointment requests that require explicit consent. Sample providers are not verified.
- Local data is written to `server/data/store.json`, which is excluded from version control.

## Before any real deployment

This is a development/demo foundation, not a production mental-health service. The JSON file store and Express in-memory session store are not suitable for multiple instances or sensitive production data. Before deployment, use a managed database and durable session store, set a unique `SESSION_SECRET` and `NODE_ENV=production`, enable HTTPS, add operational monitoring and rate limits, and complete security and privacy reviews. Replace sample professionals only after a documented credential-verification process. Any AI integration and crisis workflow requires qualified clinical review and jurisdiction-specific emergency resources.