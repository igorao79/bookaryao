import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { RejectedBook, RejectedBookWithDate } from "@/types";

const MAX_HISTORY = 50;

function safeParseHistory(json: string): RejectedBookWithDate[] {
  try {
    return JSON.parse(json) as RejectedBookWithDate[];
  } catch {
    return [];
  }
}

export async function getUserPreferences(userId: string): Promise<RejectedBookWithDate[]> {
  try {
    const record = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
    if (!record) return [];
    return safeParseHistory(record.rejectionHistory);
  } catch {
    // Table may not exist yet (pending migration) — degrade gracefully
    return [];
  }
}

export async function appendRejection(
  userId: string,
  rejected: RejectedBook
): Promise<void> {
  try {
    const incoming: RejectedBookWithDate = {
      ...rejected,
      rejectedAt: new Date().toISOString(),
    };

    await db.transaction(async (tx) => {
      const record = await tx.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });
      const existing: RejectedBookWithDate[] = record
        ? safeParseHistory(record.rejectionHistory)
        : [];
      const updated = mergeRejection(existing, incoming, MAX_HISTORY);
      const json = JSON.stringify(updated);
      const now = new Date();

      await tx
        .insert(userPreferences)
        .values({ userId, rejectionHistory: json, updatedAt: now })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: { rejectionHistory: json, updatedAt: now },
        });
    });
  } catch {
    // Table may not exist yet — skip silently
  }
}

export function mergeRejection(
  existing: RejectedBookWithDate[],
  incoming: RejectedBookWithDate,
  maxHistory: number
): RejectedBookWithDate[] {
  const updated = [...existing, incoming];
  return updated.slice(-maxHistory);
}
