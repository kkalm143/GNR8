-- CreateTable
CREATE TABLE "progress_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "program_assignment_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_program_assignment_id_fkey" FOREIGN KEY ("program_assignment_id") REFERENCES "program_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
