import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { facilities, bookings, insights, resolveFacilityPrice, calculateTotalCost } from "../shared/schema";
import { eq, desc } from "drizzle-orm";

// ─── Seed Demo Facilities (used when DB is empty) ─────────────────────────────
const DEMO_FACILITIES = [
  {
    ownerId: null,
    name: "Pune Agri Cold Hub",
    location: "Hadapsar, Pune",
    type: ["Cold", "Multi-purpose"] as string[],
    totalCapacity: 80000,
    availableCapacity: 62000,
    pricePerKgPerDay: 1.10,
    contactPhone: "+91 98765 43210",
    operatingHours: "6AM - 10PM",
    certifications: ["FSSAI", "ISO 22000"] as string[],
    minBookingDays: 1,
    amenities: ["24/7 Security", "Loading Bay", "Temperature Monitoring"] as string[],
    verified: true,
    rating: 4.7,
    reviewCount: 132,
    distance: 2.3,
    imageUrl: "/assets/facilities/pune_hub.png",
  },
  {
    ownerId: null,
    name: "Maharashtra FreshoStore",
    location: "Nashik, Maharashtra",
    type: ["Frozen"] as string[],
    totalCapacity: 50000,
    availableCapacity: 28000,
    pricePerKgPerDay: 4.50,
    contactPhone: "+91 90123 45678",
    operatingHours: "Open 24/7",
    certifications: ["FSSAI"] as string[],
    minBookingDays: 3,
    amenities: ["Backup Power", "Humidity Control"] as string[],
    verified: true,
    rating: 4.4,
    reviewCount: 89,
    distance: 5.1,
    imageUrl: "/assets/facilities/nashik_freshostore.png",
  },
  {
    ownerId: null,
    name: "GreenVault Agristorage",
    location: "Aurangabad, Maharashtra",
    type: ["Cold"] as string[],
    totalCapacity: 40000,
    availableCapacity: 38000,
    pricePerKgPerDay: 0.95,
    contactPhone: "+91 77654 32190",
    operatingHours: "8AM - 8PM",
    certifications: [] as string[],
    minBookingDays: 1,
    amenities: ["Loading Bay"] as string[],
    verified: false,
    rating: 4.1,
    reviewCount: 41,
    distance: 8.6,
    imageUrl: "/assets/facilities/aurangabad_greenvault.png",
  },
];

