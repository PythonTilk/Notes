-- CreateTable
CREATE TABLE "NoteShare" (
    "noteId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "NoteShare_pkey" PRIMARY KEY ("noteId","userId")
);

-- AddForeignKey
ALTER TABLE "NoteShare" ADD CONSTRAINT "NoteShare_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteShare" ADD CONSTRAINT "NoteShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
