-- CreateEnum
CREATE TYPE "CalendarTone" AS ENUM ('teal', 'violet', 'sky', 'amber', 'rose');

-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tone" "CalendarTone" NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "days" INTEGER,
    "location" TEXT,
    "video" BOOLEAN NOT NULL DEFAULT false,
    "people" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Calendar_userId_idx" ON "Calendar"("userId");

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_idx" ON "CalendarEvent"("userId");

-- CreateIndex
CREATE INDEX "CalendarEvent_calendarId_idx" ON "CalendarEvent"("calendarId");

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_date_idx" ON "CalendarEvent"("userId", "date");

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
