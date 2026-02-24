-- CreateEnum
CREATE TYPE "ProgressEntryType" AS ENUM ('note', 'workout_completed', 'body_metric', 'measurement', 'progress_photo');

-- AlterTable
ALTER TABLE "program_assignments" ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "progress_entries" ADD COLUMN     "logged_at" TIMESTAMP(3),
ADD COLUMN     "type" "ProgressEntryType" NOT NULL DEFAULT 'note',
ADD COLUMN     "value" DOUBLE PRECISION;
