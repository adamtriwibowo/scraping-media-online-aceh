import { NextRequest, NextResponse } from "next/server";
import { runScrapeJob } from "@/lib/scraper/run";
import { getSession } from "@/lib/auth";

export const maxDuration = 300;

// Triggered by Vercel Cron on a schedule (see vercel.json).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runScrapeJob("cron");
  return NextResponse.json(result);
}

// Triggered manually from the admin panel ("Update Data from Website").
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runScrapeJob("manual");
  return NextResponse.json(result);
}
