
import { NextRequest, NextResponse } from "next/server";
import { generateMarketInsight } from "@/lib/gemini";


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
    // 1. Check if an insight already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingInsight = await prisma.marketInsight.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingInsight) {
      return NextResponse.json({ message: "Insight already exists for today", data: existingInsight });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
