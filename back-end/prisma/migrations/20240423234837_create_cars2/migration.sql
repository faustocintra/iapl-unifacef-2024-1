-- CreateTable
CREATE TABLE "Cars2" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "imported" BOOLEAN NOT NULL DEFAULT false,
    "plates" TEXT NOT NULL,

    CONSTRAINT "Cars2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cars2_plates_key" ON "Cars2"("plates");
