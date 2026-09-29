import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { skuFromProductName, slugifyProductName } from "@/lib/product-identifiers";

const editable=["name","shortName","shortDescription","description","mood","moodId","category","status","priceUSD","currency","sizeLabel","waxType","wickType","burnTimeHours","scentFamily","scentIntensity","topNotes","middleNotes","baseNotes","ingredients","allergens","careInstructions","vesselMaterial","vesselColor","dimensions","netWeight","stock","featured","seoTitle","seoDescription"];

function productData(body:any){
  const data:any=Object.fromEntries(editable.filter(k=>k in body).map(k=>[k,body[k]]));
  if("priceUSD" in data) data.priceUSD=Number(data.priceUSD||0);
  if("burnTimeHours" in data) data.burnTimeHours=data.burnTimeHours?Number(data.burnTimeHours):null;
  if("stock" in data) data.stock=Number(data.stock||0);
  if("featured" in data) data.featured=Boolean(data.featured);
  return data;
}

async function uniqueIdentifiers(name:string, excludeId?:string){
  const baseSlug=slugifyProductName(name);
  if(!baseSlug) throw new Error("Product name is required.");

  let suffix=1;
  while(true){
    const slug=suffix===1 ? baseSlug : `${baseSlug}-${suffix}`;
    const sku=skuFromProductName(slug);
    const existing=await prisma.product.findFirst({
      where:{
        OR:[{slug},{sku}],
        ...(excludeId ? {NOT:{id:excludeId}} : {}),
      },
      select:{id:true},
    });
    if(!existing) return {slug,sku};
    suffix++;
  }
}

export async function GET(){
  try {
    await requireAdmin();
    return NextResponse.json({
      products:await prisma.product.findMany({
        include:{images:true,variants:true,moodRef:true,collections:{select:{id:true,slug:true,title:true}}},
        orderBy:{updatedAt:"desc"},
      }),
    });
  } catch {
    return NextResponse.json({error:"Unauthorized"},{status:401});
  }
}

export async function POST(request:Request){
  try {
    await requireAdmin();
    const b=await request.json();
    const name=String(b.name??"").trim();
    if(!name||!b.description||!b.mood) {
      return NextResponse.json({error:"Name, description and mood are required."},{status:400});
    }

    const identifiers=await uniqueIdentifiers(name);
    const collectionIds=Array.isArray(b.collectionIds) ? b.collectionIds.filter(Boolean).map(String) : [];
    const product=await prisma.product.create({
      data:{
        ...productData(b),
        ...identifiers,
        collections:{connect:collectionIds.map((id:string)=>({id})),},
        images:{create:(b.images||[]).filter(Boolean).map((url:string,i:number)=>({url,alt:name,sortOrder:i,isPrimary:i===0}))},
      },
      include:{images:true,variants:true},
    });
    return NextResponse.json({product});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error ? error.message : "Unable to create product."},{status:500});
  }
}

export async function PUT(request:Request){
  try {
    await requireAdmin();
    const b=await request.json();
    const existing=await prisma.product.findUnique({where:{id:String(b.id)},select:{id:true,name:true}});
    if(!existing) return NextResponse.json({error:"Product not found."},{status:404});

    const name=String(b.name??"").trim();
    if(!name||!b.description||!b.mood) {
      return NextResponse.json({error:"Name, description and mood are required."},{status:400});
    }

    const identifiers=await uniqueIdentifiers(name, existing.id);
    const collectionIds=Array.isArray(b.collectionIds) ? b.collectionIds.filter(Boolean).map(String) : [];
    const product=await prisma.product.update({
      where:{id:existing.id},
      data:{...productData(b),...identifiers,collections:{set:collectionIds.map((id:string)=>({id}))}},
    });

    if(Array.isArray(b.images)){
      await prisma.productImage.deleteMany({where:{productId:existing.id}});
      await prisma.productImage.createMany({
        data:b.images.filter(Boolean).map((url:string,i:number)=>({
          productId:existing.id,url,alt:product.name,sortOrder:i,isPrimary:i===0,
        })),
      });
    }
    return NextResponse.json({product});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error ? error.message : "Unable to update product."},{status:500});
  }
}

export async function DELETE(request:Request){
  try {
    await requireAdmin();
    const {id}=await request.json();
    await prisma.product.delete({where:{id}});
    return NextResponse.json({ok:true});
  } catch {
    return NextResponse.json({error:"Unable to delete product."},{status:500});
  }
}
