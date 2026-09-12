import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const valid = await verifyAdminPassword(username, password);
  if (!valid) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  await createSession(username);
  return NextResponse.json({ ok: true });
}
