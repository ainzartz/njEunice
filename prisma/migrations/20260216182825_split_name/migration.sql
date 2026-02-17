-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstNameEncrypted" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastNameEncrypted" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "nameEncrypted" DROP NOT NULL;
