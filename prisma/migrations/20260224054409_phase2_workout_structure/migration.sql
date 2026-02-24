-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "demo_video_url" TEXT,
    "source" TEXT NOT NULL DEFAULT 'library',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSection" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'freestyle',
    "name" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "duration_seconds" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "exercise_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "reps" TEXT,
    "rep_range" TEXT,
    "weight" TEXT,
    "duration_seconds" INTEGER,
    "notes" TEXT,
    "set_type" TEXT NOT NULL DEFAULT 'normal',
    "custom_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'freestyle',
    "default_duration" INTEGER,
    "default_reps" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutSection" ADD CONSTRAINT "WorkoutSection_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "WorkoutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
