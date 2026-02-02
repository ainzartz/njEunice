
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import prisma from "@/lib/db";

export async function GET() {
  try {
    const latestInsight = await prisma.marketInsight.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestInsight) {
      return NextResponse.json({ error: "No insights found" }, { status: 404 });
    }

    return NextResponse.json(latestInsight);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
