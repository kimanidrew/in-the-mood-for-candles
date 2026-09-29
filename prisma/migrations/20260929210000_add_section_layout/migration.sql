-- Add selectable editorial layouts for homepage content.
CREATE TYPE "SectionLayout" AS ENUM (
  'AUTO',
  'CINEMATIC',
  'SPLIT_LEFT',
  'SPLIT_RIGHT',
  'STATEMENT',
  'COLLAGE',
  'FULL_BLEED',
  'PRODUCT_SHOWCASE',
  'QUOTE',
  'FLOATING_CARD',
  'MINIMAL'
);

ALTER TABLE "SiteContent"
ADD COLUMN "layout" "SectionLayout" NOT NULL DEFAULT 'AUTO';
