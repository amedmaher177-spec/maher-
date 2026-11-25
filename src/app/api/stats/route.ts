import { sql } from "@/lib/db";
import { handle, ok } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const [s] = await sql`
    select count(*) filter (where status = 'active')::int as active,
           count(*) filter (where status = 'active' and report_type = 'found')::int as found,
           count(*) filter (where status = 'recovered')::int as recovered
    from items`;
  return ok({ stats: s });
});
