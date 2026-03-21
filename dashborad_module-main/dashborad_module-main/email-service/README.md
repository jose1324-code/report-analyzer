# CareNova Email Service

Sends daily health summary emails to users who have email notifications enabled in Settings.

## Setup

### 1. Install dependencies
```bash
cd email-service
npm install
```

### 2. Get a Gmail App Password
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** → Select app: "Mail" → Select device: "Other" → type "CareNova"
4. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)

### 3. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. Click ⚙️ **Project Settings** → **Service Accounts** tab
3. Click **Generate new private key** → Download the JSON file
4. Save it as `email-service/serviceAccountKey.json`

### 4. Fill in `.env`
```
GMAIL_USER=your_actual_gmail@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
CRON_SCHEDULE=0 8 * * *
APP_URL=http://localhost:3000
```

### 5. Run

**Normal (waits for scheduled time):**
```bash
npm start
```

**Test immediately (sends emails right now):**
```bash
node index.js --now
```

**Dev mode with auto-restart:**
```bash
npm run dev
```

## How it works

1. Every day at 8:00 AM (configurable via `CRON_SCHEDULE`)
2. Reads all `userSettings` docs in Firestore where `notifications.email = true`
3. Fetches each user's profile (name, email) from `userProfiles`
4. Fetches their latest health metric from `healthMetrics`
5. Fetches their report count from `medicalReports`
6. Sends a styled HTML email with the summary

## Cron schedule examples
| Schedule | Meaning |
|----------|---------|
| `0 8 * * *` | Every day at 8:00 AM |
| `0 8,20 * * *` | Every day at 8 AM and 8 PM |
| `0 9 * * 1` | Every Monday at 9 AM |
| `*/5 * * * *` | Every 5 minutes (for testing) |

## Files
- `index.js` — main scheduler + email sender
- `template.js` — HTML email template
- `firebase.js` — Firebase Admin SDK init
- `.env` — your credentials (never commit this)
- `serviceAccountKey.json` — Firebase service account (never commit this)
