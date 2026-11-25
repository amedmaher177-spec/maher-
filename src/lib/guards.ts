import { cookies } from "next/headers";
import { sql } from "./db";
import { COOKIE, readToken } from "./auth";
import { ApiError } from "./errors";

export type CurrentUser = { id: string; role: "student" | "staff" | "admin"; full_name: string; email: string };

export async function requireUser(): Promise<CurrentUser> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) throw new ApiError(401, "Please log in to continue.");
  const session = await readToken(token);
  if (!session) throw new ApiError(401, "Your session has expired. Please log in again.");
  const [user] = await sql<CurrentUser[]>`select id, role, full_name, email from users where id = ${session.sub}`;
  if (!user) throw new ApiError(401, "Account not found. Please log in again.");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new ApiError(403, "Administrator access required.");
  return user;
}
