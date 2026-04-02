import { NextResponse } from "next/server";
import { getAdminInventoryCombinedOverview } from "@/lib/admin-inventory";

export async function GET() {
  try {
    const data = await getAdminInventoryCombinedOverview();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in /api/catalog/inventory-overview:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
