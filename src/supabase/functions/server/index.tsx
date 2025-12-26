import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-41a567c3/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== CONTENT ENDPOINTS ==========

// Hero Section
app.get("/make-server-41a567c3/hero", async (c) => {
  try {
    const hero = await kv.get("hero");
    return c.json({ data: hero });
  } catch (error) {
    console.log("Error fetching hero:", error);
    return c.json({ error: "Failed to fetch hero section" }, 500);
  }
});

app.put("/make-server-41a567c3/hero", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("hero", body);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error updating hero:", error);
    return c.json({ error: "Failed to update hero section" }, 500);
  }
});

// About Section
app.get("/make-server-41a567c3/about", async (c) => {
  try {
    const about = await kv.get("about");
    return c.json({ data: about });
  } catch (error) {
    console.log("Error fetching about:", error);
    return c.json({ error: "Failed to fetch about section" }, 500);
  }
});

app.put("/make-server-41a567c3/about", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("about", body);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error updating about:", error);
    return c.json({ error: "Failed to update about section" }, 500);
  }
});

// Events
app.get("/make-server-41a567c3/events", async (c) => {
  try {
    const events = await kv.getByPrefix("event:");
    return c.json({ data: events });
  } catch (error) {
    console.log("Error fetching events:", error);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

app.get("/make-server-41a567c3/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const event = await kv.get(`event:${id}`);
    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }
    return c.json({ data: event });
  } catch (error) {
    console.log("Error fetching event:", error);
    return c.json({ error: "Failed to fetch event" }, 500);
  }
});

app.post("/make-server-41a567c3/events", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || Date.now().toString();
    const event = { ...body, id };
    await kv.set(`event:${id}`, event);
    return c.json({ success: true, data: event });
  } catch (error) {
    console.log("Error creating event:", error);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

app.put("/make-server-41a567c3/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const event = { ...body, id };
    await kv.set(`event:${id}`, event);
    return c.json({ success: true, data: event });
  } catch (error) {
    console.log("Error updating event:", error);
    return c.json({ error: "Failed to update event" }, 500);
  }
});

app.delete("/make-server-41a567c3/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`event:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting event:", error);
    return c.json({ error: "Failed to delete event" }, 500);
  }
});

// Team Members
app.get("/make-server-41a567c3/team", async (c) => {
  try {
    const team = await kv.getByPrefix("team:");
    return c.json({ data: team });
  } catch (error) {
    console.log("Error fetching team:", error);
    return c.json({ error: "Failed to fetch team" }, 500);
  }
});

app.post("/make-server-41a567c3/team", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || Date.now().toString();
    const member = { ...body, id };
    await kv.set(`team:${id}`, member);
    return c.json({ success: true, data: member });
  } catch (error) {
    console.log("Error creating team member:", error);
    return c.json({ error: "Failed to create team member" }, 500);
  }
});

app.put("/make-server-41a567c3/team/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const member = { ...body, id };
    await kv.set(`team:${id}`, member);
    return c.json({ success: true, data: member });
  } catch (error) {
    console.log("Error updating team member:", error);
    return c.json({ error: "Failed to update team member" }, 500);
  }
});

app.delete("/make-server-41a567c3/team/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`team:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting team member:", error);
    return c.json({ error: "Failed to delete team member" }, 500);
  }
});

// Gallery
app.get("/make-server-41a567c3/gallery", async (c) => {
  try {
    const gallery = await kv.getByPrefix("gallery:");
    return c.json({ data: gallery });
  } catch (error) {
    console.log("Error fetching gallery:", error);
    return c.json({ error: "Failed to fetch gallery" }, 500);
  }
});

app.post("/make-server-41a567c3/gallery", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || Date.now().toString();
    const image = { ...body, id };
    await kv.set(`gallery:${id}`, image);
    return c.json({ success: true, data: image });
  } catch (error) {
    console.log("Error creating gallery image:", error);
    return c.json({ error: "Failed to create gallery image" }, 500);
  }
});

app.delete("/make-server-41a567c3/gallery/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`gallery:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting gallery image:", error);
    return c.json({ error: "Failed to delete gallery image" }, 500);
  }
});

// Partners
app.get("/make-server-41a567c3/partners", async (c) => {
  try {
    const partners = await kv.getByPrefix("partner:");
    return c.json({ data: partners });
  } catch (error) {
    console.log("Error fetching partners:", error);
    return c.json({ error: "Failed to fetch partners" }, 500);
  }
});

app.post("/make-server-41a567c3/partners", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || Date.now().toString();
    const partner = { ...body, id };
    await kv.set(`partner:${id}`, partner);
    return c.json({ success: true, data: partner });
  } catch (error) {
    console.log("Error creating partner:", error);
    return c.json({ error: "Failed to create partner" }, 500);
  }
});

app.put("/make-server-41a567c3/partners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const partner = { ...body, id };
    await kv.set(`partner:${id}`, partner);
    return c.json({ success: true, data: partner });
  } catch (error) {
    console.log("Error updating partner:", error);
    return c.json({ error: "Failed to update partner" }, 500);
  }
});

app.delete("/make-server-41a567c3/partners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`partner:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting partner:", error);
    return c.json({ error: "Failed to delete partner" }, 500);
  }
});

// Settings
app.get("/make-server-41a567c3/settings", async (c) => {
  try {
    const settings = await kv.get("settings");
    return c.json({ data: settings });
  } catch (error) {
    console.log("Error fetching settings:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

app.put("/make-server-41a567c3/settings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings", body);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log("Error updating settings:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

Deno.serve(app.fetch);