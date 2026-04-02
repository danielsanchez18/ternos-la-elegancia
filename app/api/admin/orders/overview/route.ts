import { NextResponse } from "next/server";
import { getAdminOrdersOverviewData } from "@/lib/admin-orders";

export async function GET() {
  try {
    const data = await getAdminOrdersOverviewData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in /api/admin/orders/overview:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
