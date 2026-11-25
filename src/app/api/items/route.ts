import { sql, itemCols } from "@/lib/db";
import { handle, ok, readJson } from "@/lib/errors";
import { feedQuery, itemSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/guards";
import { findAndSaveMatches } from "@/lib/matching";

// GET /api/items?q=wallet&type=found&category=Keys&page=1  (public)
export const GET = handle(async (req) => {
  const raw = Object.fromEntries([...new URL(req.url).searchParams].filter(([, v]) => v && v !== "all"));
  const { q, type, category, page, limit } = feedQuery.parse(raw);
  const like = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null;

  const items = await sql`
    select ${itemCols} from items
    where status = 'active'
    ${type ? sql`and report_type = ${type}` : sql``}
    ${category ? sql`and category = ${category}` : sql``}
    ${like ? sql`and (title ilike ${like} or location ilike ${like} or description ilike ${like})` : sql``}
    order by created_at desc
    limit ${limit} offset ${(page - 1) * limit}`;
  return ok({ items, page, limit });
});

// POST /api/items  (logged in)
export const POST = handle(async (req) => {
  const user = await requireUser();
  const d = itemSchema.parse(await readJson(req));

  const [item] = await sql`
    insert into items (user_id, title, category, description, report_type, location, item_date, image_url, status)
    values (${user.id}, ${d.title}, ${d.category}, ${d.description}, ${d.report_type}, ${d.location}, ${d.item_date}, ${d.image_url}, 'active')
    returning ${itemCols}`;

  let matches: unknown[] = [];
  try {
    matches = await findAndSaveMatches(item as any);
  } catch (e) {
    console.error("matching failed", e);
  }
  return ok({ item, matches }, 201);
});
