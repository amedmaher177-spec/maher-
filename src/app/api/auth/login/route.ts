import { sql } from "@/lib/db";
import { handle, ok, readJson, ApiError } from "@/lib/errors";
import { loginSchema } from "@/lib/schemas";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";

export const POST = handle(async (req) => {
  const { email, password } = loginSchema.parse(await readJson(req));
  const [row] = await sql`
    select id, full_name, email, role, password_hash from users where lower(email) = ${email}`;
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    throw new ApiError(401, "Incorrect email or password.");
  }
  await setAuthCookie(await createToken(row.id));
  const { password_hash, ...user } = row;
  return ok({ user });
});
