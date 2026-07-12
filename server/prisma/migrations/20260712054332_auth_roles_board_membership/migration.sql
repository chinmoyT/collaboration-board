-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'END_USER');

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_organizationId_fkey";

-- DropIndex
DROP INDEX "Board_organizationId_idx";

-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'END_USER';

-- DropTable
DROP TABLE "Organization";

-- CreateTable
CREATE TABLE "BoardMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,

    CONSTRAINT "BoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardMember_boardId_idx" ON "BoardMember"("boardId");

-- CreateIndex
CREATE INDEX "BoardMember_userId_idx" ON "BoardMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_userId_boardId_key" ON "BoardMember"("userId", "boardId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
