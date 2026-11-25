import { sql } from "@/lib/db";
import { handle, ok, readJson, ApiError } from "@/lib/errors";
import { registerSchema } from "@/lib/schemas";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";

export const POST = handle(async (req) => {
  const body = registerSchema.parse(await readJson(req));
  const hash = await hashPassword(body.password);
  try {
    const [user] = await sql`
      insert into users (full_name, email, password_hash, role)
      values (${body.full_name}, ${body.email}, ${hash}, 'student')
      returning id, full_name, email, role, created_at`;
    await setAuthCookie(await createToken(user.id));
    return ok({ user }, 201);
  } catch (e: any) {
    if (e.code === "23505") throw new ApiError(409, "An account with this email already exists.");
    throw e;
  }
});
