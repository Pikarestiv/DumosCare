# Pingura

A WhatsApp-first remote patient monitoring PoC for a single healthcare provider
(pharmacy, clinic, or maternity home) to track patients between visits.

## Project layout

```
backend/           Laravel 13 API (Sanctum auth, WhatsApp webhook, reminders)
admin-dashboard/    React/Vite admin dashboard (Sanctum cookie auth)
patient-report/     React/Vite public patient check-in page (token-based, no login)
```

## Prerequisites

- PHP 8.2+, Composer
- Node 18+, npm
- (Optional, for real WhatsApp testing) a Meta developer account and ngrok

## 1. Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # if it doesn't already exist
php artisan migrate --seed
php artisan storage:link
```

This seeds one demo provider, an admin user, and 4 demo patients with a mix of
program types and historical (including flagged) check-ins.

**Demo admin login:** `admin@pingura.test` / `password`

Run the API (the frontends are configured to expect it on port 8123):

```bash
php artisan serve --host=localhost --port=8123
```

> Use `--host=localhost` (not `127.0.0.1`) so that cookies set by the API are
> readable by the dashboard running on `localhost:5173` — cookies are scoped
> per-hostname, not per-port, but `127.0.0.1` and `localhost` are treated as
> different hosts by the browser.

In a second terminal, run the reminder dispatcher on a schedule (or trigger it
manually while testing):

```bash
php artisan schedule:work
# or, one-off:
php artisan app:dispatch-reminders
```

## 2. Admin dashboard

```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` and sign in with the demo admin credentials
above. From here you can see the patient list, drill into a patient's
check-in timeline and BP trend chart, manage monitoring programs and
reminders, enroll new patients, and triage flagged check-ins.

## 3. Patient report page

```bash
cd patient-report
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5174/report/{token}` — each seeded demo patient has a
fixed token for convenience:

| Patient | Token |
|---|---|
| Grace Adeyemi (blood pressure) | `demo-grace-adeyemi-token` |
| Emeka Nwosu (medication adherence) | `demo-emeka-nwosu-token` |
| Chiamaka Bello (wound care) | `demo-chiamaka-bello-token` |
| Tunde Balogun (general check-in + blood pressure) | `demo-tunde-balogun-token` |

The "Copy patient report link" button on a patient's detail page in the admin
dashboard builds this URL for you.

## 4. WhatsApp Cloud API setup (for real WhatsApp testing)

The webhook and outbound message sending are already wired up — you just need
a Meta test number and a public URL for local development.

### a. Create a Meta app + test number

1. Go to [developers.facebook.com](https://developers.facebook.com/) and create
   an app of type "Business".
2. Add the **WhatsApp** product to the app.
3. Under **WhatsApp > API Setup** you'll see a free test phone number and a
   temporary access token. Copy the **Phone number ID** and the **temporary
   access token**.
4. Under the same page, add your personal WhatsApp number as a **recipient
   test number** (Meta requires this allow-listing for unverified apps) and
   verify it via the SMS/WhatsApp code they send.

### b. Configure the backend

In `backend/.env`:

```
WHATSAPP_CLOUD_API_TOKEN=<the temporary access token>
WHATSAPP_PHONE_NUMBER_ID=<the phone number id>
WHATSAPP_VERIFY_TOKEN=<any string you choose, e.g. pingura-verify>
```

Also update at least one seeded patient's `phone` column to match your real
allow-listed WhatsApp test number (E.164 format, e.g. `+15551234567`), since
the webhook matches inbound messages to patients by phone number:

```bash
php artisan tinker --execute="App\Models\Patient::first()->update(['phone' => '+15551234567']);"
```

### c. Expose your local server with ngrok

```bash
ngrok http 8123
```

Copy the `https://...ngrok-free.app` URL it gives you.

### d. Point the Meta webhook at your app

1. In the Meta app dashboard, go to **WhatsApp > Configuration**.
2. Set the **Callback URL** to `https://<your-ngrok-domain>/api/webhooks/whatsapp`.
3. Set **Verify token** to the same value you put in `WHATSAPP_VERIFY_TOKEN`.
4. Click **Verify and save** — Laravel handles the `hub.challenge` handshake
   automatically (`WhatsAppWebhookController::verify`).
5. Subscribe to the **messages** webhook field.

### e. Try it

Send a WhatsApp message from your allow-listed test number to the Meta test
number:

- `120/80` or `BP 120/80` → creates a blood-pressure check-in (flagged if
  systolic > 140 or < 90, or diastolic > 90 or < 60)
- `yes` / `taken` / `done` → medication taken
- `no` / `missed` → medication missed (flagged)
- Any other text → stored as a general check-in
- A photo → stored as a wound-care check-in with the image attached

You should get an automatic "Got it, thanks!" reply, and the check-in will
appear on the patient's detail page in the admin dashboard.

## Notes on scope

- **SMS reminders are not implemented.** The `sms` value exists in the
  `Reminder.channel` enum as a placeholder for a future channel, but sending
  is deliberately left unbuilt until the product is monetized — see the
  comment in `backend/app/Console/Commands/DispatchReminders.php`.
- **Email reminders** use Laravel's `log` mail driver for this PoC (no real
  email provider configured) — sent messages are written to
  `backend/storage/logs/laravel.log` instead of actually delivered.
- The WhatsApp Cloud API test number can only message allow-listed recipient
  numbers, which is why the setup above asks you to add your own number as a
  test recipient.
