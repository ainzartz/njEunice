
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
    // 1. Check if an insight already exists for today (NY Time)
    const now = new Date();

    // Get current date string in NY (e.g. "2/2/2026")
    const nyDateString = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "numeric",
      day: "numeric"
    }).format(now);

    // We need to find the UTC timestamp that corresponds to 00:00:00 on that NY date.
    // Since we don't have date-fns-tz, we'll approximate and adjust.
    // Start with assumed midnight UTC, then shift by 5 hours (standard offset) and refine.
    const startOfNyDay = new Date(nyDateString);
    // note: new Date("M/D/YYYY") assumes local browser time (or server local). 
    // This is risky on Vercel (UTC). 
    // Instead, let's parse the parts and construct.

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(now);

    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;

    // Construct ISO string for midnight NY time assumed input for a robust parser... 
    // Easiest robust way without libs: 
    // Iterate from UTC midnight back 4/5 hours? 

    // Better strategy: Use the fact that string "YYYY-MM-DD" is parseable?
    // Let's use a reliable helper function approach inline.

    const getNyMidnightUtc = () => {
      const str = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const nyDate = new Date(str); // This gives us specific time components in Server Local Time that match NY time
      nyDate.setHours(0, 0, 0, 0); // 00:00:00 "Server Time" with NY values

      // Now we have a Date object where .getDate() etc match NY. 
      // But .getTime() is wrong because it used Server TZ (UTC).
      // We need to shift it.

      // Actually, there is a cleaner snippet:
      const date = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
      // Vercel server is UTC. 
      // new Date("2/2/2026") on UTC server -> 2026-02-02T00:00:00Z.
      // This IS 7pm prev day in NY. 
      // We want 2026-02-02T00:00:00 NY time -> 2026-02-02T05:00:00Z.

      // So if we take the UTC timestamp of "2026-02-02T00:00:00Z" and ADD 5 hours (or 4), we get NY midnight?
      // No, we add the offset.

      // Let's rely on string parsing that forces offset? No.

      // Use this reliable snippet for NY midnight:
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const [{ value: mo }, , { value: da }, , { value: ye }] = formatter.formatToParts(now);

      // Create an ISO string for NY midnight: "YYYY-MM-DDT00:00:00"
      // We don't know the offset (-05:00 or -04:00).
      // But we can create a date at UTC and add 5 hours, check if it matches?

      // Let's just hardcode 5 hours buffer? 
      // No, be precise.

      // Try this:
      const midnightCandidate = new Date(`${ye}-${mo}-${da}T05:00:00Z`); // Standard time midnight
      // Check if this time in NY is 00:00 or 01:00
      const hourInNy = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false
      }).format(midnightCandidate));

      if (hourInNy === 1) {
        // It's EDT (-4), so midnight was 1 hour earlier (04:00Z)
        midnightCandidate.setHours(4);
      }
      return midnightCandidate;
    };

    const startOfDay = getNyMidnightUtc();
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
