import { NextResponse } from "next/server";
import { getAdminCustomOrdersListData } from "@/lib/admin-orders";

export async function GET() {
  try {
    const data = await getAdminCustomOrdersListData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in /api/admin/orders/custom-list:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
