-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'CASH');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'CARD';
