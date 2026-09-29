CREATE TABLE "Mood" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Mood_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Mood_slug_key" ON "Mood"("slug");
CREATE UNIQUE INDEX "Mood_name_key" ON "Mood"("name");
ALTER TABLE "Product" ADD COLUMN "moodId" TEXT;
CREATE INDEX "Product_moodId_idx" ON "Product"("moodId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "Mood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
