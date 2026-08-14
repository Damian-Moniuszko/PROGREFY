ALTER TABLE "User" ADD COLUMN "gender" TEXT;

CREATE TABLE "FavoriteTrainer" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "trainerId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FavoriteTrainer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FavoriteTrainer_userId_trainerId_key" ON "FavoriteTrainer"("userId", "trainerId");
CREATE INDEX "FavoriteTrainer_userId_idx" ON "FavoriteTrainer"("userId");
ALTER TABLE "FavoriteTrainer" ADD CONSTRAINT "FavoriteTrainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteTrainer" ADD CONSTRAINT "FavoriteTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
