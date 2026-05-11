declare module "pg" {
  export interface QueryResult<Row = Record<string, unknown>> {
    rows: Row[];
    rowCount: number | null;
  }

  export interface QueryConfig {
    text: string;
    values?: unknown[];
  }

  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<Row = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<Row>>;
    query<Row = Record<string, unknown>>(config: QueryConfig): Promise<QueryResult<Row>>;
    end(): Promise<void>;
  }

  const pg: {
    Pool: typeof Pool;
  };

  export default pg;
}
