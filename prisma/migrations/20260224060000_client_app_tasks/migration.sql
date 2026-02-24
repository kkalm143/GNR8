-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "assigned_to_user_id" TEXT NOT NULL,
    "assigned_by_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
