import { sql, itemCols } from "@/lib/db";
import { handle, ok } from "@/lib/errors";
import { requireAdmin } from "@/lib/guards";

export const GET = handle(async () => {
  await requireAdmin();
  const [items, claims, matches] = await Promise.all([
    sql`select ${itemCols} from items order by created_at desc`,
    sql`select c.id, c.status, c.proof_description, c.created_at,
               u.full_name as student_name, u.email as student_email,
               i.id as item_id, i.title as item_title
        from claims c join users u on u.id = c.user_id join items i on i.id = c.item_id
        order by c.created_at desc`,
    sql`select m.id, m.status, m.confidence_score::float8 as confidence, m.created_at,
               l.title as lost_title, f.title as found_title
        from ai_matches m join items l on l.id = m.lost_item_id join items f on f.id = m.found_item_id
        order by m.confidence_score desc limit 100`,
  ]);
  const stats = {
    total_reports: items.length,
    pending_claims: claims.filter((c) => c.status === "pending").length,
    approved_or_recovered: claims.filter((c) => c.status === "approved" || c.status === "recovered").length,
  };
  return ok({ stats, items, claims, matches });
});
