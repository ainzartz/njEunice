-- CreateTable
CREATE TABLE "MarketInsight" (
    "id" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentKo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nameEncrypted" TEXT NOT NULL,
    "phoneEncrypted" TEXT NOT NULL,
    "addressEncrypted" TEXT NOT NULL,
    "dobEncrypted" TEXT NOT NULL,
    "autoEmail" BOOLEAN NOT NULL DEFAULT false,
    "autoSms" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastPasswordChangeAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionCode" (
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "RegionCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ZipCode" (
    "code" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,

    CONSTRAINT "ZipCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "UserInterestRegion" (
    "userId" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,

    CONSTRAINT "UserInterestRegion_pkey" PRIMARY KEY ("userId","regionCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE INDEX "password_history_userId_idx" ON "password_history"("userId");

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZipCode" ADD CONSTRAINT "ZipCode_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "RegionCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestRegion" ADD CONSTRAINT "UserInterestRegion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestRegion" ADD CONSTRAINT "UserInterestRegion_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "RegionCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

