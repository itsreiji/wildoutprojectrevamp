# Inngest Integration Guide for Wildout Project

This guide shows you how to integrate Inngest into your existing Wildout project services and components.

## Quick Start

### 1. Install Dependencies
```bash
pnpm add inngest
```

### 2. Run Setup Script
```bash
npx tsx src/lib/inngest/setup.ts
```

### 3. Choose Your Integration Method

## Integration Patterns

### Pattern 1: AuthContext Integration

**File**: `src/contexts/AuthContext.tsx`

```typescript
import { inngestClient } from '@/lib/inngest';

// In your registration function:
const register = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  
  if (!error) {
    // Existing audit logging
    await auditService.logEvent({
      action: 'REGISTER_SUCCESS',
      userId: data.user.id,
      userRole: 'user',
      details: { email }
    });
    
    // NEW: Trigger Inngest workflow
    await inngestClient.send({
      name: 'user/registered',
      data: {
        userId: data.user.id,
        email,
        timestamp: Date.now()
      }
    });
  }
  
  return { data, error };
};
```

### Pattern 2: Dashboard Components

**File**: `src/components/dashboard/DashboardEventForm.tsx`

```typescript
import { inngestClient } from '@/lib/inngest';

const handleCreateEvent = async (eventData: any) => {
  // Create event in database
  const { data: event, error } = await supabaseClient
    .from('events')
    .insert(eventData)
    .select()
    .single();
  
  if (error) throw error;
  
  // Log to audit service
  await auditService.logContentAction(
    currentUser.id,
    'admin',
    'CREATE',
    'EVENT',
    event.id,
    { title: event.title }
  );
  
  // NEW: Trigger Inngest workflow
  await inngestClient.send({
    name: 'event/created',
    data: {
      eventId: event.id,
      title: event.title,
      createdBy: currentUser.id
    }
  });
  
  return event;
};
```

### Pattern 3: React Hooks (Recommended)

**File**: `src/components/YourComponent.tsx`

```typescript
import { useUserRegistration, useEventCreation, useAuditLog } from '@/lib/inngest';

function RegistrationForm() {
  const { triggerWelcomeEmail, loading, error } = useUserRegistration();
  
  const handleSubmit = async (email: string, password: string) => {
    try {
      // Register user
      const { data: { user } } = await supabaseClient.auth.signUp({ 
        email, 
        password 
      });
      
      // Trigger welcome email workflow
      await triggerWelcomeEmail(user.id, email);
      
      // Everything happens automatically in the background!
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button disabled={loading}>
        {loading ? 'Processing...' : 'Register'}
      </button>
    </form>
  );
}
```

### Pattern 4: Service Layer Integration

**File**: `src/services/auditService.ts` (Enhanced)

```typescript
import { inngestClient } from '@/lib/inngest';

export const auditService = {
  // ... existing methods
  
  // Enhanced version with Inngest
  logEvent: async (entry: LogEntry) => {
    // Existing Supabase logging
    const { error } = await supabase
      .from('audit_log')
      .insert({ /* ... */ });
    
    if (error) throw error;
    
    // NEW: Trigger Inngest for additional processing
    await inngestClient.send({
      name: 'audit/log',
      data: {
        action: entry.action,
        userId: entry.userId,
        details: entry.details || {}
      }
    });
    
    return { success: true };
  }
};
```

## Available Workflows

### User Registration Flow
```typescript
await inngestClient.send({
  name: 'user/registered',
  data: { userId, email, timestamp }
});
```
**What happens**:
1. Logs registration in audit trail
2. Sends welcome email
3. Creates user profile
4. Returns completion status

### Event Creation Flow
```typescript
await inngestClient.send({
  name: 'event/created',
  data: { eventId, title, createdBy }
});
```
**What happens**:
1. Validates event data
2. Logs to audit trail
3. Sends notifications
4. Updates related records

### Audit Logging Flow
```typescript
await inngestClient.send({
  name: 'audit/log',
  data: { action, userId, details }
});
```
**What happens**:
1. Stores in Supabase
2. Performs security checks
3. Triggers alerts if needed
4. Monitors for suspicious patterns

### Email Processing Flow
```typescript
await inngestClient.send({
  name: 'email/send',
  data: { to, subject, body }
});
```
**What happens**:
1. Validates email format
2. Sends through email service
3. Logs delivery status
4. Handles retries automatically

## API Route Setup

### Option A: Express.js
```javascript
// server.js
import { createInngestExpressRoute } from './src/lib/inngest/api';

app.use('/api/inngest', createInngestExpressRoute());
```

### Option B: Serverless (Vercel/Netlify)
```typescript
// api/inngest.ts
import { handleInngestRequest } from '../src/lib/inngest/api';

export default async function handler(req: Request) {
  return handleInngestRequest(req);
}
```

### Option C: Hono (Your current setup)
```typescript
import { createInngestHonoRoute } from './src/lib/inngest/api';

const app = new Hono();
app.all('/inngest', createInngestHonoRoute());
```

## Testing Your Integration

### Local Development
```bash
# Terminal 1: Run your app
pnpm dev

# Terminal 2: Run Inngest dev server
inngest dev
```

### Test Events
```typescript
// In browser console or test script
import { inngestClient } from '@/lib/inngest';

// Test user registration
await inngestClient.send({
  name: 'user/registered',
  data: {
    userId: 'test-user-123',
    email: 'test@example.com',
    timestamp: Date.now()
  }
});

// Test event creation
await inngestClient.send({
  name: 'event/created',
  data: {
    eventId: 'event-456',
    title: 'Test Event',
    createdBy: 'user-123'
  }
});
```

## Production Deployment

### 1. Get Inngest Credentials
- Go to https://app.inngest.com
- Create a new app
- Copy your event key and signing key

### 2. Set Environment Variables
```bash
# .env.production
INNGEST_EVENT_KEY=your_production_key
INNGEST_SIGNING_KEY=your_signing_key
```

### 3. Deploy API Route
Make sure your API route is deployed and accessible at:
`https://yourdomain.com/api/inngest`

### 4. Configure Inngest Dashboard
- Add your app URL in Inngest dashboard
- Test the connection
- Monitor function runs

## Common Issues & Solutions

### Issue: Events not triggering
**Solution**: Check that your API route is correctly configured and accessible

### Issue: Functions not appearing in dashboard
**Solution**: Ensure functions are exported in `inngestFunctions` array

### Issue: TypeScript errors
**Solution**: Make sure event types are defined in `WildoutEvents`

### Issue: Supabase client errors
**Solution**: Verify environment variables are set correctly

## Next Steps

1. ✅ **Basic Setup**: Complete the installation and configuration
2. 🧪 **Test Locally**: Use `inngest dev` to test functions
3. 🔗 **Integrate**: Add Inngest calls to your existing services
4. 📊 **Monitor**: Use Inngest dashboard to track execution
5. 🚀 **Deploy**: Set up production environment

## Need Help?

- Check `README.md` for detailed documentation
- Review `examples.ts` for practical patterns
- Visit Inngest docs: https://www.inngest.com/docs