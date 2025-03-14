/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROJECT_INVITATION', 'RISK_ASSESSMENT', 'DOCUMENT_SHARED', 'WORKER_EDUCATION', 'SYSTEM', 'COMMENT', 'MENTION');

-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
