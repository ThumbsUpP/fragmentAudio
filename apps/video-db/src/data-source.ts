import { DataSource, DataSourceOptions } from "typeorm";
import { VideoData } from "./entity/VideoData";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Default to SQLite for development if DATABASE_URL is not provided
const dbUrl = process.env.DATABASE_URL || "sqlite";

// Create separate configurations for PostgreSQL and SQLite
const postgresConfig: DataSourceOptions = {
  type: "postgres",
  url: dbUrl,
  synchronize: true,
  logging: false,
  entities: [VideoData],
  migrations: [],
  subscribers: [],
};

const sqliteConfig: DataSourceOptions = {
  type: "sqlite",
  database: "./data/database.sqlite",
  synchronize: true,
  logging: false,
  entities: [VideoData],
  migrations: [],
  subscribers: [],
};

// Choose the appropriate configuration based on the database URL
export const AppDataSource = new DataSource(
  dbUrl.startsWith("postgres") ? postgresConfig : sqliteConfig
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
