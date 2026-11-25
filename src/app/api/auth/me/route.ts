import { handle, ok } from "@/lib/errors";
import { requireUser } from "@/lib/guards";

export const GET = handle(async () => ok({ user: await requireUser() }));
