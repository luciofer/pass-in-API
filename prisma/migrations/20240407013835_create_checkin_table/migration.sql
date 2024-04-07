-- CreateTable
CREATE TABLE "check_in" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendee_id" INTEGER NOT NULL,

    CONSTRAINT "check_in_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "check_in_attendee_id_key" ON "check_in"("attendee_id");

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
