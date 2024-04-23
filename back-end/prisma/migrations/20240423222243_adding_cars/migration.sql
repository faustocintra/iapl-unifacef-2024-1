-- CreateTable
CREATE TABLE "Cars" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "ownwe_name" TEXT NOT NULL,
    "imported" BOOLEAN NOT NULL,
    "plate" TEXT NOT NULL,

    CONSTRAINT "Cars_pkey" PRIMARY KEY ("id")
);
