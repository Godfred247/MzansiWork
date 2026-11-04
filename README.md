# MzansiWork

South African workforce management prototype for employers, employees, and an optional Windows desktop agent. The three experiences share one demo organisation, Karoo Digital, so a change in one place shows up in the others.

## Run from Visual Studio Code

`npm run dev`, or F5 with **MzansiWork** selected, starts the API and the web app, then opens both in the browser:

- Web app: http://localhost:5173
- API Swagger: http://localhost:5080/swagger

Stop any copies already listening on those ports before starting again. In Swagger, call `POST /api/auth/login`, copy `token`, and paste it into **Authorize**.

## Run the product canvas

```bash
npm install
npm run dev
```

That opens the web app and Swagger. Reports download as CSV, Excel, or PDF. Invitations show the email that is queued for SendGrid.

## Run the API

```bash
dotnet run --project server/MzansiWork.Api --launch-profile http
```

The API listens on http://localhost:5080 and uses the Supabase Postgres database in project `yxfbuxxgxmvocumrhboa`, schema `mzansi`. The database password stays in user secrets:

```bash
dotnet user-secrets set "Supabase:DbPassword" "YOUR_DATABASE_PASSWORD" --project server/MzansiWork.Api
```

Copy that password from the Supabase dashboard: Connect, then Session pooler. If the host in `appsettings.json` does not match the dashboard, use the host shown there.

Demo sign-in: `lerato@karoodigital.co.za` / `Password123` (owner) and `thandi@karoodigital.co.za` / `Password123` (employee). A plan change is rejected unless `confirm` is true. Seat limits block invitations. Agent events with the same idempotency key are skipped.

## Employer mobile app

```bash
cd mobile
npm install
npx expo start
```

## Windows agent

```bash
dotnet run --project agent/MzansiWork.Agent
```

The agent signs in through the API, watches operating-system idle time, and keeps events on disk until they synchronise.

## What is included

- Employer mobile app: onboarding, dashboard, attendance, employees, invitations, seat limits, approvals, leave, projects, reports, exports, subscription, and settings.
- Employee browser: clock in and out, breaks, timesheets, activity explanations, leave, and profile.
- Windows agent: tracking status, idle observations, offline queue, and sync.

Prices, leave balances, and the idle threshold are labelled as configurable assumptions. Actions such as payment, email, and file export are simulated and say so on screen.

There is no permanent free plan. A plan change only happens after an explicit confirmation.
