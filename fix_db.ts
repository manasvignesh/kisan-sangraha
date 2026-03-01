import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function fix() {
    console.log("Running DB fixes...");
    try {
        await db.execute(sql`ALTER TABLE facilities ADD COLUMN IF NOT EXISTS image_url text;`);
        console.log("✓ Added image_url to facilities");

        await db.execute(sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS storage_category text DEFAULT 'Fruits & Vegetables';`);
        console.log("✓ Added storage_category to bookings");

        await db.execute(sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS storage_type text;`);
        console.log("✓ Added storage_type to bookings");

        console.log("DB fix completed successfully!");
    } catch (err) {
        console.error("DB fix failed:", err);
    } finally {
        process.exit(0);
    }
}

fix();
