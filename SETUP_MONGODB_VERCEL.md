# Fix "cannot create account" — MongoDB Atlas + Vercel, step by step

Sign-up needs three things to be correct. If any one is wrong, registration fails.

## 1. Create the free MongoDB Atlas database
1. Sign in at https://cloud.mongodb.com → **Create** a project → **Build a Database** → **M0 Free**.
   Pick a region close to your Vercel region (Mumbai `ap-south-1` is a good choice).
2. **Database Access** → **Add New Database User** → *Password* auth.
   Username e.g. `dopuser`. Use a password with **letters and digits only** (avoids URL-encoding problems).
   Role: *Read and write to any database*.
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) → Confirm.
   Vercel has no fixed IP, so this is required. (Most common cause of failure!)
4. **Database** → **Connect** → **Drivers** → copy the string:
   `mongodb+srv://dopuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Edit it: replace `<password>` with the real password **and delete the `<` `>` brackets**, and add the
   database name before the `?`:
   `mongodb+srv://dopuser:MyPass123@cluster0.xxxxx.mongodb.net/dogs-own-place?retryWrites=true&w=majority`

## 2. Add environment variables on Vercel
Project → **Settings → Environment Variables** (tick Production, Preview, Development):

| Name | Value |
|---|---|
| `MONGODB_URI` | the string from step 1.5 |
| `JWT_SECRET` | run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the result (must be 32+ chars) |
| `ADMIN_EMAIL` | your admin login email |
| `ADMIN_PASSWORD` | a long unique password |
| `NEXT_PUBLIC_APP_URL` | `https://dogs-own-place-1.vercel.app` (or your custom domain) |
| `OWNER_EMAIL` *(optional)* | where you want booking alerts |
| `RESEND_API_KEY` *(optional)* | from resend.com — enables email alerts/confirmations |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` *(optional)* | instant phone alerts (see below) |

**Then redeploy** (Deployments → ⋯ → Redeploy). Env-var changes do NOT apply to the old deployment.

## 3. Verify
Open `https://YOUR-SITE/api/health`. You want:
```
{"ready":true,"database":"connected", ...}
```
Meaning of the other answers:
- `not configured` → `MONGODB_URI` missing (or not redeployed)
- `failed: MONGODB_URI still has <password> placeholder` → remove the `<>` brackets
- `failed: wrong username/password` → fix the password (letters/digits only is easiest)
- `failed: Atlas Network Access is blocking Vercel` → step 1.3
- `JWT_SECRET_long_enough: false` → make `JWT_SECRET` 32+ characters

If sign-up still fails, open Vercel → your project → **Logs**, search `Register error:` — the exact reason is printed there.

## 4. Get booking alerts on your phone (Telegram, free, 2 minutes)
1. In Telegram, message **@BotFather** → `/newbot` → copy the **token** → `TELEGRAM_BOT_TOKEN`.
2. Send any message to your new bot.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` → find `"chat":{"id":123456789` → `TELEGRAM_CHAT_ID`.
4. Redeploy. Every new booking, sign-up and cancellation now pings you instantly.

Email alerts: create a free account at resend.com, make an API key (`RESEND_API_KEY`), set `OWNER_EMAIL`.
To email *customers* (not only yourself) verify your own domain in Resend and set `CONTACT_FROM_EMAIL`
(e.g. `Dog's Own Place <bookings@yourdomain.com>`).

Bookings are always saved in MongoDB and appear in **Admin → Bookings** with a red "new" badge,
even if email/Telegram is not configured.
