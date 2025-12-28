
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import {
  HeroSchema,
  AboutSchema,
  EventSchema,
  TeamMemberSchema,
  PartnerSchema,
  SettingsSchema,
  GalleryImageSchema,
} from "./schemas.ts";

const app = new Hono();

// Initialize Supabase Client for Auth
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Middleware ---

// Logger
app.use("*", logger(console.log));

// CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Auth Middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized: Missing Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }

  c.set("user", user);
  await next();
};

// --- Helpers ---

const validate = async (c: any, schema: any) => {
  try {
    const body = await c.req.json();
    return schema.parse(body);
  } catch (error: any) {
    return c.json({ error: "Validation Failed", details: error.errors }, 400);
  }
};

// --- Routes ---

// Health Check
app.get("/make-server-41a567c3/health", (c) => c.json({ status: "ok" }));

// Hero
app.get("/make-server-41a567c3/hero", async (c) => {
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");
  const data = await kv.get("hero");
  return c.json({ data });
});

app.put("/make-server-41a567c3/hero", authMiddleware, async (c) => {
  const validation = await validate(c, HeroSchema);
  if (validation instanceof Response) return validation;
  await kv.set("hero", validation);
  return c.json({ success: true, data: validation });
});

// About
app.get("/make-server-41a567c3/about", async (c) => {
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");
  const data = await kv.get("about");
  return c.json({ data });
});

app.put("/make-server-41a567c3/about", authMiddleware, async (c) => {
  const validation = await validate(c, AboutSchema);
  if (validation instanceof Response) return validation;
  await kv.set("about", validation);
  return c.json({ success: true, data: validation });
});

// Events
app.get("/make-server-41a567c3/events", async (c) => {
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");
  const data = await kv.getByPrefix("event:");
  return c.json({ data });
});

app.get("/make-server-41a567c3/events/:id", async (c) => {
  const id = c.req.param("id");
  const data = await kv.get(`event:${id}`);
  if (!data) return c.json({ error: "Event not found" }, 404);
  return c.json({ data });
});

app.post("/make-server-41a567c3/events", authMiddleware, async (c) => {
  const validation = await validate(c, EventSchema);
  if (validation instanceof Response) return validation;
  const id = validation.id || crypto.randomUUID();
  const event = { ...validation, id };
  await kv.set(`event:${id}`, event);
  return c.json({ success: true, data: event });
});

app.put("/make-server-41a567c3/events/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const validation = await validate(c, EventSchema);
  if (validation instanceof Response) return validation;
  const event = { ...validation, id };
  await kv.set(`event:${id}`, event);
  return c.json({ success: true, data: event });
});

app.delete("/make-server-41a567c3/events/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await kv.del(`event:${id}`);
  return c.json({ success: true });
});

// Team
app.get("/make-server-41a567c3/team", async (c) => {
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");
  const data = await kv.getByPrefix("team:");
  return c.json({ data });
});

app.post("/make-server-41a567c3/team", authMiddleware, async (c) => {
  const validation = await validate(c, TeamMemberSchema);
  if (validation instanceof Response) return validation;
  const id = validation.id || crypto.randomUUID();
  const member = { ...validation, id };
  await kv.set(`team:${id}`, member);
  return c.json({ success: true, data: member });
});

app.put("/make-server-41a567c3/team/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const validation = await validate(c, TeamMemberSchema);
  if (validation instanceof Response) return validation;
  const member = { ...validation, id };
  await kv.set(`team:${id}`, member);
  return c.json({ success: true, data: member });
});

app.delete("/make-server-41a567c3/team/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await kv.del(`team:${id}`);
  return c.json({ success: true });
});

// Partners
app.get("/make-server-41a567c3/partners", async (c) => {
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");
  const data = await kv.getByPrefix("partner:");
  return c.json({ data });
});

app.post("/make-server-41a567c3/partners", authMiddleware, async (c) => {
  const validation = await validate(c, PartnerSchema);
  if (validation instanceof Response) return validation;
  const id = validation.id || crypto.randomUUID();
  const partner = { ...validation, id };
  await kv.set(`partner:${id}`, partner);
  return c.json({ success: true, data: partner });
});

app.put("/make-server-41a567c3/partners/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const validation = await validate(c, PartnerSchema);
  if (validation instanceof Response) return validation;
  const partner = { ...validation, id };
  await kv.set(`partner:${id}`, partner);
  return c.json({ success: true, data: partner });
});

app.delete("/make-server-41a567c3/partners/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await kv.del(`partner:${id}`);
  return c.json({ success: true });
});

// Settings
app.get("/make-server-41a567c3/settings", async (c) => {
  const data = await kv.get("settings");
  return c.json({ data });
});

app.put("/make-server-41a567c3/settings", authMiddleware, async (c) => {
  const validation = await validate(c, SettingsSchema);
  if (validation instanceof Response) return validation;
  await kv.set("settings", validation);
  return c.json({ success: true, data: validation });
});

// Gallery
app.get("/make-server-41a567c3/gallery", async (c) => {
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");
  const data = await kv.getByPrefix("gallery:");
  return c.json({ data });
});

app.post("/make-server-41a567c3/gallery", authMiddleware, async (c) => {
  const validation = await validate(c, GalleryImageSchema);
  if (validation instanceof Response) return validation;
  const id = validation.id || crypto.randomUUID();
  const image = { ...validation, id };
  await kv.set(`gallery:${id}`, image);
  return c.json({ success: true, data: image });
});

app.delete("/make-server-41a567c3/gallery/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await kv.del(`gallery:${id}`);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
