import { NextResponse } from "next/server";
import { getUyuLockedIds } from "@/lib/uyu-lock";

export async function GET() {
  const ids = await getUyuLockedIds();
  return NextResponse.json(
    { ids },
    { headers: { "Cache-Control": "no-store" } }
  );
}
