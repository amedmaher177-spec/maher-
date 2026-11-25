import { sql, itemCols } from "@/lib/db";
import { handle, ok, ApiError } from "@/lib/errors";
import { idSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/guards";

export const GET = handle(async (_req, ctx) => {
  const id = idSchema.parse((await ctx.params).id);
  const [item] = await sql`select ${itemCols} from items where id = ${id}`;
  if (!item) throw new ApiError(404, "Report not found.");
  return ok({ item });
});

export const DELETE = handle(async (_req, ctx) => {
  const user = await requireUser();
  const id = idSchema.parse((await ctx.params).id);
  const [item] = await sql`select user_id from items where id = ${id}`;
  if (!item) throw new ApiError(404, "Report not found.");
  if (item.user_id !== user.id && user.role !== "admin") throw new ApiError(403, "You can only delete your own reports.");
  await sql`delete from items where id = ${id}`;
  return ok({ message: "Report deleted." });
});
