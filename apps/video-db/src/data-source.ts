import { DataSource, DataSourceOptions } from "typeorm";
import { AlignmentResult } from "./entity/AlignmentResult.js";
import { Segment } from "./entity/Segment.js";
import { Word } from "./entity/Word.js";
import { GrammarExplanation } from "./entity/GrammarExplanation.js";
import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Default to SQLite for development if DATABASE_URL is not provided
const dbUrl = process.env.DATABASE_URL

// Create separate configurations for PostgreSQL and SQLite
const postgresConfig: DataSourceOptions = {
  type: "postgres",
  url: dbUrl,
  synchronize: true,
  logging: false,
  entities: [AlignmentResult, Segment, Word, GrammarExplanation],
  migrations: [],
  subscribers: [],
};


// Choose the appropriate configuration based on the database URL
export const AppDataSource = new DataSource(
  postgresConfig
);

// Initialize connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established");
    return AppDataSource;
  } catch (error) {
    console.error("Error during database initialization", error);
    throw error;
  }
};
