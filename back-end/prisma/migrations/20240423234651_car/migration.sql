-- CreateTable
CREATE TABLE "Cars" (
    "id" SERIAL NOT NULL,
    "Brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "Owner" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "importado" BOOLEAN NOT NULL DEFAULT false,
    "placas" TEXT NOT NULL,

    CONSTRAINT "Cars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cars_placas_key" ON "Cars"("placas");
