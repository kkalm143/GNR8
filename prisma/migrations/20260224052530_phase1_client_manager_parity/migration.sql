-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "consultation_file_url" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "archived_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClientSettings" (
    "id" TEXT NOT NULL,
    "client_profile_id" TEXT NOT NULL,
    "workout_comments" BOOLEAN NOT NULL DEFAULT true,
    "workout_visibility" BOOLEAN NOT NULL DEFAULT true,
    "allow_rearrange" BOOLEAN NOT NULL DEFAULT false,
    "replace_exercise" BOOLEAN NOT NULL DEFAULT false,
    "allow_create_workouts" BOOLEAN NOT NULL DEFAULT false,
    "pinned_metrics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_client_groups" (
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_client_groups_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSettings_client_profile_id_key" ON "ClientSettings"("client_profile_id");

-- AddForeignKey
ALTER TABLE "ClientSettings" ADD CONSTRAINT "ClientSettings_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_client_groups" ADD CONSTRAINT "user_client_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_client_groups" ADD CONSTRAINT "user_client_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ClientGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
