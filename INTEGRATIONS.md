# Rachel's Life Dashboard — Integrations Guide

This document walks you through setting up Google Calendar, Twilio SMS, and weather integrations.

## 1. Google Calendar Integration

The daily schedule in Week View will automatically pull your calendar events.

### Setup Steps

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "New Project", name it (e.g., "Rachel's Dashboard")
   - Wait for creation to finish

2. **Enable the Calendar API**
   - In the Cloud Console, search for "Calendar API"
   - Click on it and press "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Under "Authorized redirect URIs", add:
     - For local testing: `http://localhost:3000/api/auth/google/callback`
     - For production: `https://your-vercel-domain.vercel.app/api/auth/google/callback`
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

4. **Add to Vercel Environment Variables**
   - In Vercel → Project Settings → Environment Variables, add:
     - `GOOGLE_CLIENT_ID` = (your Client ID)
     - `GOOGLE_CLIENT_SECRET` = (your Client Secret)
     - `GOOGLE_REDIRECT_URI` = `https://your-vercel-domain.vercel.app/api/auth/google/callback`

5. **Connect in the Dashboard**
   - Once deployed, click the calendar icon (📅) in the top-right corner of the dashboard
   - Authorize Rachel's Dashboard to access your Google Calendar
   - You'll be redirected back — calendar events now appear in Week View's daily schedule

## 2. Twilio SMS Integration

Get a morning briefing text every day at 8 AM EST with tasks, focus, calendar events, and weather.

### Setup Steps

1. **Create a Twilio Account**
   - Go to [twilio.com](https://www.twilio.com) and sign up
   - During setup, you'll be assigned a phone number (e.g., `+1XXXXXXXXXX`)

2. **Get Credentials**
   - From your Twilio Console, copy:
     - **Account SID**
     - **Auth Token**
     - **Phone Number** (the one assigned to your account, or a new one you purchase)

3. **Configure Webhook for SMS Replies**
   - In Twilio Console → Phone Numbers → (select your number)
   - Under "Messaging" → "A Message Comes In", set Webhook URL to:
     ```
     https://your-vercel-domain.vercel.app/api/sms/incoming
     ```

4. **Add to Vercel Environment Variables**
   - `TWILIO_ACCOUNT_SID` = (your Account SID)
   - `TWILIO_AUTH_TOKEN` = (your Auth Token)
   - `TWILIO_PHONE_NUMBER` = (your Twilio number, e.g., `+14155552671`)
   - `TWILIO_TO_PHONE_NUMBER` = `7039455621` (or your phone number)
   - `BRIEFING_SECRET` = (generate with `openssl rand -hex 32`)

5. **Schedule the Morning Briefing**
   - You need an external cron service to trigger `/api/briefing/send` at 8 AM EST daily
   - Option 1: Use [EasyCron](https://www.easycron.com) (free, 50+ per month)
     - Create a cron job that POSTs to:
       ```
       https://your-vercel-domain.vercel.app/api/briefing/send
       ```
     - Set Header: `Authorization: Bearer {BRIEFING_SECRET}`
     - Schedule: `0 8 * * *` (every day at 8 AM)
     - Note: EasyCron uses UTC, so use `0 13 * * *` for 8 AM EST (UTC-5)
   
   - Option 2: Use GitHub Actions (free, part of your repo)
     - Create `.github/workflows/briefing.yml`:
       ```yaml
       name: Morning Briefing
       on:
         schedule:
           - cron: '0 13 * * *'  # 8 AM EST (UTC-5)
       jobs:
         send:
           runs-on: ubuntu-latest
           steps:
             - name: Send briefing
               run: |
                 curl -X POST https://your-vercel-domain.vercel.app/api/briefing/send \
                   -H "Authorization: Bearer ${{ secrets.BRIEFING_SECRET }}"
       ```
     - Add `BRIEFING_SECRET` as a GitHub secret

6. **Reply to Texts to Check Off Tasks**
   - Text a number (e.g., `1`) to mark task 1 complete
   - Text multiple numbers separated by commas or spaces (e.g., `1,3` or `1 3`)
   - Replies are automatically processed and tasks marked as done

## 3. Weather Integration

The morning briefing includes weather for McLean, VA.

### Setup Steps

1. **Get OpenWeatherMap API Key**
   - Go to [openweathermap.org](https://openweathermap.org)
   - Sign up (free tier is fine)
   - Go to "API keys" and copy your default API key

2. **Add to Vercel Environment Variables**
   - `OPENWEATHER_API_KEY` = (your API key)

That's it — weather will automatically appear in the morning briefing SMS.

---

## Testing Locally

Before deploying, test all integrations locally:

```bash
# 1. Copy .env.example to .env and fill in all values
cp .env.example .env

# 2. Set local Google redirect:
# GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# 3. For Twilio, you can test the briefing endpoint with curl:
curl -X POST http://localhost:3000/api/briefing/send \
  -H "Authorization: Bearer your-briefing-secret"

# 4. Run dev server
npm run dev
```

## Troubleshooting

**Google Calendar events not showing?**
- Make sure you clicked the 📅 icon and completed OAuth
- Check Vercel logs for errors in `fetchCalendarEvents`

**SMS not arriving?**
- Verify `TWILIO_TO_PHONE_NUMBER` is correct (include country code)
- Check that Twilio phone number has credits/is active
- For local testing, use EasyCron or a manual curl to test the endpoint

**SMS replies not working?**
- Verify webhook URL in Twilio Console matches your domain
- Check that `BRIEFING_SECRET` matches between cron job and `.env`
- Review Vercel logs for `/api/sms/incoming` errors

**Weather not showing?**
- Verify `OPENWEATHER_API_KEY` is valid and not rate-limited
- Check for "weather unavailable" in the SMS (often due to API failures, not setup)

---

## Cost Breakdown (Monthly)

- **Google Calendar**: Free
- **Twilio**: ~$1 (for 1 inbound number + SMS usage, usually a few cents for daily texts)
- **OpenWeatherMap**: Free (tier)
- **EasyCron** (if used): Free (for 50+ calls/month)
- **Vercel**: Already hosting, no extra cost

Total: ~$1/month
