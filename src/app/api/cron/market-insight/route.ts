
import { NextRequest, NextResponse } from "next/server";
import { generateMarketInsight } from "@/lib/gemini";
export const dynamic = 'force-dynamic';

import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  // Authorization Check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 1. Check if an insight already exists for today (unless forced)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const isForced = req.nextUrl.searchParams.get("force") === "true";

    if (!isForced) {
      const existingInsight = await prisma.marketInsight.findFirst({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      if (existingInsight) {
        return NextResponse.json({ message: "Insight already exists for today" }, { status: 200 });
      }
    }

    // 2. Generate new insight
    const { english, korean } = await generateMarketInsight();

    // 3. Save to database
    const newInsight = await prisma.marketInsight.create({
      data: {

        contentEn: english,
        contentKo: korean,
      },
    });

    return NextResponse.json({ message: "Market insight generated successfully", data: newInsight });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
