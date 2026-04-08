import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { RejectedBook, RejectedBookWithDate } from "@/types";

const MAX_HISTORY = 50;

export async function getUserPreferences(userId: string): Promise<RejectedBookWithDate[]> {
  const record = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  if (!record) return [];
  return JSON.parse(record.rejectionHistory) as RejectedBookWithDate[];
}

export async function appendRejection(
  userId: string,
  rejected: RejectedBook
): Promise<void> {
  const incoming: RejectedBookWithDate = {
    ...rejected,
    rejectedAt: new Date().toISOString(),
  };

  const existing = await getUserPreferences(userId);
  const updated = mergeRejection(existing, incoming, MAX_HISTORY);
  const json = JSON.stringify(updated);

  await db
    .insert(userPreferences)
    .values({ userId, rejectionHistory: json, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { rejectionHistory: json, updatedAt: new Date() },
    });
}

export function mergeRejection(
  existing: RejectedBookWithDate[],
  incoming: RejectedBookWithDate,
  maxHistory: number
): RejectedBookWithDate[] {
  const updated = [...existing, incoming];
  return updated.slice(-maxHistory);
}
