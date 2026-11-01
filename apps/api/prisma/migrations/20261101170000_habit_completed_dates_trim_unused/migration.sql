-- Habit completion source of truth: completedDates (YYYY-MM-DD)
-- HabitLog becomes journal-only (completedAt → createdAt)
-- Drop unused Activity / Notification / Draft tables

-- AlterTable Habit: add completedDates, drop bestStreak
ALTER TABLE "Habit" ADD COLUMN "completedDates" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill completedDates from existing HabitLog calendar days (UTC)
UPDATE "Habit" AS h
SET "completedDates" = COALESCE(sub.dates, ARRAY[]::TEXT[])
FROM (
  SELECT
    "habitId",
    array_agg(day ORDER BY day) AS dates
  FROM (
    SELECT DISTINCT
      "habitId",
      to_char(("completedAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day
    FROM "HabitLog"
  ) AS distinct_days
  GROUP BY "habitId"
) AS sub
WHERE h."id" = sub."habitId";

ALTER TABLE "Habit" DROP COLUMN "bestStreak";

-- AlterTable HabitLog: rename completedAt → createdAt (journal timestamp)
ALTER TABLE "HabitLog" RENAME COLUMN "completedAt" TO "createdAt";

CREATE INDEX "HabitLog_habitId_createdAt_idx" ON "HabitLog"("habitId", "createdAt");

-- Drop unused models
DROP TABLE IF EXISTS "Activity";
DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "Draft";
DROP TABLE IF EXISTS "Test";

DROP TYPE IF EXISTS "NotificationStatus";
