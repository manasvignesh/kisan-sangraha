require('dotenv').config();
const { Pool } = require('pg');

async function fix() {
    console.log("Running DB fixes (native)...");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("Connected to DB");

        await client.query('ALTER TABLE facilities ADD COLUMN IF NOT EXISTS image_url text;');
        console.log("✓ Added image_url to facilities");

        await client.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS storage_category text DEFAULT 'Fruits & Vegetables';");
        console.log("✓ Added storage_category to bookings");

        await client.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS storage_type text;");
        console.log("✓ Added storage_type to bookings");

        client.release();
        console.log("DB fix completed successfully!");
    } catch (err) {
        console.error("DB fix failed:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fix();
