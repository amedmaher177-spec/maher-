import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set in your environment variables.");

const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };

// prepare:false is required for Supabase's transaction pooler.
export const sql = g.__sql ?? postgres(url, { prepare: false, max: 1, ssl: "require" });
if (process.env.NODE_ENV !== "production") g.__sql = sql;

export const itemCols = sql`id, title, category, description, report_type, location,
  to_char(item_date, 'YYYY-MM-DD') as item_date, image_url, status, created_at`;
