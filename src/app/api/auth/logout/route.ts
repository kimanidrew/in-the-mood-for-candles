import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth";
export async function POST() {
  const response=NextResponse.json({ok:true});
  response.cookies.set(COOKIE,"",{httpOnly:true,expires:new Date(0),sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/"});
  return response;
}
