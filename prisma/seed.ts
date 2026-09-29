import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@inthemoodforcandles.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: "ADMIN" },
    create: {
      name: "Store Admin",
      email: adminEmail.toLowerCase(),
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
    },
  });

  const collections = [
    ["candles", "Candles", "Set the mood", "https://images.pexels.com/photos/6311846/pexels-photo-6311846.jpeg?auto=compress&cs=tinysrgb&w=1200", "Cosy"],
    ["linen-sprays", "Linen sprays", "Freshen your space", "https://images.pexels.com/photos/8247308/pexels-photo-8247308.jpeg?auto=compress&cs=tinysrgb&w=1200", "Relaxing"],
    ["gift-sets", "Gift sets", "Thoughtful. Luxurious.", "https://images.pexels.com/photos/6798396/pexels-photo-6798396.jpeg?auto=compress&cs=tinysrgb&w=1200", "Romantic"],
    ["new-arrivals", "New arrivals", "Fresh scents. New moods.", "https://images.pexels.com/photos/10771904/pexels-photo-10771904.jpeg?auto=compress&cs=tinysrgb&w=1200", "Dreamy"],
    ["the-edit", "The edit", "Curated beauty", "https://images.pexels.com/photos/9765419/pexels-photo-9765419.jpeg?auto=compress&cs=tinysrgb&w=1200", "Playful"],
  ];
  for (let i=0;i<collections.length;i++) {
    const [slug,title,subtitle,imageUrl,mood]=collections[i];
    await prisma.collection.upsert({
      where:{slug},
      update:{title,subtitle,imageUrl,mood,sortOrder:i},
      create:{slug,title,subtitle,imageUrl,mood,sortOrder:i},
    });
  }

  const content = [
    {key:"hero",type:"HERO",title:"Set the mood. Leave a scent worth remembering.",eyebrow:"Candles • Linen sprays • Memories",body:"Beautifully scented candles and linen sprays designed to transform your space, creating a feeling that stays with you.",imageUrl:"/hero.webp",imageAlt:"Warm candlelit room with a scented candle",buttonText:"explore the collection",buttonUrl:"#collection"},
    {key:"story",type:"STORY",title:"More than a candle. It’s a feeling.",body:"It started with a simple love for beautiful scents and the magic they create.\n\nThere’s something special about lighting a candle and watching a space transform. The soft glow, the warmth, and most importantly, the scent that slowly fills the room and becomes part of the moment.\n\nAt In The Mood For Candles, we believe fragrance has the power to create memories. A scent can welcome you into a room, make you feel at home, remind you of someone you love, or take you back to a moment you thought you had forgotten.\n\nBecause when everything else fades, a scent can stay with you.\n\nWe created In The Mood For Candles to bring beautiful fragrances into everyday moments, whether you’re unwinding after a long day, setting the tone for a date night, celebrating yourself, or simply making your home feel a little more like you.\n\nOur candles are made to be experienced, remembered, and associated with the moments that matter.\n\nLight it. Feel it. Remember it."},
    {key:"mission",type:"MISSION",title:"Our mission",body:"To create beautifully scented candles that transform everyday spaces into memorable experiences, bringing warmth, comfort and a little luxury into every moment."},
    {key:"vision",type:"VISION",title:"Our vision",body:"To become a beloved fragrance brand known for creating scents that become part of people’s stories, spaces and most cherished memories."},
    {key:"journal",type:"GENERAL",title:"A scent is a memory.",body:"There is magic in lighting a candle and letting a familiar fragrance fill the room. Scent can take us back to places, people and little moments we thought we had forgotten.\n\nInspired by travel, food and the spaces that stay with us, every candle is made to become part of your story."},
  ];
  for (const item of content) {
    await prisma.siteContent.upsert({where:{key:item.key},update:item,create:item});
  }

  const socials = [
    ["instagram","Instagram","https://www.instagram.com/inthemoodfor_candles"],
    ["tiktok","TikTok","https://www.tiktok.com/@inthemoodfor_candles"],
    ["facebook","Facebook","https://www.facebook.com/inthemoodforcandles"],
  ];
  for (let i=0;i<socials.length;i++) {
    const [platform,label,url]=socials[i];
    await prisma.socialLink.upsert({where:{platform},update:{label,url,sortOrder:i},create:{platform,label,url,sortOrder:i}});
  }

  const products = [
    {sku:"IMC-LAV-001",slug:"lavender",name:"Lavender",mood:"Relaxing",priceUSD:19,description:"Soft lavender and herbal notes made for quiet evenings and slow rituals.",img:"https://images.pexels.com/photos/6755743/pexels-photo-6755743.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:25},
    {sku:"IMC-KPF-002",slug:"kootenay-pine-fig",name:"Kootenay Pine Fig",mood:"Dreamy",priceUSD:19,description:"A peaceful pine-and-fig inspired fragrance with a calm natural character.",img:"https://images.pexels.com/photos/10771904/pexels-photo-10771904.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-FCN-003",slug:"festive-cinnamon",name:"Festive Cinnamon",mood:"Festive",priceUSD:19,description:"Aromatic cinnamon and holiday notes for a warm seasonal glow.",img:"https://images.pexels.com/photos/5782650/pexels-photo-5782650.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-WAM-004",slug:"warm-amber",name:"Warm Amber",mood:"Cosy",priceUSD:19,description:"A warmly lit scented candle with a soft amber atmosphere.",img:"https://images.pexels.com/photos/6311846/pexels-photo-6311846.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-RSP-005",slug:"rosemary-spice",name:"Rosemary Spice",mood:"Playful",priceUSD:19,description:"Bright rosemary and spice notes with a vivid, inviting character.",img:"https://images.pexels.com/photos/5782675/pexels-photo-5782675.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-SSA-006",slug:"spa-serenity",name:"Spa Serenity",mood:"Relaxing",priceUSD:19,description:"A tranquil candle styled for slow self-care and spa-like evenings.",img:"https://images.pexels.com/photos/8247308/pexels-photo-8247308.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-RRU-007",slug:"rustic-retreat",name:"Rustic Retreat",mood:"Romantic",priceUSD:19,description:"A rustic scented candle with warm natural textures and intimate glow.",img:"https://images.pexels.com/photos/9765419/pexels-photo-9765419.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-MRV-008",slug:"mount-revelstoke",name:"Mount Revelstoke",mood:"Energising",priceUSD:19,description:"A fresh nature-inspired scented candle with a crisp outdoor feeling.",img:"https://images.pexels.com/photos/10771942/pexels-photo-10771942.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-AUG-009",slug:"autumn-glow",name:"Autumn Glow",mood:"Tropical",priceUSD:19,description:"Warm botanical notes and glowing candlelight for an inviting escape.",img:"https://images.pexels.com/photos/12480609/pexels-photo-12480609.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
    {sku:"IMC-GRO-010",slug:"ginger-rose",name:"Ginger & Rose",mood:"Romantic",priceUSD:19,description:"Warm ginger, candlelight and rose petals for a romantic atmosphere.",img:"https://images.pexels.com/photos/6798396/pexels-photo-6798396.jpeg?auto=compress&cs=tinysrgb&w=1200",stock:20},
  ];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where:{sku:p.sku},
      update:{name:p.name,slug:p.slug,mood:p.mood,description:p.description,priceUSD:p.priceUSD,stock:p.stock,status:"ACTIVE"},
      create:{sku:p.sku,slug:p.slug,name:p.name,mood:p.mood,description:p.description,priceUSD:p.priceUSD,stock:p.stock,status:"ACTIVE",waxType:"Soy wax",wickType:"Cotton wick",sizeLabel:"Standard jar",scentIntensity:"Medium",category:"Candles"},
    });
    await prisma.productImage.deleteMany({where:{productId:product.id}});
    await prisma.productImage.create({data:{productId:product.id,url:p.img,alt:p.name,sortOrder:0,isPrimary:true}});
  }

  console.log("Seed complete. Admin:", adminEmail);
  console.log("Use ADMIN_PASSWORD from your environment; the fallback is only for first-time development.");
}

main().catch(console.error).finally(()=>prisma.$disconnect());
