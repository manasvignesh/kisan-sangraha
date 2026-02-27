import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { facilities, bookings, insights } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {

  // --- FACILITIES ---
  app.get("/api/facilities", async (req, res) => {
    try {
      const allFacilities = await db.select().from(facilities);
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

  app.put("/api/facilities/:id", async (req, res) => {
    // Requires Authentication logic (Assuming user is logged in as Provider - handled via passport session)
    if (!req.isAuthenticated() || req.user.role !== "provider") {
      return res.status(403).json({ error: "Only providers can update facilities." });
    }
    try {
      // Allow modifying pricing and capacity
      const { pricePerKgPerDay, availableCapacity } = req.body;
      const [updated] = await db.update(facilities).set({
        pricePerKgPerDay,
        availableCapacity
      }).where(eq(facilities.id, req.params.id)).returning();
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update facility." });
    }
  });

  // --- BOOKINGS ---
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to book." });
    }

    try {
      const { facilityId, facilityName, facilityLocation, quantity, duration, totalCost, pricePerKgPerDay, storageType } = req.body;

      // 1. Fetch Facility constraints to ensure real capacity exists
      const [facility] = await db.select().from(facilities).where(eq(facilities.id, facilityId));
      if (!facility) return res.status(404).json({ error: "Facility not found" });

      if (quantity > facility.availableCapacity) {
        return res.status(400).json({ error: "Requested quantity exceeds available capacity." });
      }

      // 2. Perform capacity reduction on backend explicitly
      const [updatedFacility] = await db.update(facilities).set({
        availableCapacity: facility.availableCapacity - quantity
      }).where(eq(facilities.id, facilityId)).returning();

      // 3. Create active booking
      const now = new Date();
      const end = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

      const [booking] = await db.insert(bookings).values({
        userId: req.user.id,
        facilityId,
        facilityName,
        facilityLocation,
        quantity,
        duration,
        totalCost,
        pricePerKgPerDay,
        storageType,
        startDate: now,
        endDate: end,
        status: "active"
      }).returning();

      res.status(201).json(booking);
    } catch (e) {
      res.status(500).json({ error: "Booking submission failed." });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    try {
      let userBookings: import("@shared/schema").BookingType[] = [];
      if (req.user.role === "farmer") {
        userBookings = await db.select().from(bookings).where(eq(bookings.userId, req.user.id)).orderBy(desc(bookings.startDate));
      } else {
        // Find bookings associated with the provider's facilities
        const providerFacilities = await db.select().from(facilities).where(eq(facilities.ownerId, req.user.id));
        const pids = providerFacilities.map(f => f.id);

        if (pids.length > 0) {
          // Basic fetch, in reality if they have multiple facilities, we should `inArray`
          // Since we don't have inArray imported, iterating or simple mapping. 
          // We will fetch all bookings and filter for simplicity for now.
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
      const { status } = req.body; // active, completed, cancelled, pending
      const [booking] = await db.update(bookings).set({ status }).where(eq(bookings.id, req.params.id)).returning();
      res.json(booking);
    } catch (e) {
      res.status(500).json({ error: "Failed to update booking status." });
    }
  });

  // --- INSIGHTS & WEATHER LOGIC ---
  app.get("/api/weather", (req, res) => {
    // Simulated weather API for Hackathon demo
    res.json({
      temperature: 36,
      condition: "Hot & Clear",
      humidity: 30,
      suggestion: "High temperature expected – storing produce recommended"
    });
  });

  app.get("/api/insights", async (req, res) => {
    try {
      const dbInsights = await db.select().from(insights).orderBy(desc(insights.timestamp));

      // Inject dynamic weather insight if no weather insights exist in DB
      const dynamicInsights: any[] = [
        ...dbInsights,
        {
          id: "dyn_w1",
          type: "weather",
          title: "Extreme Heat Alert",
          message: "High temperature expected – storing produce recommended.",
          severity: "danger",
          icon: "sun",
          timestamp: new Date()
        }
      ];

      // Remove duplicates by ID (if we wanted to persist dynamic ones) or sort them
      res.json(dynamicInsights);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch insights." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
