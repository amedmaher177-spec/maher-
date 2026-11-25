import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}

export function handle(fn: (req: Request, ctx: any) => Promise<Response>) {
  return async (req: Request, ctx: any) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        return NextResponse.json(
          {
            error: e.issues[0]?.message ?? "Validation failed.",
            details: e.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
          },
          { status: 400 }
        );
      }
      console.error(e);
      return NextResponse.json({ error: "Something went wrong on the server. Please try again." }, { status: 500 });
    }
  };
}
