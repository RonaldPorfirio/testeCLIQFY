-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'agent', 'viewer');

-- CreateEnum
CREATE TYPE "WorkorderStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "WorkorderPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('created', 'status_change', 'assigned', 'comment');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workorder" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "WorkorderStatus" NOT NULL DEFAULT 'pending',
    "priority" "WorkorderPriority" NOT NULL DEFAULT 'medium',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Workorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER,
    "userName" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" SERIAL NOT NULL,
    "workorderId" INTEGER NOT NULL,
    "userId" INTEGER,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photo" TEXT,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TimelineEvent_orderId_idx" ON "TimelineEvent"("orderId");

-- CreateIndex
CREATE INDEX "Checkin_workorderId_idx" ON "Checkin"("workorderId");

-- CreateIndex
CREATE INDEX "Checkin_userId_idx" ON "Checkin"("userId");

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Workorder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_workorderId_fkey" FOREIGN KEY ("workorderId") REFERENCES "Workorder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
