/*
  Warnings:

  - You are about to drop the column `regionCode` on the `ZipCode` table. All the data in the column will be lost.
  - You are about to drop the `RegionCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInterestRegion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cityId` to the `ZipCode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InterestType" AS ENUM ('BUY', 'SELL', 'LEASE', 'COMMERCIAL');

-- DropForeignKey
ALTER TABLE "UserInterestRegion" DROP CONSTRAINT "UserInterestRegion_regionCode_fkey";

-- DropForeignKey
ALTER TABLE "UserInterestRegion" DROP CONSTRAINT "UserInterestRegion_userId_fkey";

-- DropForeignKey
ALTER TABLE "ZipCode" DROP CONSTRAINT "ZipCode_regionCode_fkey";

-- AlterTable
ALTER TABLE "ZipCode" DROP COLUMN "regionCode",
ADD COLUMN     "cityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "interestType" "InterestType",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPrice" INTEGER,
ADD COLUMN     "minBaths" DOUBLE PRECISION,
ADD COLUMN     "minBeds" INTEGER,
ADD COLUMN     "minPrice" INTEGER,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "RegionCode";

-- DropTable
DROP TABLE "UserInterestRegion";

-- CreateTable
CREATE TABLE "County" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'NJ',
    "isTarget" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "County_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterestCity" (
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "UserInterestCity_pkey" PRIMARY KEY ("userId","cityId")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInbound" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "listingId" TEXT NOT NULL,
    "urls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "MlsMetadata" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlsMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_countyId_key" ON "City"("name", "countyId");

-- CreateIndex
CREATE INDEX "messages_userId_idx" ON "messages"("userId");

-- CreateIndex
CREATE INDEX "verification_codes_email_idx" ON "verification_codes"("email");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZipCode" ADD CONSTRAINT "ZipCode_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestCity" ADD CONSTRAINT "UserInterestCity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestCity" ADD CONSTRAINT "UserInterestCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
