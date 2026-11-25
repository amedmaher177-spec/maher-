import { sql } from "@/lib/db";
import { handle, ok, readJson } from "@/lib/errors";
import { profileSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/guards";

export const GET = handle(async () => ok({ profile: await requireUser() }));

export const PATCH = handle(async (req) => {
  const user = await requireUser();
  const { full_name } = profileSchema.parse(await readJson(req));
  const [profile] = await sql`
    update users set full_name = ${full_name} where id = ${user.id}
    returning id, full_name, email, role`;
  return ok({ profile });
});
