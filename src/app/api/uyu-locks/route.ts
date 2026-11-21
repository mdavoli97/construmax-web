import { NextResponse } from "next/server";
import { getUyuLockedGroupIds } from "@/lib/uyu-lock";

export async function GET() {
  const groupIds = await getUyuLockedGroupIds();
  return NextResponse.json(
    { groupIds },
    { headers: { "Cache-Control": "no-store" } }
  );
}
