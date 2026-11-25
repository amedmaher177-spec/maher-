import { sql } from "@/lib/db";
import { handle, ok } from "@/lib/errors";
import { requireUser } from "@/lib/guards";

export const GET = handle(async () => {
  const user = await requireUser();
  const claims = await sql`
    select c.id, c.status, c.proof_description, c.created_at,
           i.id as item_id, i.title as item_title, i.location as item_location
    from claims c join items i on i.id = c.item_id
    where c.user_id = ${user.id}
    order by c.created_at desc`;
  return ok({ claims });
});
