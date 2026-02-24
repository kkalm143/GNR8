-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('assigned', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_assignments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'assigned',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_assignments_user_id_program_id_key" ON "program_assignments"("user_id", "program_id");

-- AddForeignKey
ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
