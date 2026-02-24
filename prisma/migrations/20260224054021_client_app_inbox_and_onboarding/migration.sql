-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "onboarding_completed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
