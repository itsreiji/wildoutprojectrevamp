# 🚀 Production Deployment Guide - Wildout Project with Inngest

## Overview
This guide provides step-by-step instructions for deploying the Wildout Project to Vercel with full Inngest integration for production use.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Configuration
You **must** configure these environment variables in Vercel before deployment:

#### Required Variables
| Variable Name | Description | Example |
|---------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | `public-anon-key-here` |
| `VITE_INNGEST_EVENT_KEY` | Inngest event key for production | `prod-key-from-inngest` |
| `VITE_INNGEST_APP_ID` | Application ID for Inngest | `wildout-production` |
| `VITE_INNGEST_BASE_URL` | Your Vercel app URL | `https://your-app.vercel.app` |

#### Optional Variables
| Variable Name | Description | Example |
|---------------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | For server-side operations | `service-role-key` |
| `EMAIL_SERVICE` | Email provider (sendgrid/resend) | `sendgrid` |
| `EMAIL_API_KEY` | Email service API key | `your-email-key` |
| `VITE_ANALYTICS_ID` | Analytics tracking ID | `GA-XXXXX` |
| `VITE_SENTRY_DSN` | Error tracking DSN | `sentry-dsn-url` |

### 2. Inngest Configuration
1. **Create Inngest Account**: Sign up at [inngest.com](https://inngest.com)
2. **Create App**: Create a new app with ID `wildout-production`
3. **Get Event Key**: Copy your production event key
4. **Configure Webhook**: Set up webhook URL to `https://your-app.vercel.app/api/inngest`

### 3. Supabase Configuration
1. **Enable Storage**: Ensure `wildout-images` bucket exists
2. **Configure RLS**: Verify Row Level Security policies are set
3. **Database Functions**: Ensure all required functions are created
4. **Edge Functions**: Deploy any required Edge Functions

## 📋 Vercel Project Configuration

### Project Settings
```json
{
  "framework": "vite",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "devCommand": "vite",
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}
```

### Build Configuration
The project uses Vite with optimized production build:
- **Target**: ESNext
- **Minification**: esbuild
- **Sourcemap**: Enabled
- **Chunk Splitting**: Optimized for performance

### Serverless Functions
Inngest API endpoint configured with:
- **Memory**: 1024 MB
- **Max Duration**: 60 seconds
- **Runtime**: Node.js 18+

## 🚀 Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure latest code is pushed
git add .
git commit -m "Production deployment preparation"
git push origin main
```

### Step 2: Vercel Setup
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your `wildoutprojectrevamp` repository
4. Configure project settings as shown above
5. Add all environment variables
6. Click **Deploy**

### Step 3: Inngest Setup
1. **Deploy Functions**: After Vercel deployment, Inngest will detect your functions
2. **Verify Connection**: Check Inngest dashboard for successful connection
3. **Test Events**: Send test events to verify processing

### Step 4: Post-Deployment Verification
1. **Health Check**: Visit `https://your-app.vercel.app/health`
2. **Inngest API**: Test `https://your-app.vercel.app/api/inngest`
3. **SPA Routes**: Verify all routes work (admin, dashboard, etc.)
4. **Supabase Connection**: Test data loading

## 🔄 Inngest Function Overview

### Core Functions (4)
1. **Send Welcome Email** (`send-welcome-email`)
   - Trigger: `user/registered`
   - Retries: 3 attempts
   - Rate Limit: 50/minute

2. **Process New Event** (`process-new-event`)
   - Trigger: `event/created`
   - Retries: 2 attempts
   - Rate Limit: 30/minute

3. **Process Audit Log** (`process-audit-log`)
   - Trigger: `audit/log`
   - Retries: 5 attempts
   - Rate Limit: 200/minute

4. **Batch Email Processor** (`batch-email-processor`)
   - Trigger: `email/send`
   - Retries: 3 attempts
   - Rate Limit: 100/minute

### Integration Workflows (5)
1. **Enhanced Audit Logger** - Security monitoring
2. **User Registration Workflow** - Complete registration flow
3. **Event Creation Workflow** - Event processing pipeline
4. **Enhanced Email Processor** - Advanced email handling
5. **Maintenance Workflow** - System maintenance tasks

## 🔒 Security Configuration

### Environment Security
- ✅ **Never** commit secrets to repository
- ✅ Use Vercel environment variables
- ✅ Separate dev/staging/production environments
- ✅ Rotate keys regularly

### API Security
- ✅ Rate limiting enabled
- ✅ Input validation on all functions
- ✅ Audit logging for sensitive actions
- ✅ Security monitoring for anomalies

### Data Protection
- ✅ RLS policies in Supabase
- ✅ Service role keys only in server-side
- ✅ Public anon keys for client-side
- ✅ Encryption for sensitive data

## 📊 Monitoring & Observability

### Inngest Dashboard
- **Function Execution**: Monitor all function runs
- **Error Tracking**: View failed executions
- **Performance Metrics**: Track execution times
- **Event Flow**: Visualize event processing

### Vercel Analytics
- **Performance**: Page load times
- **Serverless Functions**: Execution metrics
- **Edge Network**: CDN performance
- **Real-time Logs**: Live function logs

### Supabase Monitoring
- **Database Queries**: Query performance
- **Storage**: Usage and bandwidth
- **Auth**: User activity and security
- **Edge Functions**: Execution metrics

## 🚨 Troubleshooting

### Common Issues

#### 1. Inngest Connection Failed
**Symptoms**: Functions not triggering, webhook errors
**Solutions**:
- Verify `VITE_INNGEST_EVENT_KEY` is set
- Check webhook URL is correct
- Ensure API endpoint is accessible
- Review Inngest dashboard for errors

#### 2. Supabase Connection Issues
**Symptoms**: Data not loading, auth failures
**Solutions**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check RLS policies
- Ensure CORS is configured
- Test connection locally first

#### 3. Build Failures
**Symptoms**: Vercel build fails
**Solutions**:
- Check `package.json` dependencies
- Verify TypeScript compilation
- Ensure all environment variables are set
- Review build logs in Vercel

#### 4. Function Timeouts
**Symptoms**: Functions exceed 60s limit
**Solutions**:
- Optimize function logic
- Use step-based execution
- Implement proper error handling
- Consider splitting long operations

### Debug Mode
For development and debugging:
```bash
# Start Inngest dev server
pnpm run inngest:dev

# Run full development stack
pnpm run dev:full

# View logs
pnpm run dev:inngest
```

## 📈 Performance Optimization

### Build Optimization
- ✅ Code splitting enabled
- ✅ Tree shaking active
- ✅ Image optimization
- ✅ Asset compression

### Runtime Optimization
- ✅ Concurrent execution limits
- ✅ Rate limiting per function
- ✅ Efficient database queries
- ✅ Caching strategies

### Inngest Optimization
- ✅ Step-based execution
- ✅ Retry logic with backoff
- ✅ Concurrency controls
- ✅ Error handling patterns

## 🎯 Success Metrics

### Reliability
- **Function Success Rate**: >99%
- **Error Recovery**: Automatic retry
- **Uptime**: 99.9% with fallbacks

### Performance
- **Execution Time**: <500ms per function
- **Concurrent Limit**: Configurable per function
- **Rate Limiting**: Prevents system overload

### Security
- **Threat Detection**: Real-time monitoring
- **Audit Coverage**: 100% of sensitive actions
- **Compliance**: Full audit trail

## 📝 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Inngest functions deployed and active
- [ ] Supabase connection verified
- [ ] Health endpoint returns 200
- [ ] SPA routes work correctly
- [ ] Admin dashboard accessible
- [ ] Inngest dashboard shows active functions
- [ ] Error monitoring configured
- [ ] Analytics tracking enabled
- [ ] Backup strategy in place

## 🆘 Support

### Documentation
- **Inngest Docs**: https://docs.inngest.com
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

### Community
- **Inngest Discord**: Community support
- **Vercel Community**: Deployment help
- **Supabase Community**: Database questions

### Emergency Contacts
- **Inngest Support**: support@inngest.com
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: 2025-12-21
**Version**: 1.0.0