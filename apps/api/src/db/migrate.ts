import { pool } from "./pool.js";
import { migrations } from "./migrations.js";

const runMigrations = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const migration of migrations) {
    const existing = await pool.query<{ id: string }>(
      "SELECT id FROM schema_migrations WHERE id = $1",
      [migration.id]
    );

    if (existing.rows.length > 0) {
      console.log(`Skipping migration ${migration.id}`);
      continue;
    }

    console.log(`Applying migration ${migration.id}`);
    await pool.query("BEGIN");
    try {
      await pool.query(migration.sql);
      await pool.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migration.id]);
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
};

runMigrations()
  .then(async () => {
    console.log("Database migrations completed");
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Database migration failed", error);
    await pool.end();
    process.exit(1);
  });
