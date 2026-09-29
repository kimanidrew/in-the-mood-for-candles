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

INSERT INTO "Mood" ("id","slug","name","sortOrder","isActive","createdAt","updatedAt")
VALUES
  ('mood_relaxing','relaxing','Relaxing',0,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_romantic','romantic','Romantic',1,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_cosy','cosy','Cosy',2,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_playful','playful','Playful',3,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_tropical','tropical','Tropical',4,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_energising','energising','Energising',5,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_festive','festive','Festive',6,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('mood_dreamy','dreamy','Dreamy',7,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

UPDATE "Product" SET "moodId" = 'mood_relaxing' WHERE LOWER("mood") = 'relaxing';
UPDATE "Product" SET "moodId" = 'mood_romantic' WHERE LOWER("mood") = 'romantic';
UPDATE "Product" SET "moodId" = 'mood_cosy' WHERE LOWER("mood") = 'cosy';
UPDATE "Product" SET "moodId" = 'mood_playful' WHERE LOWER("mood") = 'playful';
UPDATE "Product" SET "moodId" = 'mood_tropical' WHERE LOWER("mood") = 'tropical';
UPDATE "Product" SET "moodId" = 'mood_energising' WHERE LOWER("mood") = 'energising';
UPDATE "Product" SET "moodId" = 'mood_festive' WHERE LOWER("mood") = 'festive';
UPDATE "Product" SET "moodId" = 'mood_dreamy' WHERE LOWER("mood") = 'dreamy';
