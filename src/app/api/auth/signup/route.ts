import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, COOKIE, createSessionValue } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and a password of at least 8 characters are required." },
        { status: 400 },
      );
    }

    const normalized = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalized } });

    if (exists) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: normalized,
        passwordHash: hashPassword(
          password,
          randomBytes(16).toString("hex"),
        ),
        role: "CUSTOMER",
      },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE, createSessionValue(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
