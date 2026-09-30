# In The Mood For — Next.js storefront

Original premium candle storefront for @inthemoodfor_candles with Framer Motion, responsive navigation, product filters, shopping bag and WhatsApp ordering.

## Run
npm install
npm run dev

Copy .env.example to .env.local and set NEXT_PUBLIC_WHATSAPP_NUMBER to the business number in international format without +.

Product content and imagery are intentionally easy to replace in src/app/page.tsx.

## Cloudflare R2 image uploads

Admin image uploads are sent to Cloudflare R2 and the returned public URL is saved in the database. Add the R2 variables from `.env.example` to your local `.env.local` and your Vercel project environment variables.

`R2_PUBLIC_URL` should be the public R2 URL or a custom domain attached to the bucket, for example `https://pub-xxxxxxxx.r2.dev` or `https://cdn.example.com`.

The R2 bucket must be configured for public reads (or the public URL must point to a custom domain that can read the bucket). The R2 access key only needs permission to write objects to this bucket.
