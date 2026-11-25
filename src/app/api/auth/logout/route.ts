import { handle, ok } from "@/lib/errors";
import { clearAuthCookie } from "@/lib/auth";

export const POST = handle(async () => {
  await clearAuthCookie();
  return ok({ message: "Logged out." });
});
