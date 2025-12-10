import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import * as kv from './kv_store'; // Updated import path
import { logAuditEvent } from './audit';

const app = new Hono();

// Enable logger
app.use('*', logger());

// Enable CORS for all routes and methods - SECURITY FIX: Use specific origins in production
app.use(
  '/*',
  cors({
    origin: Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })
);

// Health check endpoint
app.get('/make-server-41a567c3/health', (c) => {
  return c.json({ status: 'ok' });
});

// Example API routes - add more based on your application needs
app.get('/make-server-41a567c3/kv/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const value = await kv.get(key);
    return c.json({ key, value });
  } catch (error) {
    console.error('KV get error:', error);
    return c.json({ error: 'Failed to retrieve value' }, 500);
  }
});

app.post('/make-server-41a567c3/kv', async (c) => {
  try {
    const { key, value } = await c.req.json();
    await kv.set(key, value);

    // Log this operation for audit purposes
    await logAuditEvent({
      action: 'KV_SET',
      table_name: 'kv_store',
      record_id: key,
      details: { key },
      ip_address: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
      user_agent: c.req.header('User-Agent'),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('KV set error:', error);
    return c.json({ error: 'Failed to store value' }, 500);
  }
});

// Additional KV operations with audit logging
app.put('/make-server-41a567c3/kv', async (c) => {
  try {
    const { keys, values } = await c.req.json();
    await kv.mset(keys, values);

    // Log this operation for audit purposes
    await logAuditEvent({
      action: 'KV_MSET',
      table_name: 'kv_store',
      details: { keys: keys.length },
      ip_address: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
      user_agent: c.req.header('User-Agent'),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('KV mset error:', error);
    return c.json({ error: 'Failed to store values' }, 500);
  }
});

app.delete('/make-server-41a567c3/kv/:key', async (c) => {
  try {
    const key = c.req.param('key');
    await kv.del(key);

    // Log this operation for audit purposes
    await logAuditEvent({
      action: 'KV_DELETE',
      table_name: 'kv_store',
      record_id: key,
      details: { key },
      ip_address: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
      user_agent: c.req.header('User-Agent'),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('KV delete error:', error);
    return c.json({ error: 'Failed to delete value' }, 500);
  }
});

Deno.serve(app.fetch);