async function ensureSeedFacilities() {
  try {
    const existing = await db.select().from(facilities);
    if (existing.length === 0) {
      await db.insert(facilities).values(DEMO_FACILITIES as any);
      console.log("✓ Seeded 3 demo facilities");
    }
  } catch (e) {
    console.error("Seed error (non-fatal):", e);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Seed demo data on startup
  await ensureSeedFacilities();

  // ─── FACILITIES ──────────────────────────────────────────────────────────────
  app.get("/api/facilities", async (req, res) => {
    try {
      let allFacilities = await db.select().from(facilities);

      // Filter by ownerId if provided (for provider dashboard)
      const { ownerId } = req.query;
      if (ownerId && typeof ownerId === "string") {
        allFacilities = allFacilities.filter((f) => f.ownerId === ownerId);
      }

      // Sort by distance (ascending) for farmer view
      allFacilities.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));

      res.json(allFacilities);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch facilities." });
    }
  });

  app.get("/api/facilities/:id", async (req, res) => {
    try {
      const [facility] = await db.select().from(facilities).where(eq(facilities.id, req.params.id));
      if (!facility) return res.status(404).json({ error: "Facility not found." });
      res.json(facility);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch facility details." });
    }
  });

  // ─── CREATE FACILITY (Provider Only) ─────────────────────────────────────────
  app.post("/api/facilities", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "provider") {
      return res.status(403).json({ error: "Only providers can create facilities." });
    }
    try {
      const {
        name, location, type, totalCapacity, availableCapacity,
        pricePerKgPerDay, contactPhone, operatingHours, certifications, minBookingDays, amenities
      } = req.body;

      if (!name || !location || !totalCapacity || !pricePerKgPerDay) {
        return res.status(400).json({ error: "Name, location, capacity, and price are required." });
      }

      const [facility] = await db.insert(facilities).values({
        ownerId: req.user.id,
        name: name.trim(),
        location: location.trim(),
        type: Array.isArray(type) ? type : [type || "Cold"],
        totalCapacity: Number(totalCapacity),
        availableCapacity: Number(availableCapacity ?? totalCapacity),
        pricePerKgPerDay: Number(pricePerKgPerDay),
        contactPhone: contactPhone || "N/A",
        operatingHours: operatingHours || "8AM - 8PM",
        certifications: certifications || [],
        minBookingDays: Number(minBookingDays || 1),
        amenities: amenities || [],
        verified: false,
        rating: 0,
        reviewCount: 0,
        distance: 0,
      }).returning();

      res.status(201).json(facility);
    } catch (e) {
      console.error("Create facility error:", e);
      res.status(500).json({ error: "Failed to create facility." });
    }
  });

  app.put("/api/facilities/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "provider") {
      return res.status(403).json({ error: "Only providers can update facilities." });
    }
    try {
      const updates: Record<string, any> = {};
      if (req.body.pricePerKgPerDay !== undefined) updates.pricePerKgPerDay = Number(req.body.pricePerKgPerDay);
      if (req.body.availableCapacity !== undefined) updates.availableCapacity = Number(req.body.availableCapacity);
      if (req.body.totalCapacity !== undefined) updates.totalCapacity = Number(req.body.totalCapacity);
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.location !== undefined) updates.location = req.body.location;

      // Price validation (if category is known or provided)
      // For now, simple non-negative check. Category-based warning handled in UI.
      // Price validation: strictly positive price required
      if (updates.pricePerKgPerDay !== undefined && updates.pricePerKgPerDay <= 0) {
        return res.status(400).json({ error: "Price must be greater than zero." });
      }

      const [updated] = await db.update(facilities).set(updates).where(eq(facilities.id, req.params.id)).returning();
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update facility." });
    }
  });

  // ─── BOOKINGS ─────────────────────────────────────────────────────────────────
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to book." });
    }

    try {
      const { facilityId, facilityName, facilityLocation, quantity, duration, storageType, storageCategory } = req.body;

      const [facility] = await db.select().from(facilities).where(eq(facilities.id, facilityId));
      if (!facility) return res.status(404).json({ error: "Facility not found" });

      if (quantity > facility.availableCapacity) {
        return res.status(400).json({ error: "Requested quantity exceeds available capacity." });
      }

      // Use standardized price resolution (Owner Price > Category Default > Fallback)
      const actualPrice = resolveFacilityPrice(facility.pricePerKgPerDay, storageCategory || "Fruits & Vegetables");
      const totalCost = calculateTotalCost(quantity, actualPrice, duration);

      const now = new Date();
      const end = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

      // Status starts as "pending" — owner must Accept to confirm
      const [booking] = await db.insert(bookings).values({
        userId: req.user.id,
        facilityId,
        facilityName,
        facilityLocation,
        quantity,
        duration,
        totalCost,
        pricePerKgPerDay: actualPrice,
        storageType,
        storageCategory: req.body.storageCategory || "Fruits & Vegetables",
        startDate: now,
        endDate: end,
        status: "pending",
      }).returning();

      res.status(201).json(booking);
    } catch (e) {
      res.status(500).json({ error: "Booking submission failed." });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    try {
      let userBookings: import("../shared/schema").BookingType[] = [];
      if (req.user.role === "farmer") {
        userBookings = await db.select().from(bookings).where(eq(bookings.userId, req.user.id)).orderBy(desc(bookings.startDate));
      } else {
        const providerFacilities = await db.select().from(facilities).where(eq(facilities.ownerId, req.user.id));
        const pids = providerFacilities.map(f => f.id);
        if (pids.length > 0) {
          const allBookings = await db.select().from(bookings).orderBy(desc(bookings.startDate));
          userBookings = allBookings.filter((b) => pids.includes(b.facilityId));
        }
      }
      res.json(userBookings);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch bookings." });
    }
  });

  app.put("/api/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "provider") {
      return res.status(403).json({ error: "Providers only." });
    }

    try {
      const { status } = req.body;
      const bookingId = req.params.id;

      const result = await db.transaction(async (tx) => {
        const [booking] = await tx.select().from(bookings).where(eq(bookings.id, bookingId));
        if (!booking) throw new Error("Booking not found");

        const [facility] = await tx.select().from(facilities).where(eq(facilities.id, booking.facilityId));
        if (!facility) throw new Error("Facility not found");

        // If transitioning TO "active" (approved), reduce capacity
        if (status === "active" && booking.status !== "active") {
          if (facility.availableCapacity < booking.quantity) {
            throw new Error("Insufficient capacity to approve this booking.");
          }
          await tx.update(facilities).set({
            availableCapacity: facility.availableCapacity - booking.quantity
          }).where(eq(facilities.id, facility.id));
        }

        // If transitioning FROM "active" to something else (cancelled/rejected), restore capacity
        if (booking.status === "active" && (status === "cancelled" || status === "rejected")) {
          await tx.update(facilities).set({
            availableCapacity: facility.availableCapacity + booking.quantity
          }).where(eq(facilities.id, facility.id));
        }

        const [updatedBooking] = await tx.update(bookings).set({ status }).where(eq(bookings.id, bookingId)).returning();
        return updatedBooking;
      });

      res.json(result);
    } catch (e: any) {
      console.error("Booking status update failed:", e);
      res.status(400).json({ error: e.message || "Failed to update booking status." });
    }
  });

  // ─── WEATHER (WeatherAPI.com + mock fallback) ────────────────────────────────
  app.get("/api/weather", async (req, res) => {
    const { lat, lon } = req.query;
    const key = process.env.WEATHER_API_KEY;

    if (key && lat && lon) {
      try {
        // WeatherAPI.com endpoint
        const url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${lat},${lon}&aqi=no`;
        const r = await fetch(url);
        if (r.ok) {
          const d = await r.json();
          const temp = Math.round(d.current?.temp_c ?? 30);
          const condition = d.current?.condition?.text || "Clear";
          const humidity = d.current?.humidity ?? 45;
          const feelsLike = Math.round(d.current?.feelslike_c ?? temp);

          let suggestion: string;
          if (temp > 35 || feelsLike > 37) {
            suggestion = `Extreme heat (${temp}°C, feels ${feelsLike}°C) — cold storage strongly recommended. Produce may spoil within 12–24 hours without refrigeration.`;
          } else if (humidity > 75) {
            suggestion = `High humidity (${humidity}%) detected — grain and pulses require airtight cold storage to prevent mould.`;
          } else if (temp > 28) {
            suggestion = `Warm conditions (${temp}°C) — fruits and vegetables should be stored within 48 hours for best quality.`;
          } else {
            suggestion = `Comfortable weather (${temp}°C, ${humidity}% humidity) — standard storage adequate. Book in advance for better rates.`;
          }

          return res.json({ temperature: temp, feelsLike, condition, humidity, suggestion });
        }
        const errText = await r.text().catch(() => r.status.toString());
        console.error("WeatherAPI error:", errText);
      } catch (e) {
        console.error("Weather fetch error:", e);
        // Fall through to mock
      }
    }

    // Mock fallback (always available — rotates by hour)
    const mockAdvisories = [
      { temperature: 36, condition: "Hot & Sunny", humidity: 28, suggestion: "Extreme heat — cold storage strongly recommended. Produce may spoil within 24 hours." },
      { temperature: 29, condition: "Partly Cloudy", humidity: 55, suggestion: "Moderate conditions — store fruits and vegetables within 48 hours for best quality." },
      { temperature: 22, condition: "Mild & Breezy", humidity: 62, suggestion: "Comfortable weather — book in advance for better pricing." },
    ];
    res.json(mockAdvisories[new Date().getHours() % mockAdvisories.length]);
  });

  // ─── AI RECOMMENDATION (NVIDIA NIM + rule-based fallback) ────────────────────
  app.post("/api/ai/recommend", async (req, res) => {
    const { temperature, humidity, cropType, quantity } = req.body;
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "nvidia/llama-3.1-nemotron-70b-instruct";

    if (apiKey) {
      try {
        const prompt = `You are an agricultural cold storage advisor in India. A farmer needs advice.

Conditions:
- Crop/Produce: ${cropType || "mixed produce"}
- Quantity: ${quantity || "unknown"} kg
- Temperature: ${temperature || "unknown"}°C
- Humidity: ${humidity || "unknown"}%

Provide a 1-2 sentence practical recommendation about whether they need cold storage urgently, and what type is best. Be concise and specific. Mention cost if relevant (₹0.35–0.55/kg/day for cold storage in India).`;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 150,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const recommendation = data.choices?.[0]?.message?.content?.trim();
          if (recommendation) {
            return res.json({ recommendation, source: "ai" });
          }
        } else {
          console.error("NVIDIA NIM error:", response.status, await response.text().catch(() => ""));
        }
      } catch (e) {
        console.error("AI fetch error:", e);
        // Fall through to rule-based
      }
    }

    // Rule-based fallback
    let suggestion = "Store produce in cool, dry conditions.";
    if (temperature > 35) suggestion = `⚠️ Critical: ${cropType || "Produce"} will spoil within 24 hours at ${temperature}°C. Book cold storage immediately.`;
    else if (temperature > 28) suggestion = `${cropType || "Produce"} (${quantity || "your"} kg) should be refrigerated within 48 hours. Cold storage at ₹0.45–0.55/kg/day is optimal.`;
    else if (humidity > 70) suggestion = `High humidity (${humidity}%) is risky for grain storage. Ensure airtight cold units.`;

    res.json({ recommendation: suggestion });
  });

  // ─── INSIGHTS ─────────────────────────────────────────────────────────────────
  app.get("/api/insights", async (req, res) => {
    try {
      const dbInsights = await db.select().from(insights).orderBy(desc(insights.timestamp));

      const dynamicInsights: any[] = [
        ...dbInsights,
        {
          id: "dyn_w1",
          type: "weather",
          title: "Extreme Heat Alert",
          message: "High temperature expected — storing produce recommended.",
          severity: "danger",
          icon: "sun",
          timestamp: new Date()
        },
        {
          id: "dyn_m1",
          type: "market",
          title: "Tomato Prices Rising",
          message: "Tomato wholesale price up 18% this week. Cold storage can help hold supply.",
          severity: "info",
          icon: "trending-up",
          timestamp: new Date()
        }
      ];

      res.json(dynamicInsights);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch insights." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
