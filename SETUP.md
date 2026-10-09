# CryptoHealth — local development

This guide reflects the current repository layout. The project has one React/Vite web portal in `frontend/`, a Node/Express API in `backend/`, and a Flutter patient-app shell in `mobile_app/`. The README describes additional product interfaces and integrations that are not yet separate apps in this checkout.

## Prerequisites

- Node.js 22 or newer and npm
- Flutter SDK matching the Dart constraint in `mobile_app/pubspec.yaml`
- A Supabase project for live authentication, PostgreSQL and Storage
- Android Studio / an Android emulator or a connected device for mobile development

## 1. Configure Supabase

1. Create a Supabase project.
2. Apply the SQL migrations from `backend/supabase/migrations/` in order, checking any project-specific migration state first.
3. Create a **private** Storage bucket named `medical-reports` (or configure another bucket).
4. Review row-level security policies and the roles/profile creation flow before adding real users.
5. Copy `backend/.env.example` to `backend/.env` and provide your project values. In Supabase Auth settings, add the configured `PASSWORD_RESET_REDIRECT_URL` (default: the first CORS origin plus `/reset-password`) to the allowed redirect URLs.

The backend accepts either the current names `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` or the compatible names `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`. Keep every secret in the backend environment only.

Generate a persistent 32-byte hexadecimal master key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set the output as `MASTER_ENCRYPTION_KEY`. Back it up in a secrets manager. If you lose it, encrypted report content may be unrecoverable. Never commit `.env` or use production patient records during development.

## 2. Start the backend

```bash
cd backend
npm ci
npm test
npm run dev
```

Health check: `http://localhost:5000/api/health`

The backend can start locally with placeholder Supabase clients so `/api/health` remains usable before setup. Live authentication and data operations require real Supabase URL/keys, migrations, Storage bucket, and correct redirect allow-list configuration.

## 3. Start the web portal

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Vite normally serves the app at `http://localhost:5173`. The web client reads `VITE_API_URL` from `frontend/.env`; the default API origin is `http://localhost:5000`. Copy `frontend/.env.example` to `frontend/.env` only when you need to override that default.

The web portal supports authentication, dashboard, patient linking, report management, temporary access, verification, audit logs, and profile flows as wired in the current source. Features that use Supabase, a hospital membership, issuer keys, or seeded database records require those services/data to be set up.

## 4. Run the Flutter patient app

```bash
cd mobile_app
flutter pub get
flutter analyze
flutter test
flutter run
```

The current mobile UI is a navigation-ready patient locker prototype with sample records. It is not yet connected to the backend, and its sample data must not be treated as actual patient records. Live login, remote report loading/upload, real QR access-token creation, and secure mobile token storage remain integration work.

## Tests and security status

`npm test` runs dependency-free tests of the Node crypto primitives (AES-256-GCM envelope round-trip/tamper rejection, Ed25519 signature validation, and random linking/share token formats). It does not replace end-to-end security testing against a configured Supabase project.

Before handling real healthcare data, perform a formal threat model and independent security review, validate row-level security and object-level authorization, use managed secrets/key rotation and backups, confirm issuer-key lifecycle and recovery, add upload malware/content checks and observability, configure HTTPS, and obtain appropriate legal/compliance advice. Cryptographic issuer validation establishes signature/integrity properties; it does not establish that a medical interpretation is clinically correct.
