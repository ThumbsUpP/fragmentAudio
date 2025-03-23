import { DataSource, DataSourceOptions } from "typeorm";
import { VideoData } from "./entity/VideoData.js";
import { TranslationData } from "./entity/TranslationData.js";
import { AlignmentResult, Segment, Word } from "./entity/AlignmentResult.js";
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

console.log({ dbUrl });

// Create separate configurations for PostgreSQL and SQLite
const postgresConfig: DataSourceOptions = {
  type: "postgres",
  url: dbUrl,
  synchronize: true,
  logging: false,
  entities: [VideoData, TranslationData, AlignmentResult, Segment, Word],
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
