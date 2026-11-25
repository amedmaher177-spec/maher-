import { sql, itemCols } from "@/lib/db";
import { handle, ok } from "@/lib/errors";
import { requireUser } from "@/lib/guards";

export const GET = handle(async () => {
  const user = await requireUser();
  const items = await sql`select ${itemCols} from items where user_id = ${user.id} order by created_at desc`;
  return ok({ items });
});
