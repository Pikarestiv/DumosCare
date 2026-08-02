# Dumos Care

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

**Demo admin login:** `admin@dumoscare.test` / `password`

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
WHATSAPP_VERIFY_TOKEN=<any string you choose, e.g. dumos-care-verify>
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

## Production deployment (Namecheap shared hosting, Stellar Business)

Deployment is automated via `.github/workflows/deploy.yml`: on every push to
`main`, GitHub Actions builds the Laravel app (`composer install --no-dev`)
and both React apps (`npm run build`), then `rsync`s the finished artifacts
over SSH to the cPanel account. No Node.js or Composer is required on the
server itself — only PHP to run the already-built Laravel app.

### Target layout

| Subdomain | Serves | cPanel document root |
|---|---|---|
| `care.dumosrx.com` | Admin dashboard (static build) | `/home/USER/dumos-care-admin-dashboard` |
| `api.care.dumosrx.com` | Laravel API + WhatsApp webhook | `/home/USER/dumos-care-backend/public` |
| `report.care.dumosrx.com` | Patient report page (static build) | `/home/USER/dumos-care-patient-report` |

### One-time cPanel setup

1. **Create the 3 subdomains** (cPanel > Domains > Create A New Domain, or
   Subdomains). For `api.care.dumosrx.com`, set the document root directly
   to `dumos-care-backend/public` (a path outside `public_html`, or anywhere you
   like — cPanel lets you type a custom path at creation time). This keeps
   Laravel's app code and `.env` out of any web-accessible folder.
2. **Enable AutoSSL** for all 3 (usually automatic within a few minutes of
   creating the subdomain — check cPanel > SSL/TLS Status).
3. **Create a MySQL database** via cPanel > MySQL Database Wizard: a database,
   a user, and grant that user ALL PRIVILEGES on it. Note the full (prefixed)
   database name and username.
4. **Set the PHP version** for `api.care.dumosrx.com` to 8.2+ (ideally the
   same major/minor as `backend/composer.json` requires) via cPanel >
   MultiPHP Manager, and confirm the `gd` extension is enabled under MultiPHP
   INI Editor (needed for the wound-photo upload validation).
5. **Add your GitHub Actions deploy key**: generate an SSH key pair locally
   (`ssh-keygen -t ed25519 -C "github-actions-dumos-care"`, no passphrase), add
   the *public* key via cPanel > SSH Access > Manage SSH Keys > Import Key,
   then Authorize it. Keep the *private* key for the GitHub secret below.
6. **Create `/home/USER/dumos-care-backend/.env` by hand over SSH**, based on
   `backend/.env.production.example` in this repo — fill in the DB
   credentials from step 3, generate `APP_KEY` with
   `php artisan key:generate --show` (run locally, paste the output in), and
   set `SESSION_DOMAIN` to `.care.dumosrx.com`. This file is deliberately
   excluded from the deploy sync, so it's only ever touched by you over SSH.
7. **Add a cron job** (cPanel > Cron Jobs) so reminders actually get sent:
   ```
   * * * * * /usr/local/bin/php /home/USER/dumos-care-backend/artisan schedule:run >> /dev/null 2>&1
   ```
   (confirm the PHP binary path for your account — cPanel's Cron Jobs page
   usually suggests it, e.g. `/usr/local/bin/ea-php83`).
8. **First deploy**: push to `main` (or run the workflow manually from the
   Actions tab), then confirm `php artisan migrate --force` ran cleanly by
   checking the Actions log. The demo seeder is intentionally **not** run in
   production — seed manually over SSH only if you actually want the demo
   data live: `php artisan db:seed`.

### GitHub repo configuration

**Settings > Secrets and variables > Actions > Secrets:**

| Secret | Value |
|---|---|
| `DEPLOY_SSH_HOST` | your server hostname, e.g. `server123.web-hosting.com` |
| `DEPLOY_SSH_PORT` | SSH port from cPanel > SSH Access (often `21098` on Namecheap, not 22) |
| `DEPLOY_SSH_USER` | your cPanel username |
| `DEPLOY_SSH_KEY` | the *private* key from step 5 above (full contents, including header/footer lines) |
| `DEPLOY_BACKEND_PATH` | `/home/USER/dumos-care-backend` |
| `DEPLOY_ADMIN_PATH` | `/home/USER/dumos-care-admin-dashboard` |
| `DEPLOY_REPORT_PATH` | `/home/USER/dumos-care-patient-report` |
| `DEPLOY_PHP_BIN` | Full path to a PHP 8.3+ CLI binary on the server, e.g. `/opt/alt/php83/usr/bin/php`. The bare `php` in an SSH shell is often a much older system default (cPanel's MultiPHP Manager only affects web requests, not SSH) — check `ls /opt/alt/` or `ls /opt/cpanel/` over SSH to find the right one for your account. |

**Settings > Secrets and variables > Actions > Variables** (these get baked
into the React builds at compile time, so they're not secret, just public
URLs):

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.care.dumosrx.com` |
| `VITE_PATIENT_REPORT_URL` | `https://report.care.dumosrx.com` |

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
