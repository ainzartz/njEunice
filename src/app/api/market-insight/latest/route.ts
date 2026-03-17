
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import prisma from "@/lib/db";
import { ensureInternalRequest } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

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
