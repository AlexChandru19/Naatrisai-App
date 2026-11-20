import { NextResponse } from "next/server";
import { status } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await status(), { headers: { "Cache-Control": "public, s-maxage=120" } });
}
