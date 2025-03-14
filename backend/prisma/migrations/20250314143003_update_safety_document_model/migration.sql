/*
  Warnings:

  - You are about to drop the column `fileSize` on the `SafetyDocument` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `SafetyDocument` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `SafetyDocument` table. All the data in the column will be lost.
  - Added the required column `filePath` to the `SafetyDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `SafetyDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MANUAL', 'SAFETY_PLAN', 'INSPECTION', 'CERTIFICATE', 'TRAINING', 'REGULATION', 'REPORT', 'TEMPLATE', 'OTHER');

-- DropForeignKey
ALTER TABLE "SafetyDocument" DROP CONSTRAINT "SafetyDocument_projectId_fkey";

-- AlterTable
ALTER TABLE "SafetyDocument" DROP COLUMN "fileSize",
DROP COLUMN "fileType",
DROP COLUMN "fileUrl",
ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validUntil" TIMESTAMP(3),
ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SafetyDocument" ADD CONSTRAINT "SafetyDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
