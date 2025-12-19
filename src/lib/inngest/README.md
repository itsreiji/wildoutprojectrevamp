# Inngest Setup for Wildout Project

This directory contains the Inngest integration for the Wildout project, providing event-driven workflows and background functions.

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm add inngest

# 2. Run setup script
npx tsx src/lib/inngest/setup.ts

# 3. Set up API route (see below)

# 4. Start using in your code!
```

## What's Included

- **Client Configuration** (`client.ts`): Inngest client setup with typed events
- **Functions** (`functions.ts`): Example event-driven functions for user registration, event creation, audit logging, and email processing
- **Integrations** (`integrations.ts`): Workflows that integrate with your existing services (auditService, Supabase)
- **Server Handler** (`server.ts`): Inngest server handler for processing functions
- **API Utilities** (`api.ts`): Framework-specific API route handlers
- **React Hooks** (`hooks.ts`): Custom hooks for triggering events from React components
- **Examples** (`examples.ts`): Practical integration patterns for your existing code
- **Setup Script** (`setup.ts`): Automated configuration helper

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Inngest Configuration (optional for local development)
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here

# For production, get these from https://app.inngest.com
```

### 2. API Route Setup

Depending on your deployment platform, set up the API route:

#### For Vite + Express:

```typescript
// server.js or wherever you set up Express
import { createInngestExpressRoute } from "./src/lib/inngest/api";

app.use("/api/inngest", createInngestExpressRoute());
```

#### For Serverless (Vercel, Netlify, etc.):

```typescript
// api/inngest.ts or functions/inngest.ts
import { handleInngestRequest } from "../src/lib/inngest/api";

export default async function handler(req: Request) {
  return handleInngestRequest(req);
}
```

#### For Hono (already in your dependencies):

```typescript
import { createInngestHonoRoute } from "./src/lib/inngest/api";

const app = new Hono();
app.all("/inngest", createInngestHonoRoute());
```

### 3. Using in React Components

```typescript
import { useUserRegistration, useEventCreation } from "@/lib/inngest";

// In your registration component
function RegistrationForm() {
  const { triggerWelcomeEmail, loading } = useUserRegistration();

  const handleRegister = async (email: string) => {
    const user = await createUser(email);
    await triggerWelcomeEmail(user.id, email);
  };

  // ...
}

// In your event creation component
function CreateEventForm() {
  const { triggerEventCreated } = useEventCreation();

  const handleCreateEvent = async (title: string) => {
    const event = await createEvent(title);
    await triggerEventCreated(event.id, event.title, currentUser.id);
  };
}
```

### 4. Development Workflow

#### Local Development with Inngest CLI:

1. Install Inngest CLI:

```bash
npm install -g inngest-cli
# or
brew install inngest
```

2. Run Inngest dev server:

```bash
inngest dev
```

3. Your functions will be available at `http://localhost:8288`

#### Without Inngest CLI:

The functions will work in "dev mode" without the CLI, but you won't get the nice dashboard. Events will still be processed when triggered.

## 📖 Usage Examples

### Basic Event Triggering

```typescript
import { inngestClient } from "@/lib/inngest";

// Trigger user registration workflow
await inngestClient.send({
  name: "user/registered",
  data: {
    userId: user.id,
    email: user.email,
    timestamp: Date.now(),
  },
});

// Trigger event creation workflow
await inngestClient.send({
  name: "event/created",
  data: {
    eventId: event.id,
    title: event.title,
    createdBy: currentUser.id,
  },
});

// Trigger audit logging
await inngestClient.send({
  name: "audit/log",
  data: {
    action: "USER_LOGIN",
    userId: user.id,
    details: { ip: request.ip },
  },
});
```

### Integration with Existing Services

#### AuthContext Integration

```typescript
// src/contexts/AuthContext.tsx
import { inngestClient } from "@/lib/inngest";

const register = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if (!error) {
    // Existing audit logging
    await auditService.logEvent({
      action: "REGISTER_SUCCESS",
      userId: data.user.id,
      userRole: "user",
      details: { email },
    });

    // NEW: Trigger Inngest workflow
    await inngestClient.send({
      name: "user/registered",
      data: {
        userId: data.user.id,
        email,
        timestamp: Date.now(),
      },
    });
  }

  return { data, error };
};
```

#### Dashboard Component Integration

```typescript
// src/components/dashboard/DashboardEventForm.tsx
import { inngestClient } from "@/lib/inngest";

const handleCreateEvent = async (eventData: any) => {
  const { data: event, error } = await supabaseClient
    .from("events")
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;

  // Log to audit service
  await auditService.logContentAction(
    currentUser.id,
    "admin",
    "CREATE",
    "EVENT",
    event.id,
    { title: event.title }
  );

  // NEW: Trigger Inngest workflow
  await inngestClient.send({
    name: "event/created",
    data: {
      eventId: event.id,
      title: event.title,
      createdBy: currentUser.id,
    },
  });

  return event;
};
```

### React Hooks

