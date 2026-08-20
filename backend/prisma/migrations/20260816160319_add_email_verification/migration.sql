/*
  Warnings:

  - You are about to drop the `OAuthAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OAuthAccount" DROP CONSTRAINT "OAuthAccount_userId_fkey";

-- DropTable
DROP TABLE "OAuthAccount";
