import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { checkFeed } from "@/lib/scraper/check-feed";

export const maxDuration = 60;

const bodySchema = z.object({ url: z.string().min(3) });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
  }

  const result = await checkFeed(parsed.data.url);
  return NextResponse.json(result);
}
