import { sql } from "@/lib/db";
import { handle, ok, readJson, ApiError } from "@/lib/errors";
import { claimSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/guards";

export const POST = handle(async (req) => {
  const user = await requireUser();
  const { item_id, proof_description } = claimSchema.parse(await readJson(req));

  const [item] = await sql`select user_id, report_type, status from items where id = ${item_id}`;
  if (!item) throw new ApiError(404, "That item no longer exists.");
  if (item.report_type !== "found") throw new ApiError(400, "Only found items can be claimed.");
  if (item.status !== "active") throw new ApiError(409, "This item is no longer available to claim.");
  if (item.user_id === user.id) throw new ApiError(403, "You cannot claim your own report.");

  const [existing] = await sql`
    select 1 from claims where item_id = ${item_id} and user_id = ${user.id} and status in ('pending', 'approved')`;
  if (existing) throw new ApiError(409, "You already have an open claim on this item.");

  const [claim] = await sql`
    insert into claims (item_id, user_id, proof_description)
    values (${item_id}, ${user.id}, ${proof_description})
    returning id, item_id, status, created_at`;
  return ok({ claim }, 201);
});
