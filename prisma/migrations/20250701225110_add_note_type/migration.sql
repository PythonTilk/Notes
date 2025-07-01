-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('TEXT', 'RICH_TEXT', 'CODE');

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "type" "NoteType" NOT NULL DEFAULT 'TEXT';
