# Inngest Setup Guide

This project is now configured with Inngest for background job processing and event-driven workflows.

## ✅ What's Been Configured

### 1. Environment Variables

Added to `.env`:

```env
### Inngest Configuration ###
# For Vite (browser) - use the proxy URL
VITE_INNGEST_EVENT_KEY=your_inngest_event_key_here
VITE_INNGEST_DEV_SERVER_URL=http://localhost:5173

# For server-side (if needed)
INNGEST_EVENT_KEY=your_inngest_event_key_here
INNGEST_SIGNING_KEY=your_inngest_signing_key_here
INNGEST_DEV_SERVER_URL=http://127.0.0.1:8288
```

### 2. Inngest Functions

Available functions in `src/lib/inngest/`:

- **functions.ts**: Core business logic functions

  - `sendWelcomeEmail` - Sends welcome emails to new users
  - `processNewEvent` - Handles new event creation
  - `processAuditLog` - Processes audit log entries
  - `batchEmailProcessor` - Batch email processing

- **integrations.ts**: Service integrations
  - `enhancedAuditLogger` - Enhanced audit logging with your existing auditService
  - `userRegistrationWorkflow` - User registration workflows
  - `eventCreationWorkflow` - Event creation notifications
  - `batchEmailProcessor` - Rate-limited email processing
  - `maintenanceWorkflow` - System maintenance tasks

### 3. API Route

Created `src/api/inngest.ts` - Inngest API endpoint for Vite

### 4. Vite Configuration

Updated `vite.config.ts` with proxy for `/api/inngest` → `http://127.0.0.1:8288`

### 5. Development Scripts

- `npm run inngest:dev` - Start both Vite and Inngest dev server
- `npm run inngest:server` - Start only Inngest dev server
- `npm run dev:full` - Run both with concurrently (requires `npm install -g concurrently`)

## 🚀 Quick Start

### Option 1: Manual Setup (Recommended for learning)

1. **Start Inngest Dev Server**:

   ```bash
   npx inngest dev -u http://localhost:5173
   ```

   This starts the Inngest dev server on `http://127.0.0.1:8288`

2. **Start Vite** (in another terminal):

   ```bash
   npm run dev
   ```

3. **Access Inngest Dashboard**:
   - Open: `http://127.0.0.1:8288`
   - Your API endpoint: `http://localhost:5173/api/inngest` (proxied to dev server)

### Option 2: Automated Setup

1. **Install concurrently** (if not already installed):

   ```bash
   npm install -g concurrently
   ```

2. **Run both servers**:
   ```bash
   npm run dev:full
   ```

### Option 3: Using the helper script

```bash
npm run inngest:dev
```

## 🔧 Testing Inngest

### 1. Trigger Events via Inngest Dashboard

1. Open `http://127.0.0.1:8288`
2. Go to "Events" tab
3. Click "Send Event"
4. Use these example payloads:

**User Registration Event:**

```json
{
  "name": "user/registered",
  "data": {
    "userId": "12345",
    "email": "test@example.com",
    "timestamp": 1704067200000
  }
}
```

**Event Creation Event:**

```json
{
  "name": "event/created",
  "data": {
    "eventId": "67890",
    "title": "Summer Festival",
    "createdBy": "user123"
  }
}
```

**Audit Log Event:**

```json
{
  "name": "audit/log",
  "data": {
    "action": "USER_LOGIN",
    "userId": "12345",
    "details": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

### 2. Trigger Events from Your App

```typescript
import { inngest } from "../lib/inngest/client";

// Send user registration event
await inngest.send("user/registered", {
  userId: user.id,
  email: user.email,
  timestamp: Date.now(),
});

// Send event creation event
await inngest.send("event/created", {
  eventId: event.id,
  title: event.title,
  createdBy: currentUserId,
});
```

## 📊 Monitoring & Debugging

### Inngest Dashboard Features:

- **Functions**: View all registered functions and their status
- **Events**: Monitor incoming events and trigger them manually
- **Runs**: See execution history, logs, and errors
- **Discover**: Auto-discover functions from your codebase

### Local Development:

- Check Vite console for function execution logs
- Inngest dev server shows real-time function runs
- Use `console.log()` in your functions for debugging

## 🔐 Production Deployment

For production, you'll need to:

1. **Get real Inngest credentials**:

   - Sign up at https://www.inngest.com
   - Get your Event Key and Signing Key
   - Update `.env` with production values

2. **Update environment variables**:

   ```env
   INNGEST_EVENT_KEY=prod_event_key_here
   INNGEST_SIGNING_KEY=prod_signing_key_here
   INNGEST_DEV_SERVER_URL=  # Remove this in production
   ```

3. **Deploy API route**:

   - The `src/api/inngest.ts` file works with serverless platforms
   - Deploy to Vercel, Netlify, or your preferred hosting

4. **Configure Inngest App**:
   - Set your production API URL in Inngest dashboard
   - Configure event sources and schedules

## 🔄 Next Steps

1. **Add your own functions** to `src/lib/inngest/functions.ts`
2. **Create integrations** with external services in `src/lib/inngest/integrations.ts`
3. **Trigger events** from your React components
4. **Set up schedules** for recurring tasks
5. **Monitor production** via Inngest dashboard

## 📚 Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest TypeScript SDK](https://www.inngest.com/docs/sdk/typescript)
- [Inngest Functions Guide](https://www.inngest.com/docs/functions)
- [Inngest Event Triggers](https://www.inngest.com/docs/events)
