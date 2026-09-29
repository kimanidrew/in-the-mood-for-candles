-- Create user favourites for candles and moods
CREATE TABLE "_FavoriteProducts" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_FavoriteProducts_pkey" PRIMARY KEY ("A","B"),
  CONSTRAINT "_FavoriteProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_FavoriteProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "_FavoriteProducts_B_index" ON "_FavoriteProducts"("B");

CREATE TABLE "_FavoriteMoods" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_FavoriteMoods_pkey" PRIMARY KEY ("A","B"),
  CONSTRAINT "_FavoriteMoods_A_fkey" FOREIGN KEY ("A") REFERENCES "Mood"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_FavoriteMoods_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "_FavoriteMoods_B_index" ON "_FavoriteMoods"("B");
