import { sql } from "@/lib/db";
import { handle, ok, readJson, ApiError } from "@/lib/errors";
import { claimStatusSchema, idSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/guards";

export const PATCH = handle(async (req, ctx) => {
  const admin = await requireAdmin();
  const id = idSchema.parse((await ctx.params).id);
  const { status } = claimStatusSchema.parse(await readJson(req));

  const claim = await sql.begin(async (tx) => {
    const [c] = await tx`
      update claims set status = ${status}, reviewed_by = ${admin.id}, reviewed_at = now()
      where id = ${id} returning id, item_id, status, reviewed_at`;
    if (!c) return null;
    if (status === "approved") await tx`update items set status = 'matched' where id = ${c.item_id}`;
    if (status === "recovered") await tx`update items set status = 'recovered' where id = ${c.item_id}`;
    return c;
  });

  if (!claim) throw new ApiError(404, "Claim not found.");
  return ok({ claim });
});
