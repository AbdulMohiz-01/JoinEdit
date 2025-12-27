# Webhook Testing Setup Guide

## Step 1: Get ngrok Running

1. **Sign up for ngrok** (free): https://dashboard.ngrok.com/signup
2. **Get your authtoken** from: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configure ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```
4. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

You should see:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the `https://abc123.ngrok.io` URL!**

---

## Step 2: Configure Paddle Webhook

1. Go to **[Paddle Sandbox Dashboard](https://sandbox-vendors.paddle.com/)**
2. Navigate to: **Developer Tools** → **Notifications**
3. Click **"Create notification destination"**
4. Fill in:
   - **Description**: "JoinEdit Local Webhook"
   - **Destination URL**: `https://YOUR_NGROK_URL.ngrok.io/api/billing/paddle/webhook`
     - Example: `https://abc123.ngrok.io/api/billing/paddle/webhook`
   - **Active**: ✅ Yes
5. **Subscribe to events**:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `transaction.completed`
   - ✅ `transaction.paid`
6. Click **Save**
7. **Copy the Secret Key** (format: `pdl_ntfset_xxxxxxxxxxxxx`)

---

## Step 3: Add Webhook Secret to .env

Add this line to your `.env` file:

```bash
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxxxxxx
```

Replace `pdl_ntfset_xxxxxxxxxxxxx` with the actual secret key from Paddle.

---

## Step 4: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 5: Test the Full Flow

1. **Open your app**: http://localhost:3000/billing
2. **Click "Upgrade to Pro"**
3. **Complete payment** with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/30`
   - CVC: `123`
4. **Watch your terminal** - you should see webhook logs:
   ```
   Received Paddle webhook: subscription.created
   Creating subscription for user xxx
   User xxx upgraded to Pro
   ```
5. **Check Supabase** - `users.is_pro` should be `true`
6. **Refresh dashboard** - should show Pro features

---

## Troubleshooting

### Webhook Not Received

**Check ngrok is running:**
```bash
# Visit ngrok web interface
open http://127.0.0.1:4040
```

You should see incoming webhook requests here.

**Check webhook URL:**
- Make sure it ends with `/api/billing/paddle/webhook`
- Make sure it's the ngrok HTTPS URL (not localhost)

**Check Paddle webhook logs:**
- Go to Paddle Dashboard → Notifications
- Click on your webhook destination
- Check "Recent deliveries" for errors

### Signature Verification Failed

**Make sure:**
- `PADDLE_WEBHOOK_SECRET` is correct in `.env`
- Dev server was restarted after adding the secret
- Secret matches the one shown in Paddle dashboard

### User Not Upgraded

**Check terminal logs:**
- Look for errors in webhook handler
- Verify `userId` is being passed correctly

**Check Supabase:**
```sql
SELECT * FROM users WHERE id = 'your-user-id';
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';
```

---

## ngrok Tips

### Keep ngrok Running
ngrok must stay running while testing. Don't close the terminal!

### URL Changes
Every time you restart ngrok, you get a **new URL**. You'll need to:
1. Update Paddle webhook destination with new URL
2. Update Default Payment Link if needed

### Free Plan Limits
- ngrok free plan gives you a random URL each time
- URL expires after 2 hours of inactivity
- For permanent URL, upgrade to ngrok paid plan ($8/month)

---

## Production Deployment

When deploying to production (Vercel/etc):

1. **Update Paddle webhook URL** to your production domain:
   - `https://yourdomain.com/api/billing/paddle/webhook`
2. **Use production Paddle credentials**
3. **No ngrok needed** - Paddle can reach your production server directly

---

## Quick Reference

### Test Card
```
Card: 4242 4242 4242 4242
Expiry: 12/30
CVC: 123
```

### Webhook Events
- `subscription.created` - New subscription → Set is_pro = true
- `subscription.canceled` - Canceled → Set is_pro = false
- `transaction.completed` - Payment successful
- `subscription.updated` - Status changed

### Important URLs
- ngrok Dashboard: https://dashboard.ngrok.com
- ngrok Web Interface: http://127.0.0.1:4040
- Paddle Sandbox: https://sandbox-vendors.paddle.com
- Your App: http://localhost:3000