```typescript
import {
  useUserRegistration,
  useEventCreation,
  useAuditLog,
} from "@/lib/inngest";

function RegistrationForm() {
  const { triggerWelcomeEmail, loading, error } = useUserRegistration();

  const handleSubmit = async (email: string, password: string) => {
    const {
      data: { user },
    } = await supabaseClient.auth.signUp({ email, password });
    await triggerWelcomeEmail(user.id, email);
    // Welcome email sent automatically in background!
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Available Functions

#### Core Functions (`functions.ts`)

- **`sendWelcomeEmail`** - Trigger: `user/registered`

  - Sends welcome emails to new users
  - Usage: Call after user registration

- **`processNewEvent`** - Trigger: `event/created`

  - Validates and notifies about new events
  - Usage: Call when an event is created

- **`processAuditLog`** - Trigger: `audit/log`

  - Stores audit logs with security checks
  - Usage: Call for important user actions

- **`batchEmailProcessor`** - Trigger: `email/batch`
  - Handles email sending with rate limiting
  - Usage: For bulk email operations

#### Integration Functions (`integrations.ts`)

- **`enhancedAuditLogger`** - Trigger: `audit/log`

  - Uses your existing `auditService.logEvent()`
  - 3 retry attempts for reliability
  - Security monitoring for suspicious patterns

- **`userRegistrationWorkflow`** - Trigger: `user/registered`

  - Complete registration flow
  - Sends welcome email
  - Creates user profile
  - Logs to audit service

- **`eventCreationWorkflow`** - Trigger: `event/created`

  - Event validation
  - Audit logging
  - Notification sending
  - Related record updates

- **`maintenanceWorkflow`** - Trigger: `system/maintenance`
  - Data cleanup
  - Statistics generation
  - Archive old records

## 🛠️ Available API Handlers

### Express.js

```typescript
import { createInngestExpressRoute } from "./src/lib/inngest/api";
app.use("/api/inngest", createInngestExpressRoute());
```

### Serverless

```typescript
import { handleInngestRequest } from "../src/lib/inngest/api";
export default async function handler(req: Request) {
  return handleInngestRequest(req);
}
```

### Hono

```typescript
import { createInngestHonoRoute } from "./src/lib/inngest/api";
app.all("/inngest", createInngestHonoRoute());
```

## 🧪 Testing

### Local Development

```bash
# Terminal 1: Your app
pnpm dev

# Terminal 2: Inngest dev server (optional)
inngest dev
```

### Test Events

```typescript
// In browser console or test script
import { inngestClient } from "@/lib/inngest";

// Test user registration
await inngestClient.send({
  name: "user/registered",
  data: {
    userId: "test-user-123",
    email: "test@example.com",
    timestamp: Date.now(),
  },
});
```

## 📊 Monitoring

- **Local**: Visit `http://localhost:8288` (with Inngest CLI)
- **Production**: Monitor at https://app.inngest.com
- **Logs**: Check function execution logs for errors

## 🚀 Production Deployment

1. Get credentials from https://app.inngest.com
2. Set environment variables:
   ```bash
   INNGEST_EVENT_KEY=your_key
   INNGEST_SIGNING_KEY=your_signing_key
   ```
3. Deploy your API route
4. Configure Inngest dashboard with your URL

## 📚 Additional Resources

- **Integration Guide**: See `INTEGRATION_GUIDE.md` for detailed patterns
- **Examples**: See `examples.ts` for practical code examples
- **Setup Script**: Run `npx tsx src/lib/inngest/setup.ts` for automated setup

- **Trigger**: `email/send`
- **Purpose**: Handles email sending with validation
- **Usage**: Call to send emails through the event system

### 6. Adding New Functions

1. Create your function in `functions.ts`:

```typescript
export const myNewFunction = inngestClient.createFunction(
  {
    id: "my-new-function",
    name: "My New Function",
  },
  { event: "my/event" },
  async ({ event, step }) => {
    // Your logic here
  }
);
```

2. Add to the exports in `functions.ts`:

```typescript
export const inngestFunctions = [
  // ... existing functions
  myNewFunction,
];
```

3. Add the event type to `WildoutEvents` in `client.ts`:

```typescript
export type WildoutEvents = {
  // ... existing events
  "my/event": {
    customData: string;
    timestamp: number;
  };
};
```

### 7. Production Deployment

1. **Get Inngest credentials** from https://app.inngest.com
2. **Set environment variables**:
   ```bash
   INNGEST_EVENT_KEY=your_production_key
   INNGEST_SIGNING_KEY=your_signing_key
   ```
3. **Deploy your API route** that handles `/api/inngest`
4. **Configure Inngest** to point to your deployed URL in the dashboard

### 8. Monitoring & Debugging

- **Inngest Dashboard**: View function runs, logs, and retries
- **Local Dev**: Use `inngest dev` for real-time monitoring
- **Logs**: Check your application logs for function execution

## Common Patterns

### Retry Logic

Functions automatically retry on failure. You can customize this:

```typescript
const myFunction = inngestClient.createFunction(
  {
    id: "my-function",
    retries: 5, // Max retry attempts
    concurrency: 10, // Max concurrent executions
  },
  { event: "my/event" },
  async ({ event, step }) => {
    // Your logic
  }
);
```

### Step-Based Functions

Break your function into steps for better reliability:

```typescript
const myFunction = inngestClient.createFunction(
  { id: "my-function" },
  { event: "my/event" },
  async ({ event, step }) => {
    const result1 = await step.run("step-1", async () => {
      // Do something
      return { data: "result" };
    });

    const result2 = await step.run("step-2", async () => {
      // Use result1
      return { processed: true };
    });

    return { result1, result2 };
  }
);
```

## Troubleshooting

### Events not triggering

- Check that your API route is correctly configured
- Verify environment variables are set
- Check Inngest dashboard for function registration

### Functions not appearing in dashboard

- Ensure you're running `inngest dev` or have deployed to production
- Check that functions are exported in `inngestFunctions` array
- Verify your Inngest client configuration

### TypeScript errors

- Make sure event types are properly defined in `WildoutEvents`
- Check that all imports use correct paths